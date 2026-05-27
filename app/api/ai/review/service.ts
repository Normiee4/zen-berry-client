import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Cookie Helper ----------
const getCookieValue = (request: Request, name: string): string | null => {
  const requestCookies = (request as unknown as {
    cookies?: { get(name: string): { value: string } | undefined }
  }).cookies
  if (requestCookies?.get) {
    return requestCookies.get(name)?.value ?? null
  }

  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookiePair = cookieHeader
    .split(';')
    .map(cookie => cookie.trim().split('='))
    .find(([cookieName]) => cookieName === name)

  return cookiePair ? cookiePair[1] : null
}

export const createSupabaseClient = (request: Request) =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookieValue(request, name)
        },
        set() {
          throw new Error('Server route does not support setting cookies.')
        },
        remove() {
          throw new Error('Server route does not support removing cookies.')
        },
      },
    }
  )

// ---------- Auth ----------
export const getAuthenticatedUser = async (supabase: SupabaseClient) => {
  return supabase.auth.getUser()
}

// ---------- Helpers ----------
export const getToday = (): string => new Date().toISOString().slice(0, 10)

// ---------- Data Fetching ----------
export const fetchTodayStats = async (supabase: SupabaseClient, userId: string) => {
  return supabase
    .from('daily_stats')
    .select('daily_pomodoro, daily_task_completed, streak_maintained, ai_review_count')
    .eq('user_id', userId)
    .eq('date', getToday())
    .maybeSingle()
}

export const fetchPeakHours = async (supabase: SupabaseClient, userId: string) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('daily_activity_log')
    .select('hour_slot, pomodoros_completed')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo)

  if (error || !data || data.length === 0) {
    return null
  }

  const hourlyMap = new Map<number, number>()
  data.forEach((row) => {
    const current = hourlyMap.get(row.hour_slot) || 0
    hourlyMap.set(row.hour_slot, current + row.pomodoros_completed)
  })

  let bestHour = 0
  let maxPomodoros = 0
  hourlyMap.forEach((count, hour) => {
    if (count > maxPomodoros) {
      maxPomodoros = count
      bestHour = hour
    }
  })

  if (maxPomodoros === 0) return null

  const formatHour = (h: number) => {
    const suffix = h >= 12 ? 'PM' : 'AM'
    const hour12 = h % 12 || 12
    return `${hour12}${suffix}`
  }

  return `${formatHour(bestHour)}-${formatHour(bestHour + 2)}`
}

export const getLastBreakTime = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from('session_logs')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('was_break', true)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data.completed_at
}

export const fetchTodaySessionDetails = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()

  const { data, error } = await supabase
    .from('session_logs')
    .select('completed_at, was_break, duration_minutes')
    .eq('user_id', userId)
    .gte('completed_at', today)

  return { data: data || [], error }
}

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

// ---------- Persistence Metrics ----------

export const fetchCyclesTotal = async (supabase: SupabaseClient, userId: string): Promise<number> => {
  const { count, error } = await supabase
    .from('session_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('was_break', false)

  if (error || count === null) return 0
  return count
}

export const fetchConsistencyRate = async (supabase: SupabaseClient, userId: string): Promise<number> => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('daily_stats')
    .select('date')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo)
    .gt('daily_pomodoro', 0)

  if (error || !data) return 0

  return Math.round((data.length / 7) * 100) / 100
}

export const fetchPeakDays = async (supabase: SupabaseClient, userId: string): Promise<string[]> => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('daily_activity_log')
    .select('date, pomodoros_completed')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo)

  if (error || !data) return []

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const dayTotals = new Map<string, number>()

  data.forEach((row) => {
    const dayName = dayNames[new Date(row.date + 'T00:00:00').getDay()]
    const current = dayTotals.get(dayName) || 0
    dayTotals.set(dayName, current + row.pomodoros_completed)
  })

  const sorted = [...dayTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([day]) => day)

  return sorted
}

export const fetchMostUsedPreset = async (supabase: SupabaseClient, userId: string): Promise<number | null> => {
  const { data, error } = await supabase
    .from('session_logs')
    .select('preset_used')
    .eq('user_id', userId)
    .not('preset_used', 'is', null)
    .order('completed_at', { ascending: false })

  if (error || !data || data.length === 0) return null

  const freq = new Map<string, number>()
  data.forEach((row) => {
    const key = String(row.preset_used)
    freq.set(key, (freq.get(key) || 0) + 1)
  })

  const mostUsed = [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0]

  const { data: preset } = await supabase
    .from('timer_presets')
    .select('preset_id')
    .eq('user_id', userId)
    .eq('preset_name', mostUsed)
    .maybeSingle()

  return preset?.preset_id ?? null
}

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

export const FALLBACK_RESPONSE: GeminiResponse = {
  insight: 'Discipline is the bridge between goals and accomplishment. Every session brings you closer to mastery.',
  suggestion: 'Begin a 25-minute focus block. The path of the strawberry is sweet for those who persist.',
}

export const NO_DATA_RESPONSE: GeminiResponse = {
  insight: "An empty canvas holds infinite potential. The first stroke is the hardest — and the most important.",
  suggestion: 'Complete your first Pomodoro, young sprout. Even the sweetest strawberry begins as a seed.',
}

export const callGeminiAPI = async (prompt: string): Promise<GeminiResponse> => {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

  if (!apiKey) {
    console.warn('GEMINI_API_KEY not configured, using fallback response')
    return FALLBACK_RESPONSE
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
            maxOutputTokens: 200,
            topP: 0.9,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      return FALLBACK_RESPONSE
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    try {
      const parsed = JSON.parse(text)
      return {
        insight: parsed.insight || FALLBACK_RESPONSE.insight,
        suggestion: parsed.suggestion || FALLBACK_RESPONSE.suggestion,
      }
    } catch {
      const lines = text.split('\n').filter((l: string) => l.trim())
      return {
        insight: lines[0] || FALLBACK_RESPONSE.insight,
        suggestion: lines[1] || FALLBACK_RESPONSE.suggestion,
      }
    }
  } catch (error) {
    console.error('Gemini API call failed:', error)
    return FALLBACK_RESPONSE
  }
}

export const generatePrompt = (data: {
  pomodoros: number
  totalFocusMinutes: number
  tasksCompleted: number
  breaksTaken: number
  peakHours: string | null
  hoursSinceBreak: number | null
}): string => {
  const { pomodoros, totalFocusMinutes, tasksCompleted, breaksTaken, peakHours, hoursSinceBreak } = data

  const restWarning = hoursSinceBreak !== null && hoursSinceBreak > 3
    ? `\n⚠️ The young sprout has not taken a single break in over ${Math.floor(hoursSinceBreak)} hours. This is not sustainable. A withering plant cannot bear fruit.`
    : hoursSinceBreak !== null && hoursSinceBreak > 2
      ? `\n⚠️ Note: ${Math.floor(hoursSinceBreak)} hours since last break.`
      : ''
  const needsBreak = hoursSinceBreak !== null && hoursSinceBreak > 3

  return `You are Zensei, a strawberry-themed AI productivity master — part wise teacher, part gentle drill instructor. Your voice is warm yet commanding, like a sensei who has cultivated focus for centuries. You refer to the user as "young sprout" or "apprentice". You occasionally weave in strawberry metaphors (ripeness, sweetness, seeds, harvest). You are direct but never harsh — you push because you believe in their potential.

Analyze the user's productivity data and deliver a short, punchy insight like a master addressing their student.

Today's Stats:
- Focus sessions completed: ${pomodoros}
- Total focus time: ${totalFocusMinutes} minutes
- Tasks completed: ${tasksCompleted}
- Breaks taken: ${breaksTaken}
- Peak productivity hours: ${peakHours || 'Not enough data'}
- Hours since last break: ${hoursSinceBreak !== null ? Math.floor(hoursSinceBreak) + ' hours' : 'N/A'}${restWarning}

${needsBreak ? 'IMPORTANT: The user badly needs a break. Make your first sentence a kind but firm order to rest before continuing. The insight should lead with rest, not productivity.' : ''}

Response format (JSON):
{
  "insight": "2 sentences max. Calm, warm, master-to-student tone. Can use one strawberry metaphor. Keep the user relaxed — motivation should feel like a deep breath, not a sprint.",
  "suggestion": "1 specific, actionable recommendation in Zensei's teaching voice."
}`
}
