import { createRouteHandlerClient } from "@/lib/supabase-server"
import type { SupabaseClient } from '@supabase/supabase-js'

export const createSupabaseClient = (request: Request) =>
  createRouteHandlerClient(request)

export interface LatestInsightResponse {
  insight_id: number
  insight_message: string | null
  recommendation: string | null
  milestone: string | null
  productivity_level: number | null
  consistency_rate: number | null
  cycles_total: number
  peak_hours: number
  peak_days: string[]
  created_at: string
}

export const fetchLatestInsight = async (
  supabase: SupabaseClient,
  userId: string
): Promise<LatestInsightResponse | null> => {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('insight_id, insight_message, recommendation, milestone, productivity_level, consistency_rate, cycles_total, peak_hours, peak_days, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data
}
