import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// ---------- Types ----------
export interface TaskRow {
  task_id: string
  user_id: string
  title: string
  is_mit: boolean
  completed: boolean
  created_at: string
  completed_at: string | null
  updated_at: string
}

export interface FormattedTask {
  id: string
  title: string
  isMIT: boolean
  completed: boolean
  createdAt: string
  completedAt: string | null
}

// ---------- Helpers ----------
export const formatTask = (row: TaskRow): FormattedTask => ({
  id: row.task_id,
  title: row.title,
  isMIT: row.is_mit,
  completed: row.completed,
  createdAt: row.created_at,
  completedAt: row.completed_at,
})

// ---------- Cookie Helper ----------
const getCookieValue = (request: Request, name: string): string | null => {
  const requestCookies = (request as unknown as {
    cookies?: { get(name: string): { value: string } | undefined }
  }).cookies
  if (requestCookies?.get) {
    return requestCookies.get(name)?.value ?? null
  }

  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null

  const cookiePair = cookieHeader
    .split(';')
    .map(cookie => cookie.trim().split('='))
    .find(([cookieName]) => cookieName === name)

  return cookiePair ? cookiePair[1] : null
}

export const createSupabaseClient = (request: Request) =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookieValue(request, name)
        },
        set() {
          throw new Error('Server route does not support setting cookies.')
        },
        remove() {
          throw new Error('Server route does not support removing cookies.')
        },
      },
    }
  )

// ---------- Auth ----------
export const getAuthenticatedUser = async (supabase: SupabaseClient) => {
  return supabase.auth.getUser()
}

// ---------- Task Operations ----------
export const fetchTasks = async (
  supabase: SupabaseClient,
  userId: string,
  options: { type?: 'mit' | 'braindump'; completed?: boolean } = {}
) => {
  let query = supabase
    .from('tasks')
    .select('task_id, title, is_mit, completed, created_at, completed_at, updated_at')
    .eq('user_id', userId)

  if (options.type) {
    query = query.eq('is_mit', options.type === 'mit')
  }

  if (options.completed !== undefined) {
    query = query.eq('completed', options.completed)
  }

  return query.order('created_at', { ascending: true })
}

export const fetchMITCount = async (supabase: SupabaseClient, userId: string) => {
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_mit', true)
    .eq('completed', false)

  return { count: count ?? 0, error }
}

export const insertTask = async (
  supabase: SupabaseClient,
  userId: string,
  task: { title: string; isMIT: boolean }
) => {
  return supabase
    .from('tasks')
    .insert([
      {
        user_id: userId,
        title: task.title,
        is_mit: task.isMIT,
        completed: false,
      },
    ])
    .select()
    .single()
}

export const modifyTask = async (
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  updates: { completed?: boolean; is_mit?: boolean; title?: string }
) => {
  const updateData: Record<string, unknown> = { ...updates }
  
  if (updates.completed === true) {
    updateData.completed_at = new Date().toISOString()
  } else if (updates.completed === false) {
    updateData.completed_at = null
  }

  return supabase
    .from('tasks')
    .update(updateData)
    .eq('task_id', taskId)
    .eq('user_id', userId)
    .select()
    .single()
}

export const removeTask = async (
  supabase: SupabaseClient,
  userId: string,
  taskId: string
) => {
  return supabase
    .from('tasks')
    .delete()
    .eq('task_id', taskId)
    .eq('user_id', userId)
}