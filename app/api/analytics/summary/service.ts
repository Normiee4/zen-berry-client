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
          /* no-op */
        },
        remove() {
          /* no-op */
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

// ---------- Analytics Operations ----------
export const fetchTodayStats = async (supabase: SupabaseClient, userId: string) => {
  return supabase
    .from('daily_stats')
    .select('daily_pomodoro, daily_task_completed, streak_maintained, date')
    .eq('user_id', userId)
    .eq('date', getToday())
    .maybeSingle()
}

export const fetchMITCount = async (supabase: SupabaseClient, userId: string) => {
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'MIT')
    .not('complete_at', 'is', null)

  return { count: count ?? 0, error }
}

export const calculatePeakHours = async (supabase: SupabaseClient, userId: string) => {
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

  return {
    start: bestHour,
    end: bestHour + 2,
    avgPomodoros: maxPomodoros / 7,
  }
}

export const calculateTotalFocusMinutes = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()

  const { data, error } = await supabase
    .from('session_logs')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('was_break', false)
    .gte('completed_at', today)

  if (error || !data) return 0

  return data.reduce((sum, row) => sum + row.duration_minutes, 0)
}

export const calculateBreaksTaken = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()

  const { count, error } = await supabase
    .from('session_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('was_break', true)
    .gte('completed_at', today)

  return error ? 0 : count ?? 0
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