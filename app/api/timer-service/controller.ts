// app/api/timer/timer.controller.ts
import { NextResponse } from 'next/server'
import * as timerService from '@/app/api/timer-service/service'
import { createSupabaseClient } from '@/app/api/timer-service/service'

export async function getTimerData(request: Request) {
  try {
    const supabase = createSupabaseClient(request)
    const { data: { user }, error: userError } = await timerService.getAuthenticatedUser(supabase)  // ✅ fixed

    if (userError || !user) {
      return NextResponse.json(
        {
          presets: [],
          streak: {
            currentStreak: 0,
            pomodorosToday: 0,
            lastPomodoroDate: null,
          },
        },
        { status: 200 }
      )
    }

    const [presets, stats] = await Promise.all([
      timerService.fetchPresets(supabase, user.id),
      timerService.fetchTodayStats(supabase, user.id),
    ])

    if (presets.error) {
      return NextResponse.json({ error: presets.error.message }, { status: 400 })
    }

    if (stats.error) {
      return NextResponse.json({ error: stats.error.message }, { status: 400 })
    }

    // ✅ Type assertion to satisfy formatPreset (or update service to handle unknown)
    const presetRows = (presets.data ?? []) as timerService.TimerPresetRow[]

    return NextResponse.json(
      {
        presets: presetRows.map(timerService.formatPreset),
        streak: {
          currentStreak: stats.data?.streak_maintained ?? 0,
          pomodorosToday: stats.data?.daily_pomodoro ?? 0,
          dailyTasksCompleted: stats.data?.daily_task_completed ?? 0,
          lastPomodoroDate: stats.data?.date ?? null,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Timer service GET error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function createTimerPreset(request: Request) {
  try {
    const supabase = createSupabaseClient(request)
    const { data: { user }, error: userError } = await timerService.getAuthenticatedUser(supabase)  // ✅ fixed

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, focusMinutes, breakMinutes } = await request.json()
    if (!name || typeof focusMinutes !== 'number' || typeof breakMinutes !== 'number') {
      return NextResponse.json({ error: 'Invalid timer preset payload' }, { status: 400 })
    }

    const { data, error } = await timerService.createPreset(supabase, user.id, {
      name,
      focusMinutes,
      breakMinutes,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // ✅ data is already typed correctly from createPreset
    return NextResponse.json({ preset: timerService.formatPreset(data as timerService.TimerPresetRow) }, { status: 201 })
  } catch (error) {
    console.error('Timer service POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function recordPomodoroCompletion(request: Request) {
  try {
    const supabase = createSupabaseClient(request)
    const { data: { user }, error: userError } = await timerService.getAuthenticatedUser(supabase)  // ✅ fixed

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()
    if (action !== 'recordCompletion') {
      return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    }

    const result = await timerService.recordPomodoro(supabase, user.id)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(
      {
        streak: {
          currentStreak: result.data.streak_maintained,
          pomodorosToday: result.data.daily_pomodoro,
          dailyTasksCompleted: result.data.daily_task_completed,
          lastPomodoroDate: result.data.date,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Timer service PATCH error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}