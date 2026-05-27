import { NextResponse } from 'next/server'
import * as sessionService from '@/app/api/sessions/service'
import { resolveUser } from '@/lib/auth-helpers'

export async function recordSession(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    const body = await request.json()
    const { action, durationMinutes, wasBreak, presetUsed } = body

    if (action !== 'recordCompletion') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const results = await Promise.all([
      sessionService.insertSessionLog(supabase, userId, {
        durationMinutes: durationMinutes || 25,
        wasBreak: wasBreak || false,
        presetUsed: presetUsed || 'classic',
      }),
      sessionService.recordPomodoroInDailyStats(supabase, userId),
      wasBreak 
        ? Promise.resolve({ data: null }) 
        : sessionService.incrementHourlyActivity(supabase, userId, true),
    ])

    const [sessionResult, statsResult] = results

    if (sessionResult.error) {
      return NextResponse.json({ error: sessionResult.error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        session: sessionResult.data,
        streak: statsResult.data ? {
          currentStreak: statsResult.data.streak_maintained,
          pomodorosToday: statsResult.data.daily_pomodoro,
          dailyTasksCompleted: statsResult.data.daily_task_completed,
          lastPomodoroDate: statsResult.data.date,
        } : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function getTodayStats(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ stats: null }, { status: 200 })
    }


    const statsResult = await sessionService.getTodayStats(supabase, userId)

    if (statsResult.error) {
      return NextResponse.json({ error: statsResult.error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        stats: statsResult.data
          ? {
              currentStreak: statsResult.data.streak_maintained,
              pomodorosToday: statsResult.data.daily_pomodoro,
              dailyTasksCompleted: statsResult.data.daily_task_completed,
              lastPomodoroDate: statsResult.data.date,
            }
          : null,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session GET error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}