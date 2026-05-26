import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

const getCookieValue = (request: Request, name: string): string | null => {
  const cookieHeader = request.headers.get('cookie')
  if (!cookieHeader) return null
  const cookiePair = cookieHeader
    .split(';')
    .map(c => c.trim().split('='))
    .find(([cookieName]) => cookieName === name)
  return cookiePair ? decodeURIComponent(cookiePair[1]) : null
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
          throw new Error('Auth service does not support setting cookies directly.')
        },
        remove() {
          throw new Error('Auth service does not support removing cookies directly.')
        },
      },
    }
  )

export const getAuthenticatedUser = async (supabase: SupabaseClient) => {
  return supabase.auth.getUser()
}

export const signUp = async (supabase: SupabaseClient, email: string, password: string, fullName?: string) => {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
}

export const signIn = async (supabase: SupabaseClient, email: string, password: string) => {
  return supabase.auth.signInWithPassword({ email, password })
}

export const signOut = async (supabase: SupabaseClient) => {
  return supabase.auth.signOut()
}

export const sendResetEmail = async (supabase: SupabaseClient, email: string, redirectTo: string) => {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo })
}

export const getSession = async (supabase: SupabaseClient) => {
  return supabase.auth.getSession()
}
