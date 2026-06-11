import { createMiddlewareClient } from "@/lib/supabase-server"
import { NextResponse, type NextRequest } from 'next/server'

export async function authorizationMiddleware(request: NextRequest) {
  const supabaseResponse = NextResponse.next({ request })

  const supabase = createMiddlewareClient(request, supabaseResponse)

  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user ?? null
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard')

  if (isApiRoute) {
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('X-User-Id', user.id)
    return NextResponse.next({ request: { headers: requestHeaders } })
  }

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}
