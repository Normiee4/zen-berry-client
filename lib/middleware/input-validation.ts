import { NextResponse, type NextRequest } from 'next/server'
import { taskQuerySchema } from '@/lib/validator'

export async function validationMiddleware(request: NextRequest) {
  const url = request.nextUrl
  const isApiTasksRoute = url.pathname === '/api/tasks' && request.method === 'GET'

  if (isApiTasksRoute) {
    const queryParams = Object.fromEntries(url.searchParams.entries())
    const result = taskQuerySchema.safeParse(queryParams)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: result.error.format() },
        { status: 400 }
      )
    }
    const response = NextResponse.next()
    response.headers.set('X-Validated-Params', JSON.stringify(result.data))
    return response
  }
  return NextResponse.next()
}