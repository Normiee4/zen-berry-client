import { NextResponse } from 'next/server'
import * as historyService from '@/app/api/analytics/history/service'
import { getUserIdFromRequest } from '@/lib/auth-helpers'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export async function getAnalyticsHistory(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ data: [], weeklyTotals: null }, { status: 200 })
    }

    const supabase = historyService.createSupabaseClient(request)

    const url = new URL(request.url)
    const period = url.searchParams.get('period') || 'week'
    const limit = parseInt(url.searchParams.get('limit') || '7')

    const days = period === 'month' ? 30 : 7
    const endDate = new Date().toISOString().slice(0, 10)
    const startDate = historyService.getDaysAgo(days)

    const [statsResult, sessionsResult, mitsResult] = await Promise.all([
      historyService.fetchDailyStatsRange(supabase, userId, startDate, endDate),
      historyService.fetchSessionLogsRange(supabase, userId, startDate, endDate + 'T23:59:59'),
      historyService.fetchCompletedMITs(supabase, userId, startDate, endDate + 'T23:59:59'),
    ])

    const statsMap = new Map(
      (statsResult.data || []).map(s => [s.date, s])
    )

    const mitsByDate = new Map<string, number>()
    ;(mitsResult.data || []).forEach(m => {
      if (m.completed_at) {
        const date = m.completed_at.slice(0, 10)
        mitsByDate.set(date, (mitsByDate.get(date) || 0) + 1)
      }
    })

    const focusMinutesByDate = new Map<string, number>()
    ;(sessionsResult.data || []).forEach(s => {
      if (s.completed_at) {
        const date = s.completed_at.slice(0, 10)
        focusMinutesByDate.set(date, (focusMinutesByDate.get(date) || 0) + (s.duration_minutes || 0))
      }
    })

    const data: Array<{
      date: string
      day: string
      pomodoros: number
      tasks: number
      mits: number
      focusMinutes: number
    }> = []

    const currentDate = new Date()
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().slice(0, 10)
      const dayName = DAY_NAMES[date.getDay()]

      const stats = statsMap.get(dateStr)

      data.push({
        date: dateStr,
        day: dayName,
        pomodoros: stats?.daily_pomodoro || 0,
        tasks: stats?.daily_task_completed || 0,
        mits: mitsByDate.get(dateStr) || 0,
        focusMinutes: focusMinutesByDate.get(dateStr) || 0,
      })
    }

    const weeklyTotals = data.reduce(
      (acc, d) => ({
        pomodoros: acc.pomodoros + d.pomodoros,
        tasks: acc.tasks + d.tasks,
        focusMinutes: acc.focusMinutes + d.focusMinutes,
      }),
      { pomodoros: 0, tasks: 0, focusMinutes: 0 }
    )

    return NextResponse.json(
      {
        data: data.slice(-limit),
        weeklyTotals,
        period,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Analytics history error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}