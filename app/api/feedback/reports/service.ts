import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------
export interface ReportRow {
  id: string
  user_id: string
  issue: string
  explanation: string
  suggestions: string
  bug_detail: string | null
  created_at: string
}

export interface FormattedReport {
  id: string
  userId: string
  issue: string
  explanation: string
  suggestions: string
  bugDetail: string | null
  createdAt: string
}

// ---------- Format ----------
export function formatReport(row: ReportRow): FormattedReport {
  return {
    id: row.id,
    userId: row.user_id,
    issue: row.issue,
    explanation: row.explanation,
    suggestions: row.suggestions,
    bugDetail: row.bug_detail,
    createdAt: row.created_at,
  }
}

// ---------- Operations ----------
export const fetchAllReports = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ReportRow[]
}

export const fetchUserReports = async (supabase: SupabaseClient, userId: string) => {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ReportRow[]
}
