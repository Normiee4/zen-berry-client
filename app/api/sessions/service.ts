import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------
export interface SessionLogRow {
  session_id: string
  user_id: string
  started_at: string
  completed_at: string | null
  duration_minutes: number
  was_break: boolean
  preset_used: string | null
  created_at: string
}

// ---------- Helpers ----------
export const getToday = (): string => new Date().toISOString().slice(0, 10)

export const getYesterday = (): string =>
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const getCurrentHour = (): number => new Date().getHours()

export const daysBetween = (date1: string, date2: string): number =>
  Math.round((new Date(date2).getTime() - new Date(date1).getTime()) / (24 * 60 * 60 * 1000))

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

// ---------- Session Operations ----------
export const insertSessionLog = async (
  supabase: SupabaseClient,
  userId: string,
  session: {
    durationMinutes: number
    wasBreak: boolean
    presetUsed: string
  }
) => {
  const now = new Date().toISOString()
  return supabase
    .from('session_logs')
    .insert([
      {
        user_id: userId,
        started_at: now,
        completed_at: now,
        duration_minutes: session.durationMinutes,
        was_break: session.wasBreak,
        preset_used: session.presetUsed,
      },
    ])
    .select()
    .single()
}

export const getTodayStats = async (supabase: SupabaseClient, userId: string) => {
  return supabase
    .from('daily_stats')
    .select('streak_maintained, daily_pomodoro, daily_task_completed, date')
    .eq('user_id', userId)
    .eq('date', getToday())
    .maybeSingle()
}

export const recordPomodoroInDailyStats = async (
  supabase: SupabaseClient,
  userId: string
) => {
  const today = getToday()

  const { data: latestStats, error: latestError } = await supabase
    .from('daily_stats')
    .select('date, streak_maintained, daily_task_completed')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) return { error: latestError }

  const { data: todayStats, error: todayError } = await supabase
    .from('daily_stats')
    .select('daily_pomodoro, daily_task_completed')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (todayError) return { error: todayError }

  const pomodorosToday = (todayStats?.daily_pomodoro ?? 0) + 1
  const tasksCompleted = todayStats?.daily_task_completed ?? 0

  let currentStreak: number

  if (!latestStats) {
    currentStreak = 1
  } else {
    const lastDate = latestStats.date.slice(0, 10)
    const gap = daysBetween(lastDate, today)

    if (gap === 0) {
      currentStreak = latestStats.streak_maintained || 1
    } else if (gap === 1) {
      currentStreak = (latestStats.streak_maintained ?? 0) + 1
    } else if (gap <= 4) {
      currentStreak = latestStats.streak_maintained || 1
    } else {
      currentStreak = 1
    }
  }

  const { data, error: statsError } = await upsertDailyStatsSessions(
    supabase, userId, today, pomodorosToday, tasksCompleted, currentStreak
  )

  if (statsError) return { error: statsError }
  return { data }
}

const upsertDailyStatsSessions = async (
  supabase: SupabaseClient,
  userId: string,
  date: string,
  pomodorosToday: number,
  tasksCompleted: number,
  streak: number
) => {
  const { data: existing } = await supabase
    .from('daily_stats')
    .select('stat_id')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()

  if (existing) {
    return supabase
      .from('daily_stats')
      .update({
        daily_pomodoro: pomodorosToday,
        daily_task_completed: tasksCompleted,
        streak_maintained: streak,
      })
      .eq('stat_id', existing.stat_id)
      .select()
      .single()
  }

  return supabase
    .from('daily_stats')
    .insert({
      user_id: userId,
      date,
      daily_pomodoro: pomodorosToday,
      daily_task_completed: tasksCompleted,
      streak_maintained: streak,
    })
    .select()
    .single()
}

export const incrementHourlyActivity = async (
  supabase: SupabaseClient,
  userId: string,
  isPomodoro: boolean
) => {
  const today = getToday()
  const hourSlot = getCurrentHour()
  const column = isPomodoro ? 'pomodoros_completed' : 'tasks_completed'

  const { error } = await supabase.rpc('increment_activity', {
    p_user_id: userId,
    p_date: today,
    p_hour_slot: hourSlot,
    p_is_pomodoro: isPomodoro
  })

  if (error) {
    const { data, error: upsertError } = await supabase
      .from('daily_activity_log')
      .upsert(
        {
          user_id: userId,
          date: today,
          hour_slot: hourSlot,
          [column]: 1,
        },
        { onConflict: 'user_id,date,hour_slot' }
      )
      .select()
      .single()

    if (upsertError) {
      return { error: upsertError }
    }
    return { data }
  }

  return { data: null }
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

  return { data, error }
}