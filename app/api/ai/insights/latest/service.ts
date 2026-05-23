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
          throw new Error('Server route does not support setting cookies.')
        },
        remove() {
          throw new Error('Server route does not support removing cookies.')
        },
      },
    }
  )

export const getAuthenticatedUser = async (supabase: SupabaseClient) => {
  return supabase.auth.getUser()
}

export interface LatestInsightResponse {
  insight_id: number
  insight_message: string | null
  recommendation: string | null
  milestone: string | null
  productivity_level: number | null
  consistency_rate: number | null
  cycles_total: number
  peak_hours: number
  peak_days: string[]
  created_at: string
}

export const fetchLatestInsight = async (
  supabase: SupabaseClient,
  userId: string
): Promise<LatestInsightResponse | null> => {
  const { data, error } = await supabase
    .from('ai_insights')
    .select('insight_id, insight_message, recommendation, milestone, productivity_level, consistency_rate, cycles_total, peak_hours, peak_days, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !data) return null
  return data
}
