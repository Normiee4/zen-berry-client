import { getToday, getDaysAgo } from '@/lib/date-utils'
export { getToday, getDaysAgo }
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------
export interface DailyStatRow {
  date: string
  daily_pomodoro: number
  daily_task_completed: number
  streak_maintained: number
}

export interface SessionRow {
  completed_at: string
  duration_minutes: number
  was_break?: boolean
}

export interface PeakHourRow {
  hour_slot: number
  pomodoros_completed: number
}

// ---------- Today Stats ----------
export const fetchTodayStats = async (supabase: SupabaseClient, userId: string) => {
  return supabase
    .from('daily_stats')
    .select('daily_pomodoro, daily_task_completed, streak_maintained, date')
    .eq('user_id', userId)
    .eq('date', getToday())
    .maybeSingle()
}

export const fetchTodayTasksCompleted = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('complete_at', 'is', null)
    .gte('complete_at', today)

  return { count: count ?? 0, error }
}

export const fetchTodayFocusMinutes = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { data } = await supabase
    .from('session_logs')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('was_break', false)
    .gte('completed_at', today)
  if (!data) return 0
  return data.reduce((sum, row) => sum + row.duration_minutes, 0)
}

export const fetchTodayBreaks = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { count } = await supabase
    .from('session_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('was_break', true)
    .gte('completed_at', today)
  return count ?? 0
}

export const fetchTodayBreakMinutes = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { data } = await supabase
    .from('session_logs')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('was_break', true)
    .gte('completed_at', today)
  if (!data) return 0
  return data.reduce((sum, row) => sum + row.duration_minutes, 0)
}

export const fetchTodayMITsCompleted = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'MIT')
    .not('complete_at', 'is', null)
    .gte('complete_at', today)
  return count ?? 0
}

// ---------- MIT ----------
export const fetchMITCount = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'MIT')
    .not('complete_at', 'is', null)
    .gte('complete_at', today)

  return { count: count ?? 0, error }
}

// ---------- Lifetime Stats ----------
export const fetchLifetimeTaskCount = async (supabase: SupabaseClient, userId: string) => {
  const { count } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('complete_at', 'is', null)
  return count ?? 0
}

export const fetchLifetimeTasksCompleted = async (supabase: SupabaseClient, userId: string) => {
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('complete_at', 'is', null)

  return { count: count ?? 0, error }
}

export const fetchLifetimePomodoroCount = async (supabase: SupabaseClient, userId: string) => {
  const { data } = await supabase
    .from('daily_stats')
    .select('daily_pomodoro')
    .eq('user_id', userId)
  if (!data || data.length === 0) return 0
  return data.reduce((sum, row) => sum + (row.daily_pomodoro ?? 0), 0)
}

export const fetchLifetimeFocusMinutes = async (supabase: SupabaseClient, userId: string) => {
  const { data } = await supabase
    .from('session_logs')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('was_break', false)
  if (!data || data.length === 0) return 0
  return data.reduce((sum, row) => sum + row.duration_minutes, 0)
}

export const fetchLifetimeSessionCount = async (supabase: SupabaseClient, userId: string) => {
  const { count } = await supabase
    .from('session_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('was_break', false)
  return count ?? 0
}

// ---------- Range Queries ----------
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

export const fetchActiveDaysInRange = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) => {
  const { data: sessionDates } = await supabase
    .from('session_logs')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', startDate)
    .lte('completed_at', endDate + 'T23:59:59')

  const { data: statsDates } = await supabase
    .from('daily_stats')
    .select('date')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

  const activeDates = new Set<string>()
  if (sessionDates) {
    for (const row of sessionDates) {
      const date = row.completed_at.slice(0, 10)
      activeDates.add(date)
    }
  }
  if (statsDates) {
    for (const row of statsDates) {
      activeDates.add(row.date)
    }
  }
  return activeDates.size
}

export const fetchCompletedMITs = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) => {
  return supabase
    .from('tasks')
    .select('complete_at')
    .eq('user_id', userId)
    .eq('type', 'MIT')
    .not('complete_at', 'is', null)
    .gte('complete_at', startDate)
    .lt('complete_at', endDate)
}

// ---------- Peak Hours ----------
export const fetchPeakHours = async (
  supabase: SupabaseClient,
  userId: string
): Promise<{ start: number; end: number; avgPomodoros: number } | null> => {
  const sevenDaysAgo = getDaysAgo(7)

  const { data, error } = await supabase
    .from('daily_activity_log')
    .select('hour_slot, pomodoros_completed')
    .eq('user_id', userId)
    .gte('date', sevenDaysAgo)

  if (error || !data || data.length === 0) {
    return null
  }

  const hourlyMap = new Map<number, number>()
  for (const row of data) {
    const current = hourlyMap.get(row.hour_slot) ?? 0
    hourlyMap.set(row.hour_slot, current + row.pomodoros_completed)
  }

  let bestHour = 0
  let maxPomodoros = 0
  for (const [hour, count] of hourlyMap) {
    if (count > maxPomodoros) {
      maxPomodoros = count
      bestHour = hour
    }
  }

  if (maxPomodoros === 0) return null

  return {
    start: bestHour,
    end: bestHour + 2,
    avgPomodoros: Math.round((maxPomodoros / 7) * 10) / 10,
  }
}

export const fetchPeakDays = async (supabase: SupabaseClient, userId: string): Promise<string[]> => {
  const sevenDaysAgo = getDaysAgo(7)

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

// ---------- Week Comparison ----------
export const fetchWeekTotalStats = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ pomodoros: number; tasks: number; focusMinutes: number }> => {
  const { data: statsData } = await supabase
    .from('daily_stats')
    .select('daily_pomodoro, daily_task_completed')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)

  const pomodoros = statsData?.reduce((sum, row) => sum + (row.daily_pomodoro ?? 0), 0) ?? 0
  const tasks = statsData?.reduce((sum, row) => sum + (row.daily_task_completed ?? 0), 0) ?? 0

  const { data: sessionData } = await supabase
    .from('session_logs')
    .select('duration_minutes')
    .eq('user_id', userId)
    .eq('was_break', false)
    .gte('completed_at', startDate)
    .lt('completed_at', endDate + 'T23:59:59')

  const focusMinutes = sessionData?.reduce((sum, row) => sum + row.duration_minutes, 0) ?? 0

  return { pomodoros, tasks, focusMinutes }
}

// ---------- Misc ----------
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
