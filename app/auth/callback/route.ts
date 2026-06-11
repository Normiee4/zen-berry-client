import { createRouteHandlerClient } from "@/lib/supabase-server"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`)

    const supabase = createRouteHandlerClient(request, response)

    await supabase.auth.exchangeCodeForSession(code)
    return response
  }

  return NextResponse.redirect(`${origin}/auth/login`)
}
