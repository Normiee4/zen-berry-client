import { NextResponse } from 'next/server'
import * as aiService from '@/app/api/ai/review/service'
import * as productivityService from '@/app/api/productivity/service'
import { resolveUser } from '@/lib/auth-helpers'

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export async function generateReview(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimitCheck = await aiService.checkHourlyRateLimit(supabase, userId)
    if (rateLimitCheck.error) {
      return NextResponse.json(
        { error: rateLimitCheck.error.message },
        { status: 429 }
      )
    }

    const today = productivityService.getToday()
    const sevenDaysAgo = productivityService.getDaysAgo(7)
    const daysAgo6 = productivityService.getDaysAgo(6)
    const daysAgo13 = productivityService.getDaysAgo(13)
    const currStart = daysAgo6
    const currEnd = today
    const prevStart = daysAgo13
    const prevEnd = productivityService.getDaysAgo(7)

    const [
      statsResult,
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
      lastBreak,
      peakDays,
      mostUsedPreset,
    ] = await Promise.all([
      productivityService.fetchTodayStats(supabase, userId),
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
      aiService.getLastBreakTime(supabase, userId),
      aiService.fetchPeakDays(supabase, userId),
      aiService.fetchMostUsedPreset(supabase, userId),
    ])

    let hoursSinceBreak: number | null = null
    if (lastBreak) {
      hoursSinceBreak = (Date.now() - new Date(lastBreak).getTime()) / (1000 * 60 * 60)
    }

    const stats = statsResult?.data || { daily_pomodoro: 0, daily_task_completed: 0, streak_maintained: 0 }
    const pomodoros = stats.daily_pomodoro || 0
    const tasksCompleted = stats.daily_task_completed || 0
    const streak = stats.streak_maintained || 0
    const cyclesTotal = lifetimeSessionCount

    // Build weekly history
    const statsMap = new Map(
      (statsRangeResult.data ?? []).map((s) => [s.date, s])
    )
    const focusMinutesByDate = new Map<string, number>()
    for (const row of (sessionRangeResult.data ?? [])) {
      const date = row.completed_at.slice(0, 10)
      focusMinutesByDate.set(date, (focusMinutesByDate.get(date) ?? 0) + row.duration_minutes)
    }

    const weeklyHistory: Array<{
      date: string; day: string; pomodoros: number; tasks: number; focusMinutes: number
    }> = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().slice(0, 10)
      const dayName = DAY_NAMES[date.getDay()]
      const dayStats = statsMap.get(dateStr)
      weeklyHistory.push({
        date: dateStr,
        day: dayName,
        pomodoros: dayStats?.daily_pomodoro ?? 0,
        tasks: dayStats?.daily_task_completed ?? 0,
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

    const consistencyRate = Math.round((activeDays7 / 7) * 100) / 100

    const calcChange = (current: number, previous: number): number => {
      if (previous === 0 && current === 0) return 0
      if (previous === 0) return 100
      return Math.round(((current - previous) / previous) * 100)
    }
    const comparison = {
      pomodorosChange: calcChange(currentWeekStats.pomodoros, previousWeekStats.pomodoros),
      tasksChange: calcChange(currentWeekStats.tasks, previousWeekStats.tasks),
      focusChange: calcChange(currentWeekStats.focusMinutes, previousWeekStats.focusMinutes),
    }

    const hasAnyData = lifetimeSessionCount > 0 || lifetimeTaskCount > 0 || weeklyTotals.pomodoros > 0

    if (!hasAnyData) {
      const noData = aiService.getNoDataResponse()
      return NextResponse.json(
        {
          insight: noData.insight,
          suggestion: noData.suggestion,
          stats: { pomodoros: 0, tasks: 0, peakHours: null, restAnalysis: null },
        },
        { status: 200 }
      )
    }

    const prompt = aiService.generatePrompt({
      pomodoros,
      totalFocusMinutes: todayFocusMinutes,
      tasksCompleted,
      breaksTaken: todayBreaks,
      streak,
      peakHours,
      hoursSinceBreak,
      weeklyHistory,
      weeklyTotals,
      comparison,
      consistencyRate,
      lifetime: {
        totalTasks: lifetimeTaskCount,
        totalPomodoros: lifetimePomodoroCount,
        totalFocusMinutes: lifetimeFocusMinutes,
        totalSessions: lifetimeSessionCount,
      },
    })

    const result = await aiService.callGeminiAPI(prompt, {
      pomodoros,
      tasksCompleted,
      totalFocusMinutes: todayFocusMinutes,
      streak,
      consistencyRate,
      comparison,
    })

    if (hoursSinceBreak !== null && hoursSinceBreak > 3) {
      const restMsg = `Rest now, apprentice. You've been going for ${Math.floor(hoursSinceBreak)} hours without a break. `
      result.insight = restMsg + result.insight
    }

    const isFirstReview = cyclesTotal === pomodoros && pomodoros <= 1
    const milestone = aiService.detectMilestone(
      cyclesTotal,
      streak,
      pomodoros,
      tasksCompleted,
      isFirstReview
    )

    const peakHoursNumeric = peakHours?.start ?? 0

    const productivityLevel = pomodoros > 0
      ? Math.min(1, tasksCompleted / pomodoros) * streak * 0.1 + 0.5
      : null

    await aiService.persistInsight(supabase, {
      user_id: userId,
      insight_date: aiService.getToday(),
      productivity_level: productivityLevel ? Math.round(productivityLevel * 100) / 100 : null,
      consistency_rate: consistencyRate,
      cycles_total: cyclesTotal,
      peak_hours: peakHoursNumeric,
      peak_days: peakDays,
      insight_message: result.insight,
      recommendation: result.suggestion,
      milestone,
      models_used: { gemini: process.env.GEMINI_MODEL || 'gemini-2.0-flash' },
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

    const formatPeakHoursStr = (peak: typeof peakHours): string | null => {
      if (!peak) return null
      const formatHour = (h: number) => {
        const suffix = h >= 12 ? 'PM' : 'AM'
        const hour12 = h % 12 || 12
        return `${hour12}${suffix}`
      }
      return `${formatHour(peak.start)}-${formatHour(peak.end)}`
    }

    return NextResponse.json(
      {
        insight: result.insight,
        suggestion: result.suggestion,
        milestone,
        warning,
        stats: {
          pomodoros,
          tasks: tasksCompleted,
          peakHours: formatPeakHoursStr(peakHours),
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
