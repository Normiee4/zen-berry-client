import { NextResponse } from 'next/server'
import * as analyticsService from '@/app/api/analytics/service'
import { resolveUser } from '@/lib/auth-helpers'

export async function getAnalyticsSummary(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
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
          lifetimeTasks: 0,
          lifetimeCycles: 0,
        },
        { status: 200 }
      )
    }

    const [statsResult, todayTasksCompleted, lifetimeTasksCompleted, mitsCompleted, peakHours, totalFocusMinutes, breaksTaken, lastBreak] = await Promise.all([
      analyticsService.fetchTodayStats(supabase, userId),
      analyticsService.fetchTodayTasksCompleted(supabase, userId),
      analyticsService.fetchLifetimeTasksCompleted(supabase, userId),
      analyticsService.fetchMITCount(supabase, userId),
      analyticsService.fetchPeakHours(supabase, userId),
      analyticsService.fetchTodayFocusMinutes(supabase, userId),
      analyticsService.fetchTodayBreaks(supabase, userId),
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
          tasksCompleted: todayTasksCompleted.count,
          mitsCompleted: mitsCompleted.count,
          streak: statsResult?.data?.streak_maintained ?? 0,
          totalFocusMinutes,
          breakCount: breaksTaken,
        },
        peakHours,
        hoursSinceBreak,
        lifetimeTasks: lifetimeTasksCompleted.count,
        lifetimeCycles: 0,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Analytics summary error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
