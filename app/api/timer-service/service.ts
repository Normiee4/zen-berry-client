// app/api/timer-service/service.ts
import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------
export interface TimerPresetRow {
  preset_id: string
  preset_name: string
  focus_duration: number
  break_duration: number
  is_default: boolean
  created_at: string
}

interface FormattedPreset {
  id: string
  name: string
  focusMinutes: number
  breakMinutes: number
  isDefault: boolean
}

// ---------- Helpers ----------
export const getToday = (): string => new Date().toISOString().slice(0, 10)
export const getYesterday = (): string =>
  new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

export const daysBetween = (date1: string, date2: string): number =>
  Math.round((new Date(date2).getTime() - new Date(date1).getTime()) / (24 * 60 * 60 * 1000))

export const formatPreset = (row: TimerPresetRow): FormattedPreset => ({
  id: String(row.preset_id),
  name: row.preset_name,
  focusMinutes: row.focus_duration,
  breakMinutes: row.break_duration,
  isDefault: Boolean(row.is_default ?? false),
})

// ---------- Cookie & Client ----------
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

// ---------- Data Operations ----------
// supabaseClient is used here as param as supabase
// userId: string is another param that we will use as variable to compare
export const fetchPresets = async (supabase: SupabaseClient, userId: string) => {
  return supabase
    .from('timer_presets')
    .select('preset_id, preset_name, focus_duration, break_duration, is_default')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
}

export const fetchTodayStats = async (supabase: SupabaseClient, userId: string) => {
  return supabase
    .from('daily_stats')
    .select('streak_maintained, daily_pomodoro, daily_task_completed, date')
    .eq('user_id', userId)
    .eq('date', getToday())
    .maybeSingle()
}

export const createPreset = async (
  supabase: SupabaseClient,
  userId: string,
  preset: { name: string; focusMinutes: number; breakMinutes: number }
) => {
  return supabase
    .from('timer_presets')
    .insert([
      {
        user_id: userId,
        preset_name: preset.name,
        focus_duration: preset.focusMinutes,
        break_duration: preset.breakMinutes,
        is_default: false,
      },
    ])
    .select()
    .single()
}

export const updatePreset = async (
  supabase: SupabaseClient,
  presetId: string,
  updates: { name?: string; focusMinutes?: number; breakMinutes?: number }
) => {
  const dbUpdates: Record<string, string | number> = {}
  if (updates.name !== undefined) dbUpdates.preset_name = updates.name
  if (updates.focusMinutes !== undefined) dbUpdates.focus_duration = updates.focusMinutes
  if (updates.breakMinutes !== undefined) dbUpdates.break_duration = updates.breakMinutes

  return supabase
    .from('timer_presets')
    .update(dbUpdates)
    .eq('preset_id', presetId)
    .select()
    .single()
}

export const deletePreset = async (
  supabase: SupabaseClient,
  presetId: string
) => {
  return supabase
    .from('timer_presets')
    .delete()
    .eq('preset_id', presetId)
}

export const recordPomodoro = async (supabase: SupabaseClient, userId: string) => {
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
  const tasksCompleted = todayStats?.daily_task_completed ?? latestStats?.daily_task_completed ?? 0

  let currentStreak: number

  if (!latestStats) {
    currentStreak = 1
  } else {
    const lastDate = latestStats.date.slice(0, 10)
    const gap = daysBetween(lastDate, today)

    if (gap === 0) {
      currentStreak = latestStats.streak_maintained ?? 1
    } else if (gap === 1) {
      currentStreak = (latestStats.streak_maintained ?? 0) + 1
    } else if (gap <= 4) {
      currentStreak = latestStats.streak_maintained ?? 1
    } else {
      currentStreak = 1
    }
  }

  const { data, error: upsertError } = await supabase
    .from('daily_stats')
    .upsert(
      {
        user_id: userId,
        date: today,
        daily_pomodoro: pomodorosToday,
        daily_task_completed: tasksCompleted,
        streak_maintained: currentStreak,
      },
      { onConflict: 'user_id,date' }
    )
    .select()
    .single()

  if (upsertError) return { error: upsertError }
  return { data }
}