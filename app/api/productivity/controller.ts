import { NextRequest, NextResponse } from "next/server"
import { resolveUser } from "@/lib/auth-helpers"
import * as productivityService from "@/app/api/productivity/service"

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export async function getProductivity(request: NextRequest) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json(
        {
          today: {
            pomodorosCompleted: 0,
            tasksCompleted: 0,
            mitsCompleted: 0,
            focusMinutes: 0,
            breakCount: 0,
          },
          streak: 0,
          lifetime: {
            totalTasks: 0,
            totalPomodoros: 0,
            totalFocusMinutes: 0,
            totalSessions: 0,
          },
          weeklyHistory: [],
          weeklyTotals: { pomodoros: 0, tasks: 0, focusMinutes: 0 },
          peakHours: null,
          consistency: { activeDays: 0, totalDays: 7, rate: 0 },
          comparison: null,
        },
        { status: 200 }
      )
    }

    const today = productivityService.getToday()
    const sevenDaysAgo = productivityService.getDaysAgo(7)
    const daysAgo6 = productivityService.getDaysAgo(6)
    const daysAgo13 = productivityService.getDaysAgo(13)

    // Current week: last 7 days (daysAgo6 through today)
    const currStart = daysAgo6
    const currEnd = today

    // Previous week: 7 days before current week
    const prevStart = daysAgo13
    const prevEnd = productivityService.getDaysAgo(7)

    const [
      statsResult,
      todayTasksCompleted,
      todayMITsCompleted,
      todayFocusMinutes,
      todayBreaks,
      lifetimeTaskCount,
      lifetimePomodoroCount,
      lifetimeFocusMinutes,
      lifetimeSessionCount,
      statsRangeResult,
      sessionRangeResult,
      activeDays7,
      peakHours,
      currentWeekStats,
      previousWeekStats,
    ] = await Promise.all([
      productivityService.fetchTodayStats(supabase, userId),
      productivityService.fetchTodayTasksCompleted(supabase, userId),
      productivityService.fetchTodayMITsCompleted(supabase, userId),
      productivityService.fetchTodayFocusMinutes(supabase, userId),
      productivityService.fetchTodayBreaks(supabase, userId),
      productivityService.fetchLifetimeTaskCount(supabase, userId),
      productivityService.fetchLifetimePomodoroCount(supabase, userId),
      productivityService.fetchLifetimeFocusMinutes(supabase, userId),
      productivityService.fetchLifetimeSessionCount(supabase, userId),
      productivityService.fetchDailyStatsRange(supabase, userId, sevenDaysAgo, today),
      productivityService.fetchSessionLogsRange(supabase, userId, sevenDaysAgo, today + "T23:59:59"),
      productivityService.fetchActiveDaysInRange(supabase, userId, daysAgo6, today),
      productivityService.fetchPeakHours(supabase, userId),
      productivityService.fetchWeekTotalStats(supabase, userId, currStart, currEnd),
      productivityService.fetchWeekTotalStats(supabase, userId, prevStart, prevEnd),
    ])

    // Build weekly history
    const statsMap = new Map(
      (statsRangeResult.data ?? []).map((s: productivityService.DailyStatRow) => [s.date, s])
    )

    const focusMinutesByDate = new Map<string, number>()
    for (const row of (sessionRangeResult.data ?? []) as productivityService.SessionRow[]) {
      const date = row.completed_at.slice(0, 10)
      focusMinutesByDate.set(date, (focusMinutesByDate.get(date) ?? 0) + row.duration_minutes)
    }

    const weeklyHistory: Array<{
      date: string
      day: string
      pomodoros: number
      tasks: number
      focusMinutes: number
    }> = []

    const currentDate = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().slice(0, 10)
      const dayName = DAY_NAMES[date.getDay()]
      const stats = statsMap.get(dateStr)

      weeklyHistory.push({
        date: dateStr,
        day: dayName,
        pomodoros: stats?.daily_pomodoro ?? 0,
        tasks: stats?.daily_task_completed ?? 0,
        focusMinutes: focusMinutesByDate.get(dateStr) ?? 0,
      })
    }

    const weeklyTotals = weeklyHistory.reduce(
      (acc, d) => ({
        pomodoros: acc.pomodoros + d.pomodoros,
        tasks: acc.tasks + d.tasks,
        focusMinutes: acc.focusMinutes + d.focusMinutes,
      }),
      { pomodoros: 0, tasks: 0, focusMinutes: 0 }
    )

    // Consistency rate
    const totalDays = 7
    const consistency = {
      activeDays: activeDays7,
      totalDays,
      rate: Math.round((activeDays7 / totalDays) * 100),
    }

    // Week-over-week comparison
    const comparison = (() => {
      const calcChange = (current: number, previous: number): number => {
        if (previous === 0 && current === 0) return 0
        if (previous === 0) return 100
        return Math.round(((current - previous) / previous) * 100)
      }

      return {
        pomodorosChange: calcChange(currentWeekStats.pomodoros, previousWeekStats.pomodoros),
        tasksChange: calcChange(currentWeekStats.tasks, previousWeekStats.tasks),
        focusChange: calcChange(currentWeekStats.focusMinutes, previousWeekStats.focusMinutes),
      }
    })()

    return NextResponse.json(
      {
        today: {
          pomodorosCompleted: statsResult?.data?.daily_pomodoro ?? 0,
          tasksCompleted: todayTasksCompleted,
          mitsCompleted: todayMITsCompleted,
          focusMinutes: todayFocusMinutes,
          breakCount: todayBreaks,
        },
        streak: statsResult?.data?.streak_maintained ?? 0,
        lifetime: {
          totalTasks: lifetimeTaskCount,
          totalPomodoros: lifetimePomodoroCount,
          totalFocusMinutes: lifetimeFocusMinutes,
          totalSessions: lifetimeSessionCount,
        },
        weeklyHistory,
        weeklyTotals,
        peakHours,
        consistency,
        comparison,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Productivity error", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
