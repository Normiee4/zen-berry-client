import { NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import * as authService from '@/app/api/auth-service/service'
import { checkRateLimit } from '@/lib/middleware/rate-limit'

const AUTH_RATE_LIMIT = 5
const AUTH_RATE_WINDOW = 15 * 60 * 1000

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
}

function rateLimitAuth(request: Request): { allowed: boolean } | NextResponse {
  const ip = getClientIp(request)
  const result = checkRateLimit(`auth:${ip}`, AUTH_RATE_LIMIT, AUTH_RATE_WINDOW)
  if (!result.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil(result.resetIn / 60000)} minutes.` },
      { status: 429 }
    )
  }
  return { allowed: true }
}

function createClient(request: Request, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookieHeader = request.headers.get('cookie')
          if (!cookieHeader) return null
          const match = cookieHeader
            .split(';')
            .map(c => c.trim())
            .find(c => c.startsWith(`${name}=`))
          return match ? decodeURIComponent(match.split('=')[1]) : null
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
}

export async function register(request: Request) {
  const rl = rateLimitAuth(request)
  if (rl instanceof NextResponse) return rl

  try {
    const { email, password, fullName } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true, message: 'Account created successfully' }, { status: 201 })
    const supabase = createClient(request, response)
    const { error } = await authService.signUp(supabase, email, password, fullName)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function login(request: Request) {
  const rl = rateLimitAuth(request)
  if (rl instanceof NextResponse) return rl

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })
    const supabase = createClient(request, response)
    const { error } = await authService.signIn(supabase, email, password)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function logout(request: Request) {
  const response = NextResponse.json({ success: true })
  const supabase = createClient(request, response)
  await authService.signOut(supabase)
  return response
}

export async function getMe(request: Request) {
  try {
    const response = NextResponse.json({ user: null })
    const supabase = createClient(request, response)
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = session.user

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function forgotPassword(request: Request) {
  const rl = rateLimitAuth(request)
  if (rl instanceof NextResponse) return rl

  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true })
    const supabase = createClient(request, response)
    const { error } = await authService.sendResetEmail(
      supabase,
      email,
      `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/reset-password`
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
