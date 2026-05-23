# Security Guidelines

Consumer app — no RBAC. Only two tiers: **user** and **dev/admin**.

## Authentication

Use Supabase Auth OR custom JWT with access + refresh tokens.

### JWT (if rolling your own)

```ts
import { SignJWT, jwtVerify } from 'jose'

const secret = new TextEncoder().encode(process.env.JWT_SECRET!)

export async function createAccessToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('15m')
    .sign(secret)
}

export async function createRefreshToken(userId: string) {
  return await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload
}
```

### Supabase Auth (preferred)

Use `@supabase/ssr` for session handling. Tokens are managed server-side via `httpOnly` cookies.

### Cookie Settings

```
HttpOnly  →  not accessible via JS
Secure    →  HTTPS only
SameSite  →  Lax
Path      →  /
```

## Authorization

No roles. Only check:

| Check | How |
|-------|-----|
| Authenticated | Valid session / token exists |
| Owner | Resource belongs to `req.user.id` |
| Admin | Match against a single dev email or env var |

```ts
// Owner check pattern
const task = await db.task.findFirst({
  where: { id: params.id, userId: req.user.id }
})
if (!task) return Response.json({ error: 'Not found' }, { status: 404 })
```

## Input Validation & Sanitization

### Zod schemas

```ts
import { z } from 'zod'

const CreateTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(['mit', 'brain_dump']),
})

export async function POST(req: Request) {
  const body = await req.json()
  const result = CreateTaskSchema.safeParse(body)
  if (!result.success) {
    return Response.json({ errors: result.error.issues }, { status: 400 })
  }
  // result.data is type-safe
}
```

### XSS prevention

React escapes by default. If you must use `dangerouslySetInnerHTML`, sanitize first:

```ts
import DOMPurify from 'isomorphic-dompurify'
const safe = DOMPurify.sanitize(unsafeHtml)
```

### SQL injection

Prevented automatically by using Prisma (parameterized queries).

## Rate Limiting

Protect all public endpoints — stricter on auth.

```ts
// Helper for API routes
const rateLimit = new Map<string, { count: number; reset: number }>()

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const entry = rateLimit.get(key)

  if (!entry || now > entry.reset) {
    rateLimit.set(key, { count: 1, reset: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= limit) {
    return { allowed: false }
  }

  entry.count++
  return { allowed: true }
}

// Usage in API route:
const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
const { allowed } = checkRateLimit(`auth:${ip}`, 5, 15 * 60 * 1000)
if (!allowed) {
  return Response.json({ error: 'Too many attempts' }, { status: 429 })
}
```

| Endpoint group | Limit | Window |
|----------------|-------|--------|
| Auth (login, register) | 5 | 15 min |
| AI endpoints | 10 | 24 h |
| All other API | 100 | 15 min |

## Session Management

### Flow

```
Login → server sets httpOnly cookie (or returns tokens)
       → client sends cookie/token on every request
       → middleware/helper verifies session
       → attaches user to request context
Logout → clear cookie / revoke refresh token
```

### Next.js middleware

```ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { request, response }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/private/:path*']
}
```

## Security Headers

```ts
// In middleware or next.config
response.headers.set('X-Frame-Options', 'DENY')
response.headers.set('X-Content-Type-Options', 'nosniff')
response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
```

## CORS (if needed)

```ts
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
}
```

## Error Handling

Never leak internals:

```ts
try {
  // ...
} catch (error) {
  console.error(error) // server-side only
  return Response.json({ error: 'Internal server error' }, { status: 500 })
}
```

## Dependency Security

- Keep deps updated (`npm outdated`, `npx updates`)
- Run `npm audit` before deploys
- Enable Dependabot on the repo

## Quick Checklist (Pre-Deploy)

- [ ] Auth endpoints rate limited (5/15min)
- [ ] All inputs validated with Zod
- [ ] No secrets in code / env vars set
- [ ] Security headers set on all responses
- [ ] CORS restrictively configured
- [ ] Error responses don't leak internals
- [ ] Session cookies are HttpOnly + Secure + SameSite
- [ ] Resource ownership verified in all queries
