  import { NextResponse, type NextRequest } from 'next/server'
  import { authorizationMiddleware } from '@/lib/middleware/authorization'
  import { validationMiddleware } from '@/lib/middleware/input-validation'
  import { withErrorHandler } from '@/lib/middleware/error-handler'

  async function composedMiddleware(request: NextRequest) {
    // 1. Authorization
    const authResponse = await authorizationMiddleware(request)
    if (authResponse instanceof NextResponse) return authResponse

    // 2. Validation
    const validationResponse = await validationMiddleware(request)
    if (validationResponse instanceof NextResponse) return validationResponse

    return NextResponse.next()
  }

  export default withErrorHandler(composedMiddleware)

  export const config = {
    matcher: ['/dashboard/:path*', '/api/((?!waitlist).*)', '/auth/:path*'],
  }