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
  const yesterday = getYesterday()

  const { data: existingStats, error: existingError } = await supabase
    .from('daily_stats')
    .select('stat_id, daily_pomodoro, daily_task_completed, streak_maintained, date')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  if (existingError) {
    return { error: existingError }
  }

  let currentStreak = existingStats?.streak_maintained ?? 0
  let pomodorosToday = existingStats?.daily_pomodoro ?? 0

  if (existingStats) {
    if (existingStats.date === today) {
      currentStreak = existingStats.streak_maintained
      pomodorosToday = existingStats.daily_pomodoro + 1
    } else if (existingStats.date === yesterday) {
      currentStreak = existingStats.streak_maintained + 1
      pomodorosToday = 1
    } else {
      currentStreak = 1
      pomodorosToday = 1
    }
  } else {
    currentStreak = 1
    pomodorosToday = 1
  }

  const { data, error: upsertError } = await supabase
    .from('daily_stats')
    .upsert(
      {
        user_id: userId,
        date: today,
        daily_pomodoro: pomodorosToday,
        daily_task_completed: existingStats?.daily_task_completed ?? 0,
        streak_maintained: currentStreak,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  if (upsertError) {
    return { error: upsertError }
  }

  return { data }
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