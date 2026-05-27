import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

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
          /* no-op */
        },
        remove() {
          /* no-op */
        },
      },
    }
  )

export const getAuthenticatedUser = async (supabase: SupabaseClient) => {
  return supabase.auth.getUser()
}

export const fetchLifetimeTasks = async (supabase: SupabaseClient, userId: string) => {
  const { count, error } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .not('complete_at', 'is', null)

  if (error) {
    console.error('Error fetching lifetime tasks:', error)
    return 0
  }
  return count ?? 0
}

export const fetchLifetimeCycles = async (supabase: SupabaseClient, userId: string) => {
  const { count, error } = await supabase
    .from('session_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('was_break', false)

  if (error) {
    console.error('Error fetching lifetime cycles:', error)
    return 0
  }
  return count ?? 0
}
