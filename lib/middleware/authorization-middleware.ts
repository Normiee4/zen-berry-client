import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function authorizationMiddleware(request: NextRequest) {
  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const userId = session?.user?.id ?? null
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

  if (isApiRoute) {
    if (userId) {
      response.headers.set('X-User-Id', userId)
    }
    return response
  }

  if (!userId && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (userId && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  return response
}