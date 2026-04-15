import { NextResponse, type NextRequest } from 'next/server'

export function withErrorHandler(middlewareFn: (req: NextRequest) => Promise<NextResponse | void>) {
  return async (request: NextRequest) => {
    try {
      const result = await middlewareFn(request)
      return result || NextResponse.next()
    } catch (error) {
      console.error('Middleware error:', error)
      if (request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
      }
      return NextResponse.redirect(new URL('/error', request.url))
    }
  }
}