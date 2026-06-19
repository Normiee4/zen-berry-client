# Zen Berry Client

## Commands (run order: `lint` → `typecheck` → `build`)
- `npm run dev` — Dev server at http://localhost:3000
- `npm run build` — Production build (requires env vars)
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`)
- `npm run typecheck` — `tsc --noEmit`
- No test command exists — Playwright (`@playwright/test`) is in devDeps but not configured

## Core Architecture

### 3-Layer API Pattern
Every API endpoint under `app/api/<name>/` follows:
- `route.ts` — Named HTTP handlers (GET/POST/etc), ≤3 lines, delegates to controller
- `controller.ts` — Request parsing, auth resolution, response formatting
- `service.ts` — Supabase queries/mutations only, returns plain data

### Auth Flow
1. `middleware.ts` runs on all `/api/*` (except waitlist, auth-service), `/dashboard/*`, `/auth/*`
2. `authorizationMiddleware` sets `X-User-Id` header from Supabase session
3. Controllers read `X-User-Id` or call `supabase.auth.getUser()` as fallback
4. Beta bypass: ?beta_secret=<secret> cookie, uses `BETA_BYPASS_SECRETS` env var

### Middleware Matcher
```ts
matcher: ['/dashboard/:path*', '/api/((?!waitlist|auth-service).*)', '/auth/:path*']
```
Auth-service routes (`/api/auth-service/*`) handle their own auth.

### State Management
- **Server data** → TanStack React Query (queries + mutations)
- **Client persistence** → Zustand (`store/timer-store.ts` with localStorage)
- **Ephemeral UI** → `useState`
- Do not store server data in Zustand

### Supabase Clients (3 contexts)
- `lib/supabase.ts` — `createBrowserClient` (browser)
- `lib/supabase-server.ts` — `createServerSupabaseClient()` (server components), `createMiddlewareClient()` (middleware), `createRouteHandlerClient()` (route handlers)
- `lib/auth-helpers.ts` — `resolveUser()` helper for controllers

### Env Files
- `.env` (gitignored) — Production keys, do not commit
- `.env.dev.local` (checked in) — Dev Supabase placeholders + tester bypass secrets

## CI Pipelines (3 workflow files)
- `frontend-ci.yml` — `lint` (continue-on-error) → `typecheck` → `build` on PR/push to main/develop
- `backend-ci.yml` — Validates API route structure + typecheck + lint on `app/api/**` paths
- `deploy.yml` — `lint` → `typecheck` → `build` → Vercel deploy (requires VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)

## Enforced Conventions (see `.opencode/context/RULES.md`)
- **kebab-case** file names (exception: `page.tsx`, `layout.tsx`, `route.ts`, etc.)
- **Named exports only** (exception: Next.js page/layout files)
- **No `any`** — use `unknown` + narrowing
- **Zod validation** in controllers (`lib/input-validator.ts`)
- **`@/` path alias** maps to root (`./*`), not `./src/*`

## Required Env Vars
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`
- Optional: `GEMINI_MODEL` (defaults to `gemini-2.0-flash`), `BETA_BYPASS_SECRETS`

## Reference Docs
- `docs/PRD.md` — Product requirements
- `docs/DESIGN.md` — Architecture, analytics flow, AI feature spec
- `docs/SCHEMA.md` — ER diagram, full API routes with priority tiers
- `docs/security/SKILL.md` — Auth, validation, rate limiting patterns

## `/ship <feature>: <description>` Protocol
Full dev cycle via `opencode.json` agents: planner → builder → reviewer → tester → reviewer.
Two-stage review: code audit after Builder, test audit after Tester. Max 3 loops per stage.
Feature specs in `docs/features/<name>/SPEC.md`. See `.opencode/context/SHIPPING.md`.
