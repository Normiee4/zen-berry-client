// app/api/timer-service/service.ts
import { getToday, daysBetween } from '@/lib/date-utils'
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
export const formatPreset = (row: TimerPresetRow): FormattedPreset => ({
  id: String(row.preset_id),
  name: row.preset_name,
  focusMinutes: row.focus_duration,
  breakMinutes: row.break_duration,
  isDefault: Boolean(row.is_default ?? false),
})

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
    .select('streak_maintained, daily_pomodoro, daily_task_completed, break_count, break_duration, date')
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

export const upsertDailyStats = async (
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

export const recordPomodoro = async (
  supabase: SupabaseClient,
  userId: string,
  session?: { durationMinutes: number; presetUsed?: string }
) => {
  const today = getToday()
  const now = new Date().toISOString()

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

  const { data, error: upsertError } = await upsertDailyStats(
    supabase, userId, today, pomodorosToday, tasksCompleted, currentStreak
  )

  if (upsertError) return { error: upsertError }

  if (session) {
    const { error: sessionError } = await supabase
      .from('session_logs')
      .insert([
        {
          user_id: userId,
          started_at: now,
          completed_at: now,
          duration_minutes: session.durationMinutes,
          was_break: false,
          preset_used: session.presetUsed ?? null,
        },
      ])

    if (sessionError) return { error: sessionError }
  }

  const { error: activityError } = await updateHourlyActivity(supabase, userId, today, 1, 0)

  if (activityError) return { error: activityError }

  return { data }
}

export const recordBreak = async (
  supabase: SupabaseClient,
  userId: string,
  durationMinutes: number,
  presetUsed?: string
) => {
  const now = new Date().toISOString()
  const today = getToday()

  const { error: sessionError } = await supabase.from('session_logs').insert([{
    user_id: userId,
    started_at: now,
    completed_at: now,
    duration_minutes: durationMinutes,
    was_break: true,
    preset_used: presetUsed ?? null,
  }])

  if (sessionError) return { error: sessionError }

  const { data: existing } = await supabase
    .from('daily_stats')
    .select('break_count, break_duration')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle()

  const { error: statsError } = await supabase
    .from('daily_stats')
    .upsert({
      user_id: userId,
      date: today,
      break_count: (existing?.break_count ?? 0) + 1,
      break_duration: (existing?.break_duration ?? 0) + durationMinutes,
    }, { onConflict: 'user_id,date' })

  return { error: statsError }
}

const updateHourlyActivity = async (
  supabase: SupabaseClient,
  userId: string,
  date: string,
  pomodorosCompleted: number,
  tasksCompleted: number
) => {
  const hourSlot = new Date().getHours()
  const { data: existing } = await supabase
    .from('daily_activity_log')
    .select('pomodoros_completed, tasks_completed')
    .eq('user_id', userId)
    .eq('date', date)
    .eq('hour_slot', hourSlot)
    .maybeSingle()

  return supabase.from('daily_activity_log').upsert(
    {
      user_id: userId,
      date,
      hour_slot: hourSlot,
      pomodoros_completed: (existing?.pomodoros_completed ?? 0) + pomodorosCompleted,
      tasks_completed: (existing?.tasks_completed ?? 0) + tasksCompleted,
    },
    {
      onConflict: 'user_id,date,hour_slot',
      ignoreDuplicates: false,
    }
  )
}