import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { type NextResponse } from 'next/server'

// ---------- Types ----------
export interface TaskRow {
  task_id: number
  user_id: string
  title: string
  type: string
  created_at: string
  complete_at: string | null
}

export interface FormattedTask {
  id: number
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
  isMIT: row.type === 'MIT',
  completed: row.complete_at !== null,
  createdAt: row.created_at,
  completedAt: row.complete_at,
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

export const createSupabaseClient = (request: Request, response?: NextResponse) =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return getCookieValue(request, name)
        },
        set(name: string, value: string, options: CookieOptions) {
          if (response) response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          if (response) response.cookies.set({ name, value: '', ...options })
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
    .select('task_id, title, type, complete_at, created_at')
    .eq('user_id', userId)

  if (options.type === 'mit') {
    query = query.eq('type', 'MIT')
  } else if (options.type === 'braindump') {
    query = query.eq('type', 'Brain_dump')
  }

  if (options.completed === true) {
    query = query.not('complete_at', 'is', null)
  } else if (options.completed === false) {
    query = query.is('complete_at', null)
  }

  return query.order('created_at', { ascending: true })
}

export const fetchMITCount = async (supabase: SupabaseClient, userId: string) => {
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'MIT')
    .is('complete_at', null)

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
        type: task.isMIT ? 'MIT' : 'Brain_dump',
      },
    ])
    .select()
    .single()
}

export const modifyTask = async (
  supabase: SupabaseClient,
  userId: string,
  taskId: number,
  updates: { completed?: boolean; type?: string; title?: string }
) => {
  const updateData: Record<string, unknown> = {}
  
  if (updates.title !== undefined) {
    updateData.title = updates.title
  }
  
  if (updates.type !== undefined) {
    updateData.type = updates.type
  }
  
  if (updates.completed === true) {
    updateData.complete_at = new Date().toISOString()
  } else if (updates.completed === false) {
    updateData.complete_at = null
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
  taskId: number
) => {
  return supabase
    .from('tasks')
    .delete()
    .eq('task_id', taskId)
    .eq('user_id', userId)
}
