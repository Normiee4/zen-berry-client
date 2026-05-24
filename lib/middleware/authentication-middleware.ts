// middleware.ts
import { NextResponse, type NextRequest } from 'next/server'
import { authorizationMiddleware } from '@/lib/middleware/authorization-middleware'
import { withErrorHandler } from '@/lib/middleware/error-handler'
import { validationMiddleware } from '@/lib/middleware/input-validation'

async function AuthMiddleware(request: NextRequest) {
  const url = request.nextUrl

  // ========== BETA BYPASS ==========
  // 1. Check for existing bypass cookie
  const betaCookie = request.cookies.get('beta_bypass')
  if (betaCookie?.value === 'true') {
    // Already bypassed – skip auth
    return NextResponse.next()
  }

  // 2. Check for secret in URL query parameter
  const betaSecret = url.searchParams.get('beta_secret')
  const validSecrets = process.env.BETA_BYPASS_SECRETS?.split(',') || []

  if (betaSecret && validSecrets.includes(betaSecret)) {
    // Create response and set cookie for future requests
    const response = NextResponse.next()
    response.cookies.set('beta_bypass', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    })

    // Remove secret from URL for cleaner address bar
    if (url.searchParams.has('beta_secret')) {
      url.searchParams.delete('beta_secret')
      return NextResponse.redirect(url.toString())
    }
    return response
  }
  // ========== END BYPASS ==========

  // 1. Authentication (checks if user is signed in)
  const authResponse = await authorizationMiddleware(request)
  if (authResponse instanceof NextResponse) return authResponse

  // 2. Validation (input validation)
  const validationResponse = await validationMiddleware(request)
  if (validationResponse instanceof NextResponse) return validationResponse

  return NextResponse.next()
}

export default withErrorHandler(AuthMiddleware)