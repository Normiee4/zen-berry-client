# Zen Berry Architecture

## 1. System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      Vercel (Edge)                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                 Next.js 16 (App Router)                    │  │
│  │                                                            │  │
│  │  ┌──────────────┐ ┌───────────┐ ┌───────────┐             │  │
│  │  │   Pages/SPA  │ │  Zustand  │ │  TanStack │             │  │
│  │  │  (dashboard, │ │  (Timer,  │ │   Query   │             │  │
│  │  │   auth, etc) │ │  Streak)  │ │ (Server   │             │  │
│  │  └──────┬───────┘ └───────────┘ │  State)   │             │  │
│  │         │                       └─────┬─────┘             │  │
│  │         └──────────────┬──────────────┘                   │  │
│  │                        ▼                                  │  │
│  │  ┌──────────────────────────────────────────────────┐     │  │
│  │  │           API Routes (REST, 3-Layer)             │     │  │
│  │  │  /api/tasks · /api/sessions · /api/analytics    │     │  │
│  │  │  /api/ai · /api/pins · /api/feedback            │     │  │
│  │  │  route.ts → controller.ts → service.ts          │     │  │
│  │  └──────────────────────┬───────────────────────────┘     │  │
│  │                         │                                 │  │
│  │  ┌──────────────────────▼───────────────────────────┐     │  │
│  │  │          Middleware (proxy.ts)                    │     │  │
│  │  │  Beta Bypass → Auth → Validation → Error Handler │     │  │
│  │  └──────────────────────────────────────────────────┘     │  │
│  └────────────────────────────┬──────────────────────────────┘  │
│                               │                                 │
└───────────────────────────────┼─────────────────────────────────┘
                                │
                   ┌────────────┴────────────┐
                   │                         │
        ┌──────────▼─────┐          ┌────────▼────────┐
        │     Supabase   │          │   Gemini API    │
        │  Auth + PostgreSQL│       │   (Google AI)   │
        └────────────────┘          └─────────────────┘
```

- **Deployment model**: Monolithic — frontend + API served from a single Next.js process on Vercel
- **External services**: Supabase Auth + PostgreSQL, Google Gemini API
- **No separate backend** — all server logic is Next.js Route Handlers (`app/api/`)

---

## 2. Architectural Styles

### 2.1 Layered Architecture (3-Layer)

Every API endpoint under `app/api/<name>/` follows a strict file trio:

```
route.ts           HTTP handler (GET/POST/etc), ≤3 lines, delegates to controller
  │
  ▼
controller.ts      Request parsing, auth resolution, response formatting, orchestration
  │
  ▼
service.ts         Supabase queries/mutations only, returns plain data objects
```

**Key rules:**
- Controllers never call `supabase.from(...)` directly — they delegate to service functions
- Services never return `NextResponse` — they return data objects or Supabase results
- Routes never contain business logic — they are thin dispatchers

**Known deviations:**
| Endpoint | Deviation |
|----------|-----------|
| `app/api/waitlist/route.ts` | No controller/service — inline Supabase call in route handler (excluded from middleware auth) |
| `app/api/pins/reorder/route.ts` | No controller — route handler calls service directly |
| `app/api/timer-service/controller.ts` | Uses `action`-field branching (`recordCompletion`, `recordBreak`, `updatePreset`) — documented anti-pattern |
| `app/api/auth-service/` | Shared parent `controller.ts` + `service.ts` for 5 sub-routes, not per-endpoint files |
| `app/api/analytics/summary/`, `history/` | No local `service.ts` — share parent `app/api/analytics/service.ts` (also used by productivity) |

### 2.2 Domain-Driven Directory Structure

Each `app/api/<name>/` directory is a bounded context with its own data ownership:

| Domain | Tables Owned | Routes | Notes |
|--------|-------------|--------|-------|
| `auth-service/` | `users` | POST login, logout, register, forgot-password; GET/PATCH/DELETE me | Shared controller/service at parent level |
| `tasks/` | `tasks` | GET, POST, PUT, DELETE | MIT limit (3) enforced in controller |
| `sessions/` | `session_logs`, `daily_stats`, `daily_activity_log` | GET, POST | Triple-write on completion |
| `analytics/` | (reads all) | GET summary, GET history | Read-only; shared service for sub-endpoints |
| `ai/` | `ai_insights` | POST review, GET insights/latest | Gemini integration; rate-limited |
| `pins/` | `pins` | GET, POST, PATCH, DELETE, POST reorder | Full CRUD + batch reorder |
| `feedback/` | `reviews`, `reports` | POST review, POST report, GET reports, PATCH reports/[id] | Two sub-directories for create vs list |
| `waitlist/` | `waitlist` | POST | Simple single-endpoint, no auth required |

### 2.3 Spec-Driven Development (SDD)

Features follow a strict spec-first protocol via the `/ship` command:

```
planner → writes SPEC.md in docs/features/<name>/
builder → implements code from spec
reviewer → audits code against spec (max 3 loops)
tester → writes TEST-SPEC.md + tests
reviewer → audits tests against spec (max 3 loops)
```

See `.opencode/context/SHIPPING.md` for the full protocol.

---

## 3. Middleware Pipeline

All requests flow through `proxy.ts` (root of project, not `middleware.ts`):

```
Incoming Request
    │
    ▼
┌─────────────────────────────┐
│ Beta Bypass Check           │  ← ?beta_secret cookie, skips all auth
│ (proxy.ts:9-30)             │
└─────────┬───────────────────┘
          │ (not bypassed)
          ▼
┌─────────────────────────────┐
│ authorizationMiddleware     │  ← Sets X-User-Id header from Supabase session
│ (lib/middleware/)           │     Redirects unauthenticated dashboard/auth requests
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ validationMiddleware        │  ← Request body validation (Zod)
│ (lib/middleware/)           │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ withErrorHandler            │  ← Catches all middleware errors, returns 500
│ (lib/middleware/)           │
└─────────────────────────────┘
```

**Matcher** (from `proxy.ts`):
```ts
matcher: ['/dashboard/:path*', '/api/((?!waitlist|auth-service).*)', '/auth/:path*']
```

- `waitlist/` and `auth-service/` routes are excluded from middleware auth
- Auth-service handles its own authentication internally
- Next.js 16 supports both `proxy.ts` and `middleware.ts` as valid middleware filenames

---

## 4. Client Layer Architecture

### 4.1 Route Structure

```
app/
├── auth/              Login, signup, waitlist, password reset pages
├── dashboard/         Main application (requires auth)
│   ├── page.tsx       3-column grid: Timer|MIT|AI, Streak|BrainDump|Recap
│   ├── pins/          Pin management page
│   ├── productivity/  Analytics/charts page
│   └── profile/       User settings page
├── feedback/          Review/report submission page
├── api/               All REST endpoints
├── providers.tsx      TanStack Query + Toaster wrapper
└── layout.tsx         Root layout (Nunito Sans font, theme resolution)
```

### 4.2 State Management Strategy

```
┌──────────────────────────────────────────────────────────┐
│                    State Ownership                        │
├──────────────┬───────────────────┬───────────────────────┤
│  TanStack    │   Zustand         │   useState            │
│  React Query │   (timer-store)   │   (ephemeral UI)      │
│              │                   │                       │
│  Server data │   Timer state     │   Dialog open/close   │
│  Tasks       │   Presets         │   Form input values   │
│  Sessions    │   Streak          │   Tab selection       │
│  Analytics   │   Alarm sound     │   Pending drag state  │
│  Insights    │   (all persist    │                       │
│              │    to localStorage)│                       │
└──────────────┴───────────────────┴───────────────────────┘
```

**Rule:** Server data never goes in Zustand — TanStack Query is the single source of truth.

### 4.3 ViewModel Pattern (MVVM-style)

Hooks act as ViewModels, insulating components from data source details. The pattern is implemented pragmatically — strict where it adds value, relaxed where complexity is low.

#### Clean Example: Tasks (`useMITApi` / `useTasksApi` as real ViewModels)

```
User clicks "Add MIT"
       │
       ▼
┌───────────────────────────────┐
│  VIEW                         │
│  Mit-card.tsx                 │  calls addMIT("Write spec")
│  Brain-dump-card.tsx          │
│  DashboardPage                │
└──────────┬────────────────────┘
           │ addMIT(title)
           ▼
┌───────────────────────────────┐
│  VIEWMODEL                    │
│  useMITApi.ts                 │
│                               │
│  ┌─────────────────────────┐  │
│  │ Transforms data          │  │  raw API → { id, title, isMIT }
│  │ Manages actions          │  │  addMIT → POST /api/tasks
│  │ Handles errors           │  │  toast.error() on failure
│  │ Invalidates query cache  │  │  invalidateQueries(["tasks"])
│  └─────────────────────────┘  │
└──────────┬────────────────────┘
           │ fetch /api/tasks
           ▼
┌───────────────────────────────┐
│  MODEL                        │
│  TanStack Query cache         │
│                               │
│  ┌─────────────────────────┐  │
│  │ API Layer                │  │  route → controller → service → Supabase
│  │ Supabase Response        │  │  raw JSON from server
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

**Data flow on read:** `Supabase → API Layer → TanStack Cache → ViewModel (transform) → View`

**Action flow on write:** `View → ViewModel action → POST /api/tasks → Supabase → ViewModel invalidates cache → cache refills → View re-renders`

#### Hybrid Example: Timer (`useTimer` as thin ViewModel)

```
┌───────────────────────────────┐
│  VIEW                         │
│  Timer-card.tsx               │
│                               │
│  Some reads through ViewModel:│  mode, timeLeft, isRunning via useTimer()
│  Some reads bypass ViewModel: │  useTimerStore() directly
└──────────┬────────────────────┘
           │
           ▼
┌───────────────────────────────┐
│  VIEWMODEL / DIRECT ACCESS    │
│                               │
│  ┌─────────────────────────┐  │
│  │ useTimer()               │  │  thin pass-through, barely adds logic
│  │                         │  │
│  │ useTimerStore()          │  │  direct access, skips ViewModel layer
│  └─────────────────────────┘  │
└──────────┬────────────────────┘
           │
           ▼
┌───────────────────────────────┐
│  MODEL                        │
│  Zustand + localStorage       │
│  store/timer-store.ts         │
│                               │
│  ┌─────────────────────────┐  │
│  │ TimerPreset[]            │  │  zenberry_timer_presets
│  │ StreakState              │  │  zenberry_timer_streak
│  │ ActiveSession            │  │  zenberry_active_session
│  │ AlarmSound               │  │  zenberry_timer_alarm_sound
│  │ subscribeWithSelector    │  │  drives tick() via setInterval
│  └─────────────────────────┘  │
└───────────────────────────────┘
```

#### ViewModel Strictness by Domain

| Data Source | ViewModel | View Access | Pattern |
|---|---|---|---|
| Tasks / MITs | `useTasksApi` / `useMITApi` | Only through hooks | Strict MVVM |
| Timer state | `useTimer` (thin) | Some direct store access | Relaxed |
| Analytics | No dedicated hook | Inline `useQuery` calls | No ViewModel |
| Streak | Read from Zustand directly | No ViewModel | No ViewModel |

The ViewModel layer exists where it earned its keep — combining data sources (TanStack + local state), transforming server types to view types, and centralizing error handling. Domains with simple data access skip it. This is pragmatic MVVM, not dogmatic.

### 4.4 Hook Duality

| Purpose | Legacy (localStorage) | Current (API-backed) |
|---------|----------------------|----------------------|
| Tasks | `useTasks.ts` | `useTasksApi.ts` |
| MITs | `useMIT.ts` | `useMITApi.ts` |

Current hooks use TanStack Query + `/api/tasks`. Legacy hooks are localStorage-only. Do not use legacy hooks in new code.

### 4.5 TanStack Query Keys

```typescript
export const queryKeys = {
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (filters: TaskFilters) => [...queryKeys.tasks.lists(), filters] as const,
  },
  analytics: {
    summary: ['analytics', 'summary'] as const,
    history: (period: string, cursor?: string) => ['analytics', 'history', period, cursor] as const,
    insights: ['analytics', 'insights'] as const,
  },
  sessions: {
    all: ['sessions'] as const,
  }
};
```

### 4.6 Component Tree

```
components/dashboard/
├── Timer-card.tsx          Zustand-backed timer with presets, alarm
├── Streak-card.tsx         Reads streak from Zustand store
├── MIT-card.tsx            Task CRUD via useMITApi hook
├── Brain-dump-card.tsx     Task CRUD via useTasksApi hook
├── AI-insights-card.tsx    AI review trigger + display
├── Matcha-progress-card.tsx Today's analytics summary
├── Analytics-chart.tsx     Recharts-based weekly history
└── Hourly-heatmap.tsx      Optional hourly activity viz
```

---

## 5. Data Layer

### 5.1 Table Relationships

```
auth.users
    │
    ├── tasks              (user_id FK)
    ├── session_logs       (user_id FK)
    ├── daily_stats        (user_id FK, unique per date)
    ├── daily_activity_log (user_id FK, unique per date+hour)
    ├── timer_presets      (user_id FK)
    ├── ai_insights        (user_id FK, unique per date)
    ├── pins               (user_id FK)
    ├── reviews            (user_id FK)
    ├── reports            (user_id FK)
    └── waitlist           (no FK, not linked to auth)
```

### 5.2 RLS Strategy

Every table uses Row-Level Security. The default policy: users can only see/modify their own rows (identified by `auth.uid()` = `user_id`). The `waitlist` table is the only exception (public insert). The `reviews` table allows public SELECT but restricts writes to own user_id.

### 5.3 Migration Workflow

Migrations live in `supabase/migrations/` as SQL files. They are **applied via the Supabase dashboard**, not through code. Do not edit existing migration files — write new ones.

### 5.4 Aspirational vs Actual Schema

The SCHEMA.md lists many more API routes than currently implemented. The route priority (MVP → Phase 2 → Phase 3) defined there reflects the build roadmap. The actual codebase has all MVP routes and most Phase 2 routes implemented. The difference between SCHEMA.md and the real `app/api/` directory represents planned vs shipped endpoints.

---

## 6. Auth Flow

```
Client                         proxy.ts                    Controller
  │                               │                           │
  │  request                       │                           │
  │──────────────────────────────> │                           │
  │                               │                           │
  │                               │  beta_bypass cookie?      │
  │                               │  ─────────────────────    │
  │                               │  YES → skip auth          │
  │                               │                           │
  │                               │  NO → getSession()        │
  │                               │  ─────────────────────    │
  │                               │  set X-User-Id header     │
  │                               │                           │
  │                               │  forward to controller    │
  │                               │──────────────────────────>│
  │                               │                           │
  │                               │                    resolveUser()
  │                               │                    ────────────
  │                               │                    1. Read X-User-Id
  │                               │                    2. Fallback: getUser()
  │                               │                           │
  │  response                     │                           │
  │<──────────────────────────────│───────────────────────────│
```

**Beta bypass**: URL param `?beta_secret=<secret>` sets a cookie for 7 days, skipping all auth checks. Valid secrets come from `BETA_BYPASS_SECRETS` env var (comma-separated).

---

## 7. Data Flow Walkthrough: Pomodoro Completion

```
Timer tick (Zustand store/timer-store.ts)
    │
    │ timeLeft <= 0 && mode === 'focus'
    ▼
useTimerStore.tick()
    │
    ├── Updates streak in localStorage (zenberry_timer_streak)
    ├── Sets completedFocusCycle = true
    │
    │ Component detects completedFocusCycle
    ▼
POST /api/sessions
    │  body: { action: "recordCompletion", durationMinutes, wasBreak, presetUsed }
    ▼
sessions/controller.ts
    │
    ├── resolveUser() → gets userId + Supabase client
    │
    ├── Promise.all([
    │     insertSessionLog()        → session_logs table
    │     recordPomodoroInDailyStats() → daily_stats (upsert)
    │     incrementHourlyActivity() → daily_activity_log (upsert)
    │   ])
    │
    ▼
Response: { session, streak }
    │
    │ TanStack Query invalidation
    ▼
    ├── queryClient.invalidateQueries({ queryKey: ["tasks"] })
    ├── queryClient.invalidateQueries({ queryKey: ["analytics-summary"] })
    │
    ▼
Dashboard components re-render with fresh data
```

---

## 8. Analytics Data Flow

### 8.1 Data Collection Pipeline

```
User completes Pomodoro timer
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│ Frontend: useTimerStore tick() detects timeLeft <= 0      │
│           + mode === 'focus'                               │
│           → call POST /api/sessions                        │
└────────────────────────────────────────────────────────────┘
        │
        ▼
┌────────────────────────────────────────────────────────────┐
│ /api/sessions (POST)                                       │
│ 1. recordPomodoro() service → update daily_stats          │
│ 2. createSessionLog() → insert session_logs               │
│ 3. updateHourlyActivity() → upsert daily_activity_log    │
└────────────────────────────────────────────────────────────┘
        │
        ▼
TanStack Query onUseSuccess → invalidates analytics queries
        │
        ▼
Dashboard charts re-fetch and update automatically
```

### 8.2 Hourly Activity Tracking

```typescript
// When recording Pomodoro completion:
const hourSlot = new Date().getHours();

await supabase.from('daily_activity_log').upsert({
  user_id: user.id,
  date: getToday(),
  hour_slot: hourSlot,
  pomodoros_completed: 1, // SQL: pomodoros_completed + 1
}, { onConflict: 'user_id,date,hour_slot' });
```

### 8.3 Peak Hours Calculation

```sql
-- Query to find peak 2-hour window across last 7 days
SELECT
  hour_slot as start_hour,
  hour_slot + 1 as end_hour,
  AVG(pomodoros_completed) as avg_pomodoros
FROM daily_activity_log
WHERE user_id = :userId
  AND date >= CURRENT_DATE - 7
GROUP BY hour_slot
ORDER BY avg_pomodoros DESC
LIMIT 1;
```

---

## 9. Domain Logic Highlights

### 9.1 Timer (Zustand + localStorage)
- **Timestamp-based tracking**: Uses `startTimestamp` + `initialDuration` instead of `setInterval` ticks — survives browser tab throttling
- **Session restoration**: Saved to localStorage (`zenberry_active_session`) so timer survives page refresh
- **Presets**: 3 defaults (Classic 25/5, Deep Work 50/10, Quick Sprint 15/3) plus custom; stored in `zenberry_timer_presets`
- **Streak**: Calculated from `lastPomodoroDate`; incremented on consecutive-day focus completion

### 9.2 Alarm System (Web Audio API)
- 4 sound files: bell, chime, digital, lofi (`/audio/*.mp3`)
- Preloaded into AudioBuffers by `AudioManager` class (`lib/audio-manager.ts`)
- Keep-alive mechanism prevents AudioContext suspension
- Autoplay unlock: registers pointerdown/keydown handlers for browsers that block autoplay
- Preference stored in `zenberry_timer_alarm_sound`

### 9.3 AI Review (Gemini)

#### Smart Detection Logic

**Rest Reminder Detection:**
```typescript
const lastBreak = await supabase
  .from('session_logs')
  .select('completed_at')
  .eq('user_id', user.id)
  .eq('was_break', true)
  .not('completed_at', 'is', null)
  .order('completed_at', { ascending: false })
  .limit(1)
  .single();

const hoursSinceBreak = lastBreak?.completed_at
  ? (Date.now() - new Date(lastBreak.completed_at).getTime()) / (1000 * 60 * 60)
  : null;

const needsRestReminder = hoursSinceBreak !== null && hoursSinceBreak > 3;
```

**Low Activity Detection:**
```typescript
const todayPomodoros = await supabase
  .from('daily_stats')
  .select('daily_pomodoro')
  .eq('user_id', user.id)
  .eq('date', getToday())
  .single();

if (todayPomodoros?.daily_pomodoro === 0) {
  // No activity - encourage start
}
```

#### Gemini API Integration

**Environment Variables Required:**
```
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.0-flash
```

**Prompt Engineering:**
```typescript
const generatePrompt = (data: DailyStats): string => `
You are Zen Berry, a friendly and encouraging productivity assistant.
Analyze the user's productivity data and provide a short, punchy insight.

Today's Stats:
- Focus sessions completed: ${data.pomodoros}
- Total focus time: ${data.totalFocusMinutes} minutes
- Tasks completed: ${data.tasksCompleted}
- Breaks taken: ${data.breaksTaken}
- Peak productivity hours: ${data.peakHours || 'Not enough data'}
- Hours since last break: ${data.hoursSinceBreak || 'N/A'}

${data.needsRestReminder ? 'Note: User has not taken a break in over 3 hours.' : ''}

Response format (JSON):
{
  "insight": "2 sentences max, motivational and warm",
  "suggestion": "1 specific, actionable recommendation"
}
`;
```

**API Call:**
```typescript
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
const result = await model.generateContent(prompt);
const response = JSON.parse(result.response.text());
```

#### Fallback Behavior

| Failure Scenario | Fallback Response |
|-----------------|-------------------|
| Gemini API error | `insight: "Every focus session counts! Keep the momentum going."` |
| Rate limited | `{ error: "Please wait X minutes for next review" }` |
| No data for day | `insight: "Start a focus session to unlock your daily insights!"` |
| Network timeout | Cache last successful response, show with "Last updated: [time]" |

#### Rate Limiting & Milestone Detection

- **User limit**: 10 AI reviews per day (tracked in `daily_stats.ai_review_count`)
- **Implementation**: Check before calling Gemini, increment after success
- **3-tier fallback strategy**:
  1. Gemini API available → parse JSON response
  2. Gemini API down but user has data → `generateDataAwareFallback()` constructs stat-based response
  3. No data at all → `getNoDataResponse()` returns motivational generic messages
- **Milestone detection**: First review, streak milestones (7/10/20/30/50 days), pomodoro clubs (10/50/100), perfect days

### 9.4 Drag & Drop (@hello-pangea/dnd)
- MIT ↔ Brain Dump promote/demote
- Confirmation dialog (`ConfirmDragDialog`) before executing
- MIT limit (3) enforced both client-side (`remainingSlots`) and server-side (MIT count check)

---

## 10. Cross-Cutting Concerns

### 10.1 Error Handling Pattern
Controllers use a consistent try/catch pattern:
```typescript
try {
  // ... logic ...
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 200 })
} catch (error) {
  console.error('Domain error', error)
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
}
```

### 10.2 Input Validation
- Zod schemas in `lib/input-validator.ts`
- Controllers use `.parse()` (throws) for required fields, `.safeParse()` for conditional logic
- Inline validation (`if (!title)`) — eliminated from tasks controller, still present in timer-service controller

### 10.3 Rate Limiting
- AI review: 20 requests per hour per user (checked against `ai_insights` table)
- No global IP-based rate limiting implemented yet

### 10.4 Environment Variables

```bash
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Gemini AI (new)
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash

# Optional
ANALYTICS_CACHE_SECONDS=300
AI_REVIEW_RATE_LIMIT=10
BETA_BYPASS_SECRETS=
```

### 10.5 Security
- All endpoints require authentication (via middleware)
- RLS policies on all tables
- Input validation with Zod
- Rate limiting on AI endpoint
- Never log or expose secrets in client code or error messages

### 10.6 Performance
- Parallel data fetching with Promise.all
- Cursor-based pagination for history
- Server-side aggregation (not client)
- Analytics caching (5 min default)
- Timestamp-based timer tracking survives browser tab throttling

---

## 11. Design Methodology Artifacts

| Artifact | Location | Purpose |
|----------|----------|---------|
| PRD | `.opencode/context/prd.md` | Product requirements, MVP scope |
| Architecture | This file | System wiring, layers, data flow |
| Design | `.opencode/context/DESIGN.md` | Design system — colors, typography, spacing, themes, animations, art direction, shadcn/ui tokens |
| Schema | `.opencode/context/SCHEMA.md` | Tables, all planned routes, priority tiers, response examples |
| Rules | `.opencode/context/RULES.md` | Naming, SOLID, DRY, coding standards |
| Feature Specs | `docs/features/<name>/SPEC.md` | Per-feature implementation plans |
| Test Specs | `docs/features/<name>/TEST-SPEC.md` | Per-feature test plans |
| Ship Protocol | `.opencode/context/SHIPPING.md` | Agent pipeline for feature delivery |
