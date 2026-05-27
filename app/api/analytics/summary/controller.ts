import { NextResponse } from 'next/server'
import * as analyticsService from '@/app/api/analytics/summary/service'

export async function getAnalyticsSummary(request: Request) {
  try {
    const supabase = analyticsService.createSupabaseClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null
    if (!userId) {
      return NextResponse.json(
        {
          today: {
            pomodorosCompleted: 0,
            tasksCompleted: 0,
            mitsCompleted: 0,
            streak: 0,
            totalFocusMinutes: 0,
            breakCount: 0,
          },
          peakHours: null,
        },
        { status: 200 }
      )
    }

    const [statsResult, mitsCompleted, peakHours, totalFocusMinutes, breaksTaken, lastBreak] = await Promise.all([
      analyticsService.fetchTodayStats(supabase, userId),
      analyticsService.fetchMITCount(supabase, userId),
      analyticsService.calculatePeakHours(supabase, userId),
      analyticsService.calculateTotalFocusMinutes(supabase, userId),
      analyticsService.calculateBreaksTaken(supabase, userId),
      analyticsService.getLastBreakTime(supabase, userId),
    ])

    let hoursSinceBreak: number | null = null
    if (lastBreak) {
      hoursSinceBreak = (Date.now() - new Date(lastBreak).getTime()) / (1000 * 60 * 60)
    }

    return NextResponse.json(
      {
        today: {
          pomodorosCompleted: statsResult?.data?.daily_pomodoro ?? 0,
          tasksCompleted: statsResult?.data?.daily_task_completed ?? 0,
          mitsCompleted: mitsCompleted.count,
          streak: statsResult?.data?.streak_maintained ?? 0,
          totalFocusMinutes,
          breakCount: breaksTaken,
        },
        peakHours,
        hoursSinceBreak,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Analytics summary error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}