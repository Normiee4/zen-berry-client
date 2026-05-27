import { NextResponse } from 'next/server'
import * as taskService from '@/app/api/tasks/service'
import type { SupabaseClient } from '@supabase/supabase-js'

const MIT_LIMIT = 3

async function resolveUser(request: Request): Promise<{ userId: string | null; supabase: SupabaseClient }> {
  const headerId = request.headers.get('X-User-Id')
  if (headerId) {
    return { userId: headerId, supabase: taskService.createSupabaseClient(request) }
  }
  const supabase = taskService.createSupabaseClient(request)
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user ?? null
  if (error || !user) return { userId: null, supabase }
  return { userId: user.id, supabase }
}

export async function getTasks(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ tasks: [], mitCount: 0 }, { status: 200 })
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
      return NextResponse.json({ error: tasksResult.error.message }, { status: 400 })
    }

    const taskRows = (tasksResult.data ?? []) as taskService.TaskRow[]

    return NextResponse.json(
      {
        tasks: taskRows.map(taskService.formatTask),
        mitCount: mitCountResult.count,
        mitLimit: MIT_LIMIT,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Tasks GET error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function createTask(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, type } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const isMIT = type === 'mit'

    if (isMIT) {
      const mitCountResult = await taskService.fetchMITCount(supabase, userId)
      if (mitCountResult.count >= MIT_LIMIT) {
        return NextResponse.json(
          { error: `You can only have ${MIT_LIMIT} Most Important Tasks at a time.` },
          { status: 400 }
        )
      }
    }

    const result = await taskService.insertTask(supabase, userId, {
      title: title.trim(),
      isMIT,
    })

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json(
      { task: taskService.formatTask(result.data as taskService.TaskRow) },
      { status: 201 }
    )
  } catch (error) {
    console.error('Tasks POST error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function updateTask(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, title, completed, isMIT } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const taskId = Number(id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const updates: Record<string, unknown> = {}
    if (title !== undefined) updates.title = title
    if (completed !== undefined) updates.completed = completed
    if (isMIT !== undefined) updates.type = isMIT ? 'MIT' : 'Brain_dump'

    const result = await taskService.modifyTask(supabase, userId, taskId, updates)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    if (completed === true) {
      await taskService.incrementTaskCompletion(supabase, userId)
    }

    return NextResponse.json(
      { task: taskService.formatTask(result.data as taskService.TaskRow) },
      { status: 200 }
    )
  } catch (error) {
    console.error('Tasks PATCH error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function deleteTask(request: Request) {
  try {
    const { userId, supabase } = await resolveUser(request)
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }


    const url = new URL(request.url)
    const id = url.searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const taskId = Number(id)
    if (isNaN(taskId)) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const result = await taskService.removeTask(supabase, userId, taskId)

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Tasks DELETE error', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}