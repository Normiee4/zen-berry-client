import { NextResponse } from 'next/server'
import * as aiService from '@/app/api/ai/review/service'

export async function generateReview(request: Request) {
  try {
    const supabase = aiService.createSupabaseClient(request)
    const { data: { user }, error: userError } = await aiService.getAuthenticatedUser(supabase)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitCheck = await aiService.incrementAIReviewCount(supabase, user.id)
    if (rateLimitCheck.error) {
      return NextResponse.json(
        { error: rateLimitCheck.error.message },
        { status: 429 }
      )
    }

    const [statsResult, peakHours, lastBreak, sessionDetails] = await Promise.all([
      aiService.fetchTodayStats(supabase, user.id),
      aiService.fetchPeakHours(supabase, user.id),
      aiService.getLastBreakTime(supabase, user.id),
      aiService.fetchTodaySessionDetails(supabase, user.id),
    ])

    let hoursSinceBreak: number | null = null
    if (lastBreak) {
      hoursSinceBreak = (Date.now() - new Date(lastBreak).getTime()) / (1000 * 60 * 60)
    }

    const stats = statsResult?.data || { daily_pomodoro: 0, daily_task_completed: 0 }
    const totalFocusMinutes = sessionDetails.data
      .filter(s => !s.was_break)
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const breaksTaken = sessionDetails.data.filter(s => s.was_break).length

    const pomodoros = stats.daily_pomodoro || 0

    if (pomodoros === 0) {
      return NextResponse.json(
        {
          insight: "Start a focus session to unlock your daily insights!",
          suggestion: 'Complete your first Pomodoro to see personalized productivity tips.',
          stats: {
            pomodoros: 0,
            tasks: 0,
            peakHours: null,
            restAnalysis: null,
          },
        },
        { status: 200 }
      )
    }

    const prompt = aiService.generatePrompt({
      pomodoros,
      totalFocusMinutes,
      tasksCompleted: stats.daily_task_completed || 0,
      breaksTaken,
      peakHours,
      hoursSinceBreak,
    })

    const result = await aiService.callGeminiAPI(prompt)

    const restAnalysis = hoursSinceBreak !== null && hoursSinceBreak > 3
      ? `No break taken for ${Math.floor(hoursSinceBreak)}+ hours. Consider taking a short break.`
      : hoursSinceBreak !== null
        ? `Last break was ${Math.floor(hoursSinceBreak)} hours ago.`
        : null

    return NextResponse.json(
      {
        insight: result.insight,
        suggestion: result.suggestion,
        stats: {
          pomodoros,
          tasks: stats.daily_task_completed || 0,
          peakHours,
          restAnalysis,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('AI Review error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}