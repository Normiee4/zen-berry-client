import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { type NextResponse } from 'next/server'

export function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get('X-User-Id')
}

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

export async function resolveUser(request: Request, response?: NextResponse): Promise<{ userId: string | null; supabase: SupabaseClient }> {
  const headerId = getUserIdFromRequest(request)
  if (headerId) {
    return { userId: headerId, supabase: createSupabaseClient(request, response) }
  }
  const supabase = createSupabaseClient(request, response)
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user ?? null
  if (error || !user) return { userId: null, supabase }
  return { userId: user.id, supabase }
}
