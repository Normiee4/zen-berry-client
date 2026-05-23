# Zen Berry Client

## Commands
- `npm run dev` - Start dev server (http://localhost:3000)
- `npm run build` - Production build
- `npm run lint` - ESLint (flat config in `eslint.config.mjs`)

## Tech Stack
- Next.js 16.2.1 (canary) with App Router
- React 19.2.4
- Tailwind CSS v4 (`@tailwindcss/postcss` in postcss.config.mjs)
- shadcn/ui (radix-nova style, rsc: true, components in `components/ui/`)
- Supabase (`@supabase/ssr`)
- Zustand (client state), TanStack React Query (server data)
- TypeScript (strict mode, `@/*` path alias → `./*`)

## Project Structure
```
app/          - Next.js App Router pages & API route handlers
components/   - React components (dashboard/, ui/)
lib/          - Utilities, helpers
hooks/        - Custom React hooks
```

## Database Tables
| Table | Purpose |
|-------|---------|
| `tasks` | MIT (is_mit=true, max 3) and Brain Dump tasks |
| `session_logs` | Individual Pomodoro records |
| `daily_activity_log` | Hourly activity for AI peak hours analysis |
| `daily_stats` | Aggregated daily metrics |

## API Routes (Next.js Route Handlers)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST/PATCH/DELETE | `/api/tasks` | Task CRUD (MIT limit enforced: 3) |
| POST | `/api/sessions` | Log completed Pomodoro |
| GET | `/api/analytics/summary` | Today's stats + peak hours |
| GET | `/api/analytics/history` | Weekly/monthly chart data |
| POST | `/api/ai/review` | AI insight via Gemini (10/day rate limit) |

## Critical Notes
- **CI broken**: `.github/workflows/ci.yml` runs `npm test` but no test script in package.json — needs fixing
- **ESLint**: Uses flat config (`eslint.config.mjs`), NOT `.eslintrc.json`
- **Env**: `.env` = production keys (do not commit), `.env.dev.local` = dev Supabase placeholders
- **Auth**: Supabase Auth with JWT in httpOnly cookies. No RBAC — only user and dev/admin tiers
- **Security**: Rate limiting, Zod input validation, owner-check authorization pattern. See `docs/security/SKILL.md`

## Required Env Vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, defaults to `gemini-2.0-flash`)

## Reference Docs
- `docs/DESIGN.md` — Architecture, DB schema, analytics flow, AI feature spec, implementation phases
- `docs/SCHEMA.md` — ER diagram, full API route listing, route priority, response examples
- `docs/security/SKILL.md` — Security guidelines (auth, validation, rate limiting, session management)
- `docs/prd.md` — Product requirements
- `docs/frontend-design/SKILLS.md` — UI/design guidelines
