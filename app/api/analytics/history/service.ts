import { getDaysAgo } from '@/lib/date-utils'
export { getDaysAgo }
import type { SupabaseClient } from '@supabase/supabase-js'

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
    .select('complete_at')
    .eq('user_id', userId)
    .eq('type', 'MIT')
    .not('complete_at', 'is', null)
    .gte('complete_at', startDate)
    .lt('complete_at', endDate)
}