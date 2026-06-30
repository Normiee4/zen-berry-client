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

export interface CreateReportInput {
  issue: string
  explanation: string
  suggestions: string
  bug_detail?: string
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
export const insertReport = async (
  supabase: SupabaseClient,
  userId: string,
  data: CreateReportInput
) => {
  return supabase
    .from('reports')
    .insert([
      {
        user_id: userId,
        issue: data.issue,
        explanation: data.explanation,
        suggestions: data.suggestions,
        bug_detail: data.bug_detail || null,
      },
    ])
    .select()
    .single()
}
