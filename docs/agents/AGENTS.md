# Zen Berry Client

## Commands
- `npm run dev` - Start dev server (http://localhost:3000)
- `npm run build` - Production build
- `npm run lint` - ESLint (flat config format in `eslint.config.mjs`)

## Tech Stack
- Next.js 16.2.1 (canary) with App Router
- React 19.2.4
- Tailwind CSS v4 (configured via `@tailwindcss/postcss` in postcss.config.mjs)
- shadcn/ui (radix-nova style, rsc: true, components in `components/ui/`)
- Supabase (@supabase/ssr, @supabase/auth-helpers-nextjs)
- Zustand (state), TanStack React Query (data fetching)
- TypeScript (strict mode, paths alias `@/*` → `./*`)

## Critical Notes

### Broken CI
The CI workflow (`.github/workflows/ci.yml`) runs `npm test` but no test script exists in package.json. Either add a test framework or fix the CI.

### ESLint Config
Uses flat config (`eslint.config.mjs`), NOT `.eslintrc.json`. The .coderabbit.yml incorrectly references `.eslintrc.json`.

### Env Setup
- `.env` - Production keys (do not commit)
- `.env.dev.local` - Dev Supabase placeholders

### Path Alias
`@/components`, `@/lib`, `@/hooks`, `@/ui` all resolve to root (`./`), not `src/`.

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/POST/PATCH/DELETE | `/api/tasks` | Task CRUD (MIT limit: 3) |
| GET/POST | `/api/sessions` | Log Pomodoro sessions |
| GET | `/api/analytics/summary` | Today's stats + peak hours |
| GET | `/api/analytics/history` | Weekly/monthly chart data |
| POST | `/api/ai/review` | AI productivity insight (rate limited: 10/day) |

## Database Tables (see `docs/migrations/`)
- `tasks` - MIT and Brain Dump tasks
- `session_logs` - Individual Pomodoro records
- `daily_activity_log` - Hourly activity for AI peak hours analysis

## New Env Vars Required
- `GEMINI_API_KEY` - For AI review feature
- `GEMINI_MODEL` - Optional, defaults to `gemini-2.0-flash`