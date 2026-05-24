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

    const [statsResult, peakHours, lastBreak, sessionDetails, cyclesTotal, consistencyRate, peakDays, mostUsedPreset] = await Promise.all([
      aiService.fetchTodayStats(supabase, user.id),
      aiService.fetchPeakHours(supabase, user.id),
      aiService.getLastBreakTime(supabase, user.id),
      aiService.fetchTodaySessionDetails(supabase, user.id),
      aiService.fetchCyclesTotal(supabase, user.id),
      aiService.fetchConsistencyRate(supabase, user.id),
      aiService.fetchPeakDays(supabase, user.id),
      aiService.fetchMostUsedPreset(supabase, user.id),
    ])

    let hoursSinceBreak: number | null = null
    if (lastBreak) {
      hoursSinceBreak = (Date.now() - new Date(lastBreak).getTime()) / (1000 * 60 * 60)
    }

    const stats = statsResult?.data || { daily_pomodoro: 0, daily_task_completed: 0, streak_maintained: 0 }
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

    const isFirstReview = cyclesTotal === pomodoros && pomodoros <= 1
    const milestone = aiService.detectMilestone(
      cyclesTotal,
      stats.streak_maintained || 0,
      pomodoros,
      stats.daily_task_completed || 0,
      isFirstReview
    )

    const peakHoursNumeric = (() => {
      if (!peakHours) return 0
      const match = peakHours.match(/(\d+)/)
      return match ? parseInt(match[1], 10) : 0
    })()

    const productivityLevel = pomodoros > 0
      ? Math.min(1, (stats.daily_task_completed || 0) / pomodoros) * (stats.streak_maintained || 0) * 0.1 + 0.5
      : null

    const modelsUsed: Record<string, string> = {
      gemini: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    }

    await aiService.persistInsight(supabase, {
      user_id: user.id,
      insight_date: aiService.getToday(),
      productivity_level: productivityLevel ? Math.round(productivityLevel * 100) / 100 : null,
      consistency_rate: consistencyRate,
      cycles_total: cyclesTotal,
      peak_hours: peakHoursNumeric,
      peak_days: peakDays,
      insight_message: result.insight,
      recommendation: result.suggestion,
      milestone,
      models_used: modelsUsed,
      most_used_preset_timer: mostUsedPreset,
    })

    const restAnalysis = hoursSinceBreak !== null && hoursSinceBreak > 3
      ? `No break taken for ${Math.floor(hoursSinceBreak)}+ hours. Consider taking a short break.`
      : hoursSinceBreak !== null
        ? `Last break was ${Math.floor(hoursSinceBreak)} hours ago.`
        : null

    const warning = hoursSinceBreak !== null && hoursSinceBreak > 3
      ? 'You\'ve been going too long without rest. Even the ripest strawberry needs shade. Take a break before your next session.'
      : null

    return NextResponse.json(
      {
        insight: result.insight,
        suggestion: result.suggestion,
        milestone,
        warning,
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
