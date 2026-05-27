import { createServerClient } from '@supabase/ssr'

export function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get('X-User-Id')
}

function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return null
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    {
      cookies: { get: () => null, set: () => {}, remove: () => {} },
      auth: { autoRefreshToken: false, persistSession: false },
    }
  )
}

export async function ensureUserRow(userId: string, supabase: any): Promise<void> {
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
