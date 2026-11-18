import { NextResponse, type NextRequest } from 'next/server'
import { authorizationMiddleware } from '@/lib/middleware/authorization-middleware'
import { withErrorHandler } from '@/lib/middleware/error-handler'
import { validationMiddleware } from '@/lib/middleware/input-validation'

async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const pathname = url.pathname

  // Bypass auth checks for SEO metadata routes, PWA assets, and service worker files
  if (
    pathname === '/sitemap.xml' ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/sw.js' ||
    pathname.startsWith('/workbox')
  ) {
    return NextResponse.next()
  }

  const betaCookie = request.cookies.get('beta_bypass')
  if (betaCookie?.value === 'true') {
    return NextResponse.next()
  }

  const betaSecret = url.searchParams.get('beta_secret')
  const validSecrets = process.env.BETA_BYPASS_SECRETS?.split(',') || []

  if (betaSecret && validSecrets.includes(betaSecret)) {
    const response = NextResponse.next()
    response.cookies.set('beta_bypass', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    if (url.searchParams.has('beta_secret')) {
      url.searchParams.delete('beta_secret')
      return NextResponse.redirect(url.toString())
    }
    return response
  }

  const authResponse = await authorizationMiddleware(request)
  if (authResponse instanceof NextResponse) return authResponse

  const validationResponse = await validationMiddleware(request)
  if (validationResponse instanceof NextResponse) return validationResponse

  return NextResponse.next()
}

export default withErrorHandler(middleware)

export const config = {
  matcher: ['/dashboard/:path*', '/api/((?!waitlist|auth-service).*)', '/auth/:path*'],
}
