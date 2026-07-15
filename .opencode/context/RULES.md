# Zen Berry Coding Rules

## 1. Naming Conventions (Strict)

### File Names — kebab-case everywhere

| Directory | Convention | Before → After |
|-----------|-----------|----------------|
| `components/**/*.tsx` | kebab-case | `Brain-dump-card.tsx` → `brain-dump-card.tsx` |
| `hooks/*.ts` | kebab-case | `useTasks.ts` → `use-tasks.ts` |
| `lib/**/*.ts` | kebab-case (ok) | — |
| `store/*.ts` | kebab-case (ok) | — |
| `app/**/*.ts` | kebab-case (ok) | — |

**Exceptions:** Only `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts` (Next.js convention — these must stay as-is).

### Code Identifiers

| Construct | Convention | Examples |
|-----------|-----------|----------|
| Component functions | PascalCase | `export function BrainDumpCard()` |
| Hooks | camelCase, `use` prefix | `export function useTasks()` |
| Regular functions/variables | camelCase | `fetchTasks`, `formattedTasks` |
| Booleans | `is`/`has`/`should` prefix | `isComplete`, `hasError`, `shouldRefetch` |
| Types/Interfaces | PascalCase | `TaskRow`, `FormattedTask`, `TimerState` |
| Component props | PascalCase + `Props` suffix | `interface BrainDumpCardProps` |
| DB row types | PascalCase + `Row` suffix | `TaskRow`, `SessionLogRow` |
| API response types | PascalCase + `Response` suffix | `AIReviewResponse` |
| Enums | PascalCase, singular | `enum TimerMode` |

### Exports

- **Named exports only** — no `export default` (except Next.js page/layout files, which require it)
- One component/function per file (exceptions: small tightly coupled helpers)

---

## 2. Architectural Rules (SOLID)

### Single Responsibility — One job per file

```
route.ts       →   Named HTTP handler (GET/POST/etc), ≤3 lines, calls controller
controller.ts  →   Request parsing, auth resolution, response formatting, orchestration
service.ts     →   Business Logic and Data access only (Supabase queries/mutations)
```

**Check:** A file should have one reason to change. If a controller formats responses AND builds Supabase queries, split it.

### Open/Closed — Extend, don't modify

- New behavior → new endpoint or new middleware, not branching on `action` fields in existing handlers
- The `action`-field pattern in `timer-service/controller.ts` is an anti-pattern — avoid in new code

### Liskov Substitution — Consistent abstractions

- All API handlers follow the same `(request: NextRequest) → Promise<NextResponse>` signature
- All service functions return plain data objects, never `NextResponse`

### Interface Segregation — Focused types

- Separate DB row types from API response types (`TaskRow` ≠ `FormattedTask`)
- Don't reuse a single `any` or overly broad type across domains
- Component props interfaces should only include what that component needs

### Dependency Inversion — Depend on abstractions

- Controllers call service-layer functions, never `supabase.from(...)` directly
- Service files import their Supabase client from `@/lib/auth-helpers`, not create their own
- No inline `createClient()` in service files — use the shared `createSupabaseClient()` from `@/lib/`

---

## 3. DRY — Extract at 4+ Occurrences

Any identical logic block appearing in **4 or more files** must be extracted to `@/lib/` or `@/util/`.

### Current Violations (to fix in a follow-up pass)

| Pattern | Files Affected | Target |
|---------|---------------|--------|
| `getCookieValue()` | 7 service files | Extract to `@/lib/auth-helpers` |
| `createSupabaseClient()` | 7 service files | Merge into `@/lib/auth-helpers` |
| `getAuthenticatedUser()` | 7 service files | Extract to `@/lib/auth-helpers` |
| `getToday()` / `getYesterday()` | 3 service files | Extract to `@/lib/date-utils` |
| Identical try/catch + `console.error` + 500 response | 15+ controllers | Extract to wrapper function |
| `copyAuthCookies()` | 2 controllers | Extract to `@/lib/auth-helpers` |

### Rule of thumb
1. First occurrence — inline is fine
2. Second occurrence — wait, see if a third appears
3. Third occurrence — extract immediately

---

## 4. KISS — Keep It Simple

- **Prefer `if/return`** over ternary chains beyond 2 branches
- **No premature abstraction** — extract only when the third occurrence materializes (see DRY rule)
- **Prefer server components** (`"use client"` only when hooks, browser APIs, or event handlers are needed)
- **Keep functions small** — if a function exceeds ~40 lines, extract a helper
- **Avoid fancy patterns** — no HOCs, render props, or compound components unless they reduce complexity vs. the simple alternative
- **Prefer flat over nested** — return early, avoid callback nesting, avoid deep ternary chains
- **Simple state** — Zustand for client state, React Query for server state, local `useState` for ephemeral UI state. No Redux, no Context for data that fits one of these three.

---

## 5. Coding Standards

### Validation
- Use **Zod schemas** in controllers — no inline `if (!title || typeof title !== 'string')` checks
- Schemas live in `@/lib/input-validator.ts` or co-located with the controller
- Parse with `.parse()` (throws) in controllers, `.safeParse()` for conditional logic

### Error Handling
- Controllers use a shared `try/catch` or the `withErrorHandler()` wrapper (once extracted)
- User-facing errors: `toast.error()` via `sonner`
- API errors: structured `{ error: string, details?: unknown }` with appropriate status codes
- Always distinguish between client errors (4xx) and server errors (5xx)

### TypeScript
- **No `any`** — use `unknown` + type narrowing
- Prefer `interface` over `type` for object shapes (extends better)
- Use `type` for unions, intersections, and utility types
- All function params and return types must be explicitly typed

### Imports
- Use `@/` path alias for all project imports (never relative `../../`)
- Order: external → internal → relative (enforced by human review until ESLint is added)

### State Management
- **Server data** → TanStack React Query (queries + mutations)
- **Client-only ephemeral data** → `useState` / `useReducer`
- **Client-only persisted data** → Zustand with localStorage
- **URL state** → Next.js search params (`useSearchParams`)
- Do not store server data in Zustand (dual source of truth risk)

### Security (see `docs/security/SKILL.md`)
- All API routes require auth (checked in middleware + controller)
- RLS policies on all tables
- Zod validates all user input
- Rate limit AI endpoints
- Never log or expose secrets in client code or error messages
