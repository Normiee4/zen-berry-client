import { NextResponse } from 'next/server'
import * as taskService from '@/app/api/tasks/service'
import { resolveUser, copyAuthCookies } from '@/lib/auth-helpers'
import { createTaskSchema, updateTaskSchema, deleteTaskSchema } from '@/lib/input-validator'
import { ZodError } from 'zod'

const MIT_LIMIT = 3

export async function getTasks(request: Request) {
  try {
    const cookieHolder = NextResponse.next()
    const { userId, supabase } = await resolveUser(request, cookieHolder)
    if (!userId) {
      const res = NextResponse.json({ tasks: [], mitCount: 0 }, { status: 200 })
      copyAuthCookies(cookieHolder, res)
      return res
    }
    const url = new URL(request.url)
    const type = url.searchParams.get('type') as 'mit' | 'braindump' | null
    const completed = url.searchParams.get('completed')

    const filters: { type?: 'mit' | 'braindump'; completed?: boolean } = {}
    if (type) filters.type = type
    if (completed !== null) filters.completed = completed === 'true'

    const [tasksResult, mitCountResult] = await Promise.all([
      taskService.fetchTasks(supabase, userId, filters),
      taskService.fetchMITCount(supabase, userId),
    ])

    if (tasksResult.error) {
      const res = NextResponse.json({ error: tasksResult.error.message }, { status: 400 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const taskRows = (tasksResult.data ?? []) as taskService.TaskRow[]

    const res = NextResponse.json(
      {
        tasks: taskRows.map(taskService.formatTask),
        mitCount: mitCountResult.count,
        mitLimit: MIT_LIMIT,
      },
      { status: 200 }
    )
    copyAuthCookies(cookieHolder, res)
    return res
  } catch (error) {
    console.error('Tasks GET error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function createTask(request: Request) {
  try {
    const cookieHolder = NextResponse.next()
    const { userId, supabase } = await resolveUser(request, cookieHolder)
    if (!userId) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const body = await request.json()
    const parsed = createTaskSchema.parse(body)
    const isMIT = parsed.type === 'mit'

    if (isMIT) {
      const mitCountResult = await taskService.fetchMITCount(supabase, userId)
      if (mitCountResult.count >= MIT_LIMIT) {
        const res = NextResponse.json(
          { error: `You can only have ${MIT_LIMIT} Most Important Tasks at a time.` },
          { status: 400 }
        )
        copyAuthCookies(cookieHolder, res)
        return res
      }
    }

    const result = await taskService.insertTask(supabase, userId, {
      title: parsed.title.trim(),
      isMIT,
    })

    if (result.error) {
      const res = NextResponse.json({ error: result.error.message }, { status: 400 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const res = NextResponse.json(
      { task: taskService.formatTask(result.data as taskService.TaskRow) },
      { status: 201 }
    )
    copyAuthCookies(cookieHolder, res)
    return res
  } catch (error) {
    if (error instanceof ZodError) {
      const res = NextResponse.json({ error: error.issues[0].message }, { status: 400 })
      copyAuthCookies(NextResponse.next(), res)
      return res
    }
    console.error('Tasks POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function updateTask(request: Request) {
  try {
    const cookieHolder = NextResponse.next()
    const { userId, supabase } = await resolveUser(request, cookieHolder)
    if (!userId) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const body = await request.json()
    const parsed = updateTaskSchema.parse(body)
    const taskId = Number(parsed.id)

    if (isNaN(taskId)) {
      const res = NextResponse.json({ error: 'Task not found' }, { status: 404 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const updates: Record<string, unknown> = {}
    if (parsed.title !== undefined) updates.title = parsed.title
    if (parsed.completed !== undefined) updates.completed = parsed.completed
    if (parsed.isMIT !== undefined) updates.type = parsed.isMIT ? 'MIT' : 'Brain_dump'

    const result = await taskService.modifyTask(supabase, userId, taskId, updates)

    if (result.error) {
      const res = NextResponse.json({ error: result.error.message }, { status: 400 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const res = NextResponse.json(
      { task: taskService.formatTask(result.data as taskService.TaskRow) },
      { status: 200 }
    )
    copyAuthCookies(cookieHolder, res)
    return res
  } catch (error) {
    if (error instanceof ZodError) {
      const res = NextResponse.json({ error: error.issues[0].message }, { status: 400 })
      copyAuthCookies(NextResponse.next(), res)
      return res
    }
    console.error('Tasks PATCH error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function deleteTask(request: Request) {
  try {
    const cookieHolder = NextResponse.next()
    const { userId, supabase } = await resolveUser(request, cookieHolder)
    if (!userId) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    const parsed = deleteTaskSchema.parse({ id })
    const taskId = Number(parsed.id)

    if (isNaN(taskId)) {
      const res = NextResponse.json({ error: 'Task not found' }, { status: 404 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const result = await taskService.removeTask(supabase, userId, taskId)

    if (result.error) {
      const res = NextResponse.json({ error: result.error.message }, { status: 400 })
      copyAuthCookies(cookieHolder, res)
      return res
    }

    const res = NextResponse.json({ success: true }, { status: 200 })
    copyAuthCookies(cookieHolder, res)
    return res
  } catch (error) {
    if (error instanceof ZodError) {
      const res = NextResponse.json({ error: error.issues[0].message }, { status: 400 })
      copyAuthCookies(NextResponse.next(), res)
      return res
    }
    console.error('Tasks DELETE error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
