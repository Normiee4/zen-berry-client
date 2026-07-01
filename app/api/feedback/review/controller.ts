import { NextResponse } from 'next/server'
import { z } from 'zod'
import * as reviewService from '@/app/api/feedback/review/service'
import { resolveUser } from '@/lib/auth-helpers'

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  struggles_solved: z.string().min(1, 'Struggles solved is required'),
  routine_improvement: z.string().min(1, 'Routine improvement is required'),
  completed_more: z.string().min(1, 'Completed more is required'),
  part_of_routine: z.string().min(1, 'Part of routine is required'),
  recommend_to_others: z.string().min(1, 'Recommend to others is required'),
  additional_feedback: z.string().optional(),
})

export async function handleCreateReview(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = createReviewSchema.parse(body)

    // Get the user's username from the users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('username')
      .eq('user_id', userId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const review = await reviewService.insertReview(supabase, userId, {
      username: userData.username,
      rating: parsed.rating,
      struggles_solved: parsed.struggles_solved,
      routine_improvement: parsed.routine_improvement,
      completed_more: parsed.completed_more,
      part_of_routine: parsed.part_of_routine,
      recommend_to_others: parsed.recommend_to_others,
      additional_feedback: parsed.additional_feedback,
    })

    if (review.error) {
      return NextResponse.json({ error: review.error.message }, { status: 400 })
    }

    return NextResponse.json(reviewService.formatReview(review.data), { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message, details: error.issues }, { status: 400 })
    }
    console.error('Review POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
