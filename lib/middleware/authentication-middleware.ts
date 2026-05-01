import { authorizationMiddleware } from '@/lib/middleware/authorization-middleware'
import { withErrorHandler } from '@/lib/middleware/error-handler'
import { validationMiddleware } from '@/lib/middleware/input-validation'
import { NextResponse, type NextRequest } from 'next/server'

async function AuthMiddleware(request: NextRequest) {
  // 1. Authentication (checks if user is signed in)
  const authResponse = await authorizationMiddleware(request)
  if (authResponse instanceof NextResponse) return authResponse

  // 2. Validation (input validation)
  const validationResponse = await validationMiddleware(request)
  if (validationResponse instanceof NextResponse) return validationResponse

  return NextResponse.next()
}

export default withErrorHandler(AuthMiddleware)

export const config = {
  matcher: ['/dashboard/:path*', '/api/((?!waitlist).*)', '/auth/:path*'],
}