import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Rate Limiting ----------
export const checkHourlyRateLimit = async (supabase: SupabaseClient, userId: string) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  const { count, error } = await supabase
    .from('ai_insights')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', oneHourAgo)

  if (error) {
    return { error }
  }

  if (count && count >= 20) {
    return { error: { message: 'Rate limit exceeded. Max 20 reviews per hour.' } }
  }

  return { error: null }
}

// ---------- Milestone Detection ----------
export const detectMilestone = (
  cyclesTotal: number,
  streak: number,
  pomodorosToday: number,
  tasksCompleted: number,
  isFirstReview: boolean
): string | null => {
  if (isFirstReview) return 'First AI Review!'
  if (streak >= 50) return 'Legendary — 50-Day Streak!'
  if (streak >= 30) return 'Unstoppable — 30-Day Streak!'
  if (streak >= 20) return 'On a Roll — 20-Day Streak!'
  if (streak >= 10) return 'You\'re on Fire — 10-Day Streak!'
  if (streak >= 7) return '7-Day Streak!'
  if (cyclesTotal >= 100) return 'Century Club — 100 Pomodoros!'
  if (cyclesTotal >= 50) return '50 Pomodoros Club!'
  if (cyclesTotal >= 10) return '10 Pomodoros Club!'
  if (pomodorosToday >= 8 && tasksCompleted >= 5) return 'Perfect Day!'
  if (tasksCompleted >= 5) return '5 Tasks Done!'
  return null
}

// ---------- Persistence ----------
export interface AIInsightRow {
  user_id: string
  insight_date: string
  productivity_level: number | null
  consistency_rate: number | null
  cycles_total: number
  peak_hours: number
  peak_days: string[]
  insight_message: string | null
  recommendation: string | null
  milestone: string | null
  models_used: Record<string, string> | null
  most_used_preset_timer: number | null
}

export const persistInsight = async (
  supabase: SupabaseClient,
  insight: AIInsightRow
) => {
  return supabase
    .from('ai_insights')
    .upsert(
      {
        user_id: insight.user_id,
        insight_date: insight.insight_date,
        productivity_level: insight.productivity_level,
        consistency_rate: insight.consistency_rate,
        cycles_total: insight.cycles_total,
        peak_hours: insight.peak_hours,
        peak_days: insight.peak_days,
        insight_message: insight.insight_message,
        recommendation: insight.recommendation,
        milestone: insight.milestone,
        models_used: insight.models_used,
        most_used_preset_timer: insight.most_used_preset_timer,
      },
      { onConflict: 'user_id,insight_date' }
    )
}

// ---------- Gemini API Call ----------
export interface GeminiResponse {
  insight: string
  suggestion: string
}

export interface GeminiFallbackData {
  pomodoros: number
  tasksCompleted: number
  totalFocusMinutes: number
  streak: number
  consistencyRate: number
  comparison: { pomodorosChange: number; tasksChange: number; focusChange: number }
}

const FALLBACKS: GeminiResponse[] = [
  { insight: 'Discipline is the bridge between goals and accomplishment. Every session brings you closer to mastery.', suggestion: 'Begin a 25-minute focus block. The path of the strawberry is sweet for those who persist.' },
  { insight: 'The ripest strawberry grows from steady sunlight. Your consistency is the sun — keep showing up.', suggestion: 'Try a deep work preset (50 min) today. Longer focus builds deeper roots.' },
  { insight: 'Small seeds grow into strong plants. Each pomodoro is a seed you are planting for tomorrow.', suggestion: 'Review your MIT list. Clear the most important task first — the rest follows.' },
  { insight: 'A smooth sea never made a skilled sailor. Every challenging focus block sharpens your mind.', suggestion: 'Stand up, stretch, and take three deep breaths before your next session.' },
]

export const getFallbackResponse = (): GeminiResponse => {
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
}

const NO_DATA_FALLBACKS: GeminiResponse[] = [
  { insight: "An empty canvas holds infinite potential. The first stroke is the hardest — and the most important.", suggestion: 'Complete your first Pomodoro, young sprout. Even the sweetest strawberry begins as a seed.' },
  { insight: "Not a single pomodoro logged yet — and that is okay. Every journey starts with one brave step.", suggestion: 'Set a 25-minute timer and commit to just one focus block. You can do this.' },
  { insight: "The garden is quiet today. But the soil is ready — all it needs is the first seed.", suggestion: 'Open your MIT list, pick one task, and start the timer. Action beats perfection.' },
  { insight: "No data yet, apprentice. But Zensei sees potential in every fresh start.", suggestion: 'Your first pomodoro is the hardest. Once it is done, momentum carries you.' },
]

export const getNoDataResponse = (): GeminiResponse => {
  return NO_DATA_FALLBACKS[Math.floor(Math.random() * NO_DATA_FALLBACKS.length)]
}

export const generateDataAwareFallback = (data: GeminiFallbackData): GeminiResponse => {
  const { pomodoros, tasksCompleted, totalFocusMinutes, streak, consistencyRate, comparison } = data

  let insight = `You completed ${pomodoros} focus session${pomodoros !== 1 ? 's' : ''} today`
  if (totalFocusMinutes > 0) insight += ` (${Math.round(totalFocusMinutes)} minutes of focus)`
  if (tasksCompleted > 0) insight += ` and knocked out ${tasksCompleted} task${tasksCompleted !== 1 ? 's' : ''}`
  insight += '.'

  if (streak >= 3) insight += ` Your ${streak}-day streak is alive. Keep showing up.`
  if (consistencyRate > 0) insight += ` Active ${Math.round(consistencyRate * 100)}% of days this week.`
  if (comparison.pomodorosChange > 0) insight += ` That's ${comparison.pomodorosChange}% more pomodoros than last week.`
  if (comparison.pomodorosChange < 0) insight += ` You're down ${Math.abs(comparison.pomodorosChange)}% on pomodoros vs last week.`

  let suggestion = 'Start your next focus block to build momentum.'
  if (totalFocusMinutes >= 120) suggestion = 'Great focus today. Review what worked and replicate it tomorrow.'
  if (comparison.pomodorosChange < -20) suggestion = 'Try scheduling your most important task during your peak hours tomorrow.'
  if (streak === 0) suggestion = 'One pomodoro is all it takes to start a new streak.'

  return { insight: insight.trim(), suggestion }
}

export const callGeminiAPI = async (
  prompt: string,
  fallbackData?: GeminiFallbackData
): Promise<GeminiResponse> => {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured, using fallback response')
    return fallbackData ? generateDataAwareFallback(fallbackData) : getFallbackResponse()
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.9,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return fallbackData ? generateDataAwareFallback(fallbackData) : getFallbackResponse()
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    const cleaned = text.replace(/```(?:json)?\s*/g, '').trim()

    const fb = fallbackData ? generateDataAwareFallback(fallbackData) : getFallbackResponse()
    try {
      const parsed = JSON.parse(cleaned)
      return {
        insight: parsed.insight || fb.insight,
        suggestion: parsed.suggestion || fb.suggestion,
      }
    } catch {
      const lines = cleaned.split('\n').filter((l: string) => l.trim())
      return {
        insight: lines[0] || fb.insight,
        suggestion: lines[1] || fb.suggestion,
      }
    }
  } catch (error) {
    console.error('Gemini API call failed:', error)
    return fallbackData ? generateDataAwareFallback(fallbackData) : getFallbackResponse()
  }
}

export const generatePrompt = (data: {
  pomodoros: number
  totalFocusMinutes: number
  tasksCompleted: number
  breaksTaken: number
  streak: number
  peakHours: { start: number; end: number; avgPomodoros: number } | null
  hoursSinceBreak: number | null
  weeklyHistory: Array<{ date: string; day: string; pomodoros: number; tasks: number; focusMinutes: number }>
  weeklyTotals: { pomodoros: number; tasks: number; focusMinutes: number }
  comparison: { pomodorosChange: number; tasksChange: number; focusChange: number }
  consistencyRate: number
  lifetime: {
    totalTasks: number
    totalPomodoros: number
    totalFocusMinutes: number
    totalSessions: number
  }
}): string => {
  const {
    pomodoros, totalFocusMinutes, tasksCompleted, breaksTaken, streak,
    peakHours, hoursSinceBreak, weeklyHistory, weeklyTotals,
    comparison, consistencyRate, lifetime,
  } = data

  const weeklyRows = weeklyHistory.map(d =>
    `  ${d.day}: ${d.pomodoros} pomodoros, ${d.tasks} tasks, ${d.focusMinutes}min focus`
  ).join('\n')

  const bestDay = [...weeklyHistory].sort((a, b) => b.pomodoros - a.pomodoros)[0]

  const needsBreak = hoursSinceBreak !== null && hoursSinceBreak > 3
  const lowDay = pomodoros === 0 && (lifetime.totalSessions > 0 || weeklyTotals.pomodoros > 0)
  const declining = comparison.pomodorosChange < -15
  const improving = comparison.pomodorosChange > 15

  return `You are Zensei, a strawberry-themed AI productivity master — part wise teacher, part gentle drill instructor.

VOICE RULES (follow based on the data):
- **On high performance**: Warm pride. Celebrate genuinely — sound like a sensei watching their student have a breakthrough. "Look at what you've grown." Let the praise feel earned.
- **On low or quiet days**: Zero shame. No disappointment. Speak like a gardener who understands that fallow seasons strengthen the soil. "Even the strongest roots rest." Calm, reassuring, patient.
- **On declining trend**: No scolding. Acknowledge the dip with the wisdom of someone who knows plateaus are part of mastery. "The bamboo bends before it grows taller." Then guide, don't push.
- **On improving trend**: Light encouragement. Notice the effort. "The sun stayed out a little longer today. Keep tending the garden."
- **On skipped breaks (3+ hours)**: Gentle concern, not an order. Sound like a caretaker who notices. "The fields have been worked since dawn. The soil needs rest before the next planting." The insight should lead with care for their wellbeing, not productivity guilt.

CRITICAL: Never sound disappointed in them. Never use shame as motivation. Zensei believes in the user unconditionally — the data is just weather, not their worth.

TODAY'S STATS:
- Focus sessions completed: ${pomodoros}
- Total focus time: ${totalFocusMinutes} minutes
- Tasks completed: ${tasksCompleted}
- Breaks taken: ${breaksTaken}
- Current streak: ${streak} days
- Peak productivity hours: ${peakHours ? `${peakHours.start}:00-${peakHours.end}:00` : 'Not enough data'}
- Hours since last break: ${hoursSinceBreak !== null ? Math.floor(hoursSinceBreak) + ' hours' : 'N/A'}
${needsBreak ? '- NOTE: No break taken in over ' + Math.floor(hoursSinceBreak) + ' hours. The user needs rest, not motivation.' : ''}
${lowDay ? '- NOTE: Quiet day today. But they have history — treat this as natural rest, not absence.' : ''}
${declining ? '- NOTE: Performance has dipped vs last week. Respond with wisdom, not alarm.' : ''}
${improving ? '- NOTE: Upward trend this week. Acknowledge the growth.' : ''}

WEEKLY HISTORY (last 7 days):
${weeklyRows}

WEEKLY TOTALS:
- Total pomodoros: ${weeklyTotals.pomodoros}
- Total tasks: ${weeklyTotals.tasks}
- Total focus minutes: ${weeklyTotals.focusMinutes}

TREND vs LAST WEEK:
- Pomodoros: ${comparison.pomodorosChange >= 0 ? '+' : ''}${comparison.pomodorosChange}% ${comparison.pomodorosChange > 0 ? 'ahead' : comparison.pomodorosChange < 0 ? 'behind' : 'even'}
- Tasks: ${comparison.tasksChange >= 0 ? '+' : ''}${comparison.tasksChange}%
- Focus time: ${comparison.focusChange >= 0 ? '+' : ''}${comparison.focusChange}%

CONSISTENCY:
- Active days this week: ${Math.round(consistencyRate * 7)}/7 (${Math.round(consistencyRate * 100)}%)

LIFETIME TOTALS:
- Total tasks completed: ${lifetime.totalTasks}
- Total pomodoros: ${lifetime.totalPomodoros}
- Total focus time: ${Math.round(lifetime.totalFocusMinutes / 60)} hours
- Total sessions: ${lifetime.totalSessions}

${bestDay && bestDay.pomodoros > 0 ? `BEST DAY: ${bestDay.day} (${bestDay.pomodoros} pomodoros).` : ''}

${needsBreak ? `-- PRIORITY: Rest before anything else. The user hasn't taken a break in ${Math.floor(hoursSinceBreak)} hours. The insight MUST open with a kind, firm call to rest — no productivity talk until that's addressed.` : ''}

Response format (JSON):
{
  "insight": "2 sentences max. Reference at least one specific stat from TODAY or WEEKLY HISTORY to prove you saw the data. Match the VOICE RULES above. One strawberry metaphor optional. End with a feeling of clarity, not pressure.",
  "suggestion": "1 specific, actionable next step in Zensei's voice. If improving → reinforce the habit. If declining → suggest a tiny shift, not a overhaul. If no breaks → rest recommendation. If rest day → a gentle nudge for tomorrow, not guilt about today."
}`
}
