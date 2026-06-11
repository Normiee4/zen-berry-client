import { createRouteHandlerClient } from "@/lib/supabase-server"
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Cookie Helper ----------
export const createSupabaseClient = (request: Request) =>
  createRouteHandlerClient(request)

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
    .select('complete_at')
    .eq('user_id', userId)
    .eq('type', 'MIT')
    .not('complete_at', 'is', null)
    .gte('complete_at', startDate)
    .lt('complete_at', endDate)
}