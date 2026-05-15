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

export const incrementAIReviewCount = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()

  const { data: existing } = await supabase
    .from('daily_stats')
    .select('ai_review_count')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  const currentCount = existing?.ai_review_count || 0

  if (currentCount >= 10) {
    return { error: { message: 'Rate limit exceeded. Max 10 reviews per day.' } }
  }

  return supabase
    .from('daily_stats')
    .upsert(
      {
        user_id: userId,
        date: today,
        ai_review_count: currentCount + 1,
      },
      { onConflict: 'user_id,date' }
    )
}

// ---------- Gemini API Call ----------
interface GeminiResponse {
  insight: string
  suggestion: string
}

const FALLBACK_RESPONSE: GeminiResponse = {
  insight: 'Every focus session counts! Keep the momentum going.',
  suggestion: 'Start a 25-minute focus timer to build your streak.',
}

const NO_DATA_RESPONSE: GeminiResponse = {
  insight: "Start a focus session to unlock your daily insights!",
  suggestion: 'Complete your first Pomodoro to see personalized productivity tips.',
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
    ? `\n⚠️ Note: User has not taken a break in over ${Math.floor(hoursSinceBreak)} hours.`
    : ''

  return `You are Zen Berry, a friendly and encouraging productivity assistant. 
Analyze the user's productivity data and provide a short, punchy insight.

Today's Stats:
- Focus sessions completed: ${pomodoros}
- Total focus time: ${totalFocusMinutes} minutes
- Tasks completed: ${tasksCompleted}
- Breaks taken: ${breaksTaken}
- Peak productivity hours: ${peakHours || 'Not enough data'}
- Hours since last break: ${hoursSinceBreak !== null ? Math.floor(hoursSinceBreak) + ' hours' : 'N/A'}${restWarning}

Response format (JSON):
{
  "insight": "2 sentences max, motivational and warm",
  "suggestion": "1 specific, actionable recommendation"
}`
}