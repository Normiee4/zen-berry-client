import { NextResponse } from 'next/server'
import * as timerService from '@/app/api/timer-service/service'
import { resolveUser } from '@/lib/auth-helpers'

function copyAuthCookies(source: NextResponse | null, target: NextResponse) {
  if (!source) return
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie)
  }
}

export async function getTimerData(request: Request) {
  try {
    const cookieHolder = NextResponse.next()
    const { userId, supabase } = await resolveUser(request, cookieHolder)
    if (!userId) {
      const res = NextResponse.json(
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
      copyAuthCookies(cookieHolder, res)
      return res
    }
    const [presets, stats] = await Promise.all([
      timerService.fetchPresets(supabase, userId),
      timerService.fetchTodayStats(supabase, userId),
    ])

    if (presets.error) {
      const res = NextResponse.json({ error: presets.error.message }, { status: 400 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    if (stats.error) {
      const res = NextResponse.json({ error: stats.error.message }, { status: 400 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const presetRows = (presets.data ?? []) as timerService.TimerPresetRow[]

    const res = NextResponse.json(
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
    copyAuthCookies(cookieHolder, res)
    return res
  } catch (error) {
    console.error('Timer service GET error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function createTimerPreset(request: Request) {
  try {
    const cookieHolder = NextResponse.next()
    const { userId, supabase } = await resolveUser(request, cookieHolder)
    if (!userId) {
      const res = NextResponse.json({ error: 'Unauthorized User' }, { status: 401 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const { name, focusMinutes, breakMinutes } = await request.json()
    if (!name || typeof focusMinutes !== 'number' || typeof breakMinutes !== 'number') {
      const res = NextResponse.json({ error: 'Invalid timer preset payload' }, { status: 400 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const { data, error } = await timerService.createPreset(supabase, userId, {
      name,
      focusMinutes,
      breakMinutes,
    })

    if (error) {
      const res = NextResponse.json({ error: error.message }, { status: 400 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const res = NextResponse.json({ preset: timerService.formatPreset(data as timerService.TimerPresetRow) }, { status: 201 })
    copyAuthCookies(cookieHolder, res)
    return res
  } catch (error) {
    console.error('Timer service POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function handleTimerAction(request: Request) {
  try {
    const cookieHolder = NextResponse.next()
    const { userId, supabase } = await resolveUser(request, cookieHolder)
    if (!userId) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const { action, presetId, name, focusMinutes, breakMinutes, durationMinutes, presetUsed } = await request.json()

    if (action === 'recordCompletion') {
      const result = await timerService.recordPomodoro(supabase, userId, durationMinutes ? { durationMinutes, presetUsed } : undefined)

      if (result.error) {
        const res = NextResponse.json({ error: result.error.message }, { status: 400 })
        copyAuthCookies(cookieHolder, res)
        return res
      }

      const res = NextResponse.json(
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
      copyAuthCookies(cookieHolder, res)
      return res
    }

    if (action === 'updatePreset') {
      if (!presetId) {
        const res = NextResponse.json({ error: 'presetId is required' }, { status: 400 })
        copyAuthCookies(cookieHolder, res)
        return res
      }

      const { data, error } = await timerService.updatePreset(supabase, presetId, {
        name,
        focusMinutes,
        breakMinutes,
      })

      if (error) {
        const res = NextResponse.json({ error: error.message }, { status: 400 })
        copyAuthCookies(cookieHolder, res)
        return res
      }

      const res = NextResponse.json({ preset: timerService.formatPreset(data as timerService.TimerPresetRow) }, { status: 200 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    if (action === 'deletePreset') {
      if (!presetId) {
        const res = NextResponse.json({ error: 'presetId is required' }, { status: 400 })
        copyAuthCookies(cookieHolder, res)
        return res
      }

      const { error } = await timerService.deletePreset(supabase, presetId)

      if (error) {
        const res = NextResponse.json({ error: error.message }, { status: 400 })
        copyAuthCookies(cookieHolder, res)
        return res
      }

      const res = NextResponse.json({ success: true }, { status: 200 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const res = NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    copyAuthCookies(cookieHolder, res)
    return res
  } catch (error) {
    console.error('Timer service action error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
