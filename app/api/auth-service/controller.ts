import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from "@/lib/supabase-server"
import * as authService from '@/app/api/auth-service/service'
import { checkRateLimit } from '@/lib/middleware/rate-limit'
import { fullNameSchema } from '@/lib/input-validator'

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
  return createRouteHandlerClient(request, response)
}

export async function register(request: Request) {
  const rl = rateLimitAuth(request)
  if (rl instanceof NextResponse) return rl

  try {
    const { email, password, fullName, consentAccepted } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }
    if (!consentAccepted) {
      return NextResponse.json({ error: 'You must accept the Terms of Use and Privacy Policy' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true, message: 'Account created successfully' }, { status: 201 })
    const supabase = createClient(request, response)
    const { data, error } = await authService.signUp(supabase, email, password, fullName)

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message ?? 'Registration failed' }, { status: 400 })
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert({
        user_id: data.user.id,
        email: data.user.email,
        username: fullName ?? email.split('@')[0],
        consent_accepted_at: new Date().toISOString(),
      })

    if (insertError) {
      console.error('Failed to create users table entry:', insertError)
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
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const { data: userRow } = await supabase
      .from('users')
      .select('theme_preference')
      .eq('user_id', user.id)
      .single()

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'User',
        has_onboarded: user.user_metadata?.has_onboarded ?? false,
        theme_preference: userRow?.theme_preference ?? 'light-zen',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function updateMe(request: Request) {
  try {
    const body = await request.json()
    const response = NextResponse.json({ success: true })
    const supabase = createClient(request, response)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (body.theme_preference) {
      const validThemes = ['light-zen', 'warm-earth', 'cozy-dark']
      if (!validThemes.includes(body.theme_preference)) {
        return NextResponse.json({ error: 'Invalid theme preference' }, { status: 400 })
      }
      const { error: updateError } = await authService.updateUser(supabase, user.id, { theme_preference: body.theme_preference })
      if (updateError) throw updateError
    }

    if (body.full_name !== undefined) {
      const parsedName = fullNameSchema.safeParse(body.full_name)
      if (!parsedName.success) {
        return NextResponse.json({ error: 'Invalid name' }, { status: 400 })
      }
      const { error: metaError } = await supabase.auth.updateUser({
        data: { full_name: parsedName.data },
      })
      if (metaError) throw metaError
      const { error: nameError } = await authService.updateUser(supabase, user.id, { username: parsedName.data })
      if (nameError) throw nameError
    }

    if (body.has_onboarded !== undefined) {
      const { error } = await supabase.auth.updateUser({
        data: { has_onboarded: body.has_onboarded },
      })
      if (error) throw error
    }

    return response
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function deleteMe(request: Request) {
  try {
    const supabase = createClient(request, new NextResponse())
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await authService.deleteUser(user.id)
    if (error) {
      console.error('Failed to delete user:', error)
      return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 })
    }

    const response = NextResponse.json({ success: true })
    const supabaseForLogout = createClient(request, response)
    await authService.signOut(supabaseForLogout)
    return response
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
