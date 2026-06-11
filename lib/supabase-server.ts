import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignored — middleware handles session refresh
          }
        },
      },
    }
  )
}

export function createMiddlewareClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }))
        },
      },
    }
  )
}

const parseCookieHeader = (request: Request) => {
  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader) return []
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=")
    return { name, value: decodeURIComponent(rest.join("=")) }
  })
}

export function createRouteHandlerClient(request: Request, response?: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const nextRequest = request as unknown as NextRequest
          if (nextRequest.cookies?.getAll) {
            return nextRequest.cookies.getAll()
          }
          return parseCookieHeader(request)
        },
        setAll(cookiesToSet) {
          if (!response) return
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set({ name, value, ...options }))
        },
      },
    }
  )
}
