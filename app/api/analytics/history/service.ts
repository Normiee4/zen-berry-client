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
export const getDaysAgo = (days: number): string => {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export const getDayName = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

// ---------- History Operations ----------
export const fetchDailyStatsRange = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) => {
  return supabase
    .from('daily_stats')
    .select('date, daily_pomodoro, daily_task_completed, streak_maintained')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
}

export const fetchSessionLogsRange = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) => {
  return supabase
    .from('session_logs')
    .select('completed_at, was_break, duration_minutes')
    .eq('user_id', userId)
    .eq('was_break', false)
    .gte('completed_at', startDate)
    .lt('completed_at', endDate)
}

export const fetchCompletedMITs = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) => {
  return supabase
    .from('tasks')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('is_mit', true)
    .eq('completed', true)
    .gte('completed_at', startDate)
    .lt('completed_at', endDate)
}