import { NextResponse } from 'next/server'
import * as timerService from '@/app/api/timer-service/service'
import { createSupabaseClient } from '@/app/api/timer-service/service'
import { getUserIdFromRequest } from '@/lib/auth-helpers'

export async function getTimerData(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
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

    const supabase = createSupabaseClient(request)
    const [presets, stats] = await Promise.all([
      timerService.fetchPresets(supabase, userId),
      timerService.fetchTodayStats(supabase, userId),
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
      { status: 200, headers: { 'Cache-Control': 'public, max-age=30, s-maxage=60' } }
    )
  } catch (error) {
    console.error('Timer service GET error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function createTimerPreset(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
    }

    const supabase = createSupabaseClient(request)
    const { name, focusMinutes, breakMinutes } = await request.json()
    if (!name || typeof focusMinutes !== 'number' || typeof breakMinutes !== 'number') {
      return NextResponse.json({ error: 'Invalid timer preset payload' }, { status: 400 })
    }

    const { data, error } = await timerService.createPreset(supabase, userId, {
      name,
      focusMinutes,
      breakMinutes,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ preset: timerService.formatPreset(data as timerService.TimerPresetRow) }, { status: 201 })
  } catch (error) {
    console.error('Timer service POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function recordPomodoroCompletion(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient(request)
    const result = await timerService.recordPomodoro(supabase, userId)

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

export async function handleTimerAction(request: Request) {
  try {
    const userId = getUserIdFromRequest(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseClient(request)
    const { action, presetId, name, focusMinutes, breakMinutes, durationMinutes, presetUsed } = await request.json()

    if (action === 'recordCompletion') {
      const result = await timerService.recordPomodoro(supabase, userId, durationMinutes ? { durationMinutes, presetUsed } : undefined)

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
    }

    if (action === 'updatePreset') {
      if (!presetId) {
        return NextResponse.json({ error: 'presetId is required' }, { status: 400 })
      }

      const { data, error } = await timerService.updatePreset(supabase, presetId, {
        name,
        focusMinutes,
        breakMinutes,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ preset: timerService.formatPreset(data as timerService.TimerPresetRow) }, { status: 200 })
    }

    if (action === 'deletePreset') {
      if (!presetId) {
        return NextResponse.json({ error: 'presetId is required' }, { status: 400 })
      }

      const { error } = await timerService.deletePreset(supabase, presetId)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      return NextResponse.json({ success: true }, { status: 200 })
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
  } catch (error) {
    console.error('Timer service action error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}