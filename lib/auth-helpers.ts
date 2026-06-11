import { createRouteHandlerClient } from "@/lib/supabase-server"
import type { SupabaseClient } from '@supabase/supabase-js'
import { type NextResponse } from 'next/server'

export function getUserIdFromRequest(request: Request): string | null {
  return request.headers.get('X-User-Id')
}

export const createSupabaseClient = (request: Request, response?: NextResponse) =>
  createRouteHandlerClient(request, response)

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
