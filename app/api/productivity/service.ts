import { getToday, getDaysAgo } from '@/lib/date-utils'
export { getToday, getDaysAgo }
import type { SupabaseClient } from "@supabase/supabase-js"



// ---------- Today Stats ----------
export const fetchTodayStats = async (supabase: SupabaseClient, userId: string) => {
  return supabase
    .from("daily_stats")
    .select("daily_pomodoro, daily_task_completed, streak_maintained")
    .eq("user_id", userId)
    .eq("date", getToday())
    .maybeSingle()
}

export const fetchTodayTasksCompleted = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("complete_at", "is", null)
    .gte("complete_at", today)
  return count ?? 0
}

export const fetchTodayMITsCompleted = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("type", "MIT")
    .not("complete_at", "is", null)
    .gte("complete_at", today)
  return count ?? 0
}

export const fetchTodayFocusMinutes = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { data } = await supabase
    .from("session_logs")
    .select("duration_minutes")
    .eq("user_id", userId)
    .eq("was_break", false)
    .gte("completed_at", today)
  if (!data) return 0
  return data.reduce((sum, row) => sum + row.duration_minutes, 0)
}

export const fetchTodayBreaks = async (supabase: SupabaseClient, userId: string) => {
  const today = getToday()
  const { count } = await supabase
    .from("session_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("was_break", true)
    .gte("completed_at", today)
  return count ?? 0
}

// ---------- Lifetime Stats ----------
export const fetchLifetimeTaskCount = async (supabase: SupabaseClient, userId: string) => {
  const { count } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .not("complete_at", "is", null)
  return count ?? 0
}

export const fetchLifetimePomodoroCount = async (supabase: SupabaseClient, userId: string) => {
  const { data } = await supabase
    .from("daily_stats")
    .select("daily_pomodoro")
    .eq("user_id", userId)
  if (!data || data.length === 0) return 0
  return data.reduce((sum, row) => sum + (row.daily_pomodoro ?? 0), 0)
}

export const fetchLifetimeFocusMinutes = async (supabase: SupabaseClient, userId: string) => {
  const { data } = await supabase
    .from("session_logs")
    .select("duration_minutes")
    .eq("user_id", userId)
    .eq("was_break", false)
  if (!data || data.length === 0) return 0
  return data.reduce((sum, row) => sum + row.duration_minutes, 0)
}

export const fetchLifetimeSessionCount = async (supabase: SupabaseClient, userId: string) => {
  const { count } = await supabase
    .from("session_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("was_break", false)
  return count ?? 0
}

// ---------- Weekly History ----------
export interface DailyStatRow {
  date: string
  daily_pomodoro: number
  daily_task_completed: number
}

export const fetchDailyStatsRange = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) => {
  return supabase
    .from("daily_stats")
    .select("date, daily_pomodoro, daily_task_completed")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true })
}

export interface SessionRow {
  completed_at: string
  duration_minutes: number
}

export const fetchSessionLogsRange = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) => {
  return supabase
    .from("session_logs")
    .select("completed_at, duration_minutes")
    .eq("user_id", userId)
    .eq("was_break", false)
    .gte("completed_at", startDate)
    .lt("completed_at", endDate)
}

// ---------- Active Days (for consistency) ----------
export const fetchActiveDaysInRange = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
) => {
  // Count distinct dates from session_logs in range
  const { data: sessionDates } = await supabase
    .from("session_logs")
    .select("completed_at")
    .eq("user_id", userId)
    .gte("completed_at", startDate)
    .lte("completed_at", endDate + "T23:59:59")

  // Count distinct dates from daily_stats in range
  const { data: statsDates } = await supabase
    .from("daily_stats")
    .select("date")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)

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

// ---------- Peak Hours ----------
export interface PeakHourRow {
  hour_slot: number
  pomodoros_completed: number
}

export const fetchPeakHours = async (
  supabase: SupabaseClient,
  userId: string
): Promise<{ start: number; end: number; avgPomodoros: number } | null> => {
  const sevenDaysAgo = getDaysAgo(7)

  const { data, error } = await supabase
    .from("daily_activity_log")
    .select("hour_slot, pomodoros_completed")
    .eq("user_id", userId)
    .gte("date", sevenDaysAgo)

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

// ---------- Week-over-Week Comparison ----------
export const fetchWeekTotalStats = async (
  supabase: SupabaseClient,
  userId: string,
  startDate: string,
  endDate: string
): Promise<{ pomodoros: number; tasks: number; focusMinutes: number }> => {
  const { data: statsData } = await supabase
    .from("daily_stats")
    .select("daily_pomodoro, daily_task_completed")
    .eq("user_id", userId)
    .gte("date", startDate)
    .lte("date", endDate)

  const pomodoros = statsData?.reduce((sum, row) => sum + (row.daily_pomodoro ?? 0), 0) ?? 0
  const tasks = statsData?.reduce((sum, row) => sum + (row.daily_task_completed ?? 0), 0) ?? 0

  const { data: sessionData } = await supabase
    .from("session_logs")
    .select("duration_minutes")
    .eq("user_id", userId)
    .eq("was_break", false)
    .gte("completed_at", startDate)
    .lt("completed_at", endDate + "T23:59:59")

  const focusMinutes = sessionData?.reduce((sum, row) => sum + row.duration_minutes, 0) ?? 0

  return { pomodoros, tasks, focusMinutes }
}
