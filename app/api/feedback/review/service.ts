import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------
export interface ReviewRow {
  id: string
  user_id: string
  username: string
  rating: number
  struggles_solved: string
  routine_improvement: string
  completed_more: string
  part_of_routine: string
  recommend_to_others: string
  additional_feedback: string | null
  created_at: string
}

export interface FormattedReview {
  id: string
  username: string
  rating: number
  strugglesSolved: string
  routineImprovement: string
  completedMore: string
  partOfRoutine: string
  recommendToOthers: string
  additionalFeedback: string | null
  createdAt: string
}

export interface CreateReviewInput {
  username: string
  rating: number
  struggles_solved: string
  routine_improvement: string
  completed_more: string
  part_of_routine: string
  recommend_to_others: string
  additional_feedback?: string
}

// ---------- Format ----------
export function formatReview(row: ReviewRow): FormattedReview {
  return {
    id: row.id,
    username: row.username,
    rating: row.rating,
    strugglesSolved: row.struggles_solved,
    routineImprovement: row.routine_improvement,
    completedMore: row.completed_more,
    partOfRoutine: row.part_of_routine,
    recommendToOthers: row.recommend_to_others,
    additionalFeedback: row.additional_feedback,
    createdAt: row.created_at,
  }
}

// ---------- Operations ----------
export const insertReview = async (
  supabase: SupabaseClient,
  userId: string,
  data: CreateReviewInput
) => {
  return supabase
    .from('reviews')
    .insert([
      {
        user_id: userId,
        username: data.username,
        rating: data.rating,
        struggles_solved: data.struggles_solved,
        routine_improvement: data.routine_improvement,
        completed_more: data.completed_more,
        part_of_routine: data.part_of_routine,
        recommend_to_others: data.recommend_to_others,
        additional_feedback: data.additional_feedback || null,
      },
    ])
    .select()
    .single()
}
