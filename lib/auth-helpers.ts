import { createServerClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

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

const createAdminClient = () => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) return null
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    {
      auth: { persistSession: false },
      cookies: { get: () => null, set: () => {}, remove: () => {} },
    }
  )
}

export async function ensureUserRow(userId: string, supabase: SupabaseClient): Promise<void> {
  const admin = createAdminClient()
  const client = admin ?? supabase

  const { data: existing } = await client
    .from('users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) return

  let email = `user-${userId.slice(0, 8)}@placeholder.com`
  let username = `User ${userId.slice(0, 8)}`

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      email = user.email
      username = user.user_metadata?.full_name ?? email.split('@')[0]
    }
  } catch {
    // use fallback values
  }

  const { error } = await client.from('users').insert({
    user_id: userId,
    email,
    username,
    created_at: new Date().toISOString(),
  })
  if (error) {
    console.error('Failed to create users row — see docs/context/fix-fk-migration.sql', error.message)
  }
}

export async function resolveUser(request: Request): Promise<{ userId: string | null; supabase: SupabaseClient }> {
  const headerId = getUserIdFromRequest(request)
  if (headerId) {
    return { userId: headerId, supabase: createSupabaseClient(request) }
  }
  const supabase = createSupabaseClient(request)
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user ?? null
  if (error || !user) return { userId: null, supabase }
  return { userId: user.id, supabase }
}
