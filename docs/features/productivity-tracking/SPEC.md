# Feature: Productivity Tracking

- Type: new
- Status: new
- Created: 2026-06-19
- Updated: 2026-06-19

## Requirements

- Add a new "Productivity" sidebar tab in the dashboard navigation alongside existing "Focus" and "Pins" tabs
- The Productivity page (`/dashboard/productivity`) displays a set of KPI tracker cards showing the user's productivity insights, performance metrics, and lifetime totals
- KPIs must include:
  - **Today's stats**: pomodoros completed, tasks completed, MITs completed, focus minutes, breaks taken
  - **Current streak**: how many consecutive days the user has been active
  - **Weekly performance chart**: a bar chart of pomodoros per day for the current week (reuse existing `AnalyticsChart` component)
  - **Lifetime totals**: total tasks completed all-time, total pomodoros all-time, total focus hours all-time, total sessions completed
  - **Peak productivity hours**: the user's most productive time window (reuse existing data from summary endpoint)
  - **Consistency rate**: percentage of days the user was active in the last 7/30 days
  - **Week-over-week comparison**: percentage change in pomodoros, tasks, and focus minutes compared to the previous week
- All data must come from the existing Supabase tables (`daily_stats`, `session_logs`, `tasks`, `daily_activity_log`)
- Follow the 3-layer API pattern (`route.ts` → `controller.ts` → `service.ts`)
- Follow the existing dashboard layout pattern (client page, React Query for data fetching, shadcn/ui styling, Tailwind CSS v4)
- Use existing `@/lib/auth-helpers` for auth resolution in controllers

## Implementation Plan

### 1. Files to Create

#### 1.1 New Page Route
**`app/dashboard/productivity/page.tsx`**
- Client component (`"use client"`)
- Fetches productivity data via `useQuery` hook
- Renders the productivity dashboard:
  - Page header with title "Productivity" and subtitle
  - KPI cards grid (today's stats)
  - Weekly performance chart
  - Lifetime totals section
  - Peak hours card
  - Consistency + comparison section
- Uses `<ErrorBoundary>` wrappers around each section (matching existing pattern in `dashboard/page.tsx`)

#### 1.2 New API Endpoint
**`app/api/productivity/route.ts`**
- `GET` handler, delegates to controller, ≤3 lines

**`app/api/productivity/controller.ts`**
- Parses request, resolves user via `resolveUser()`
- Calls service functions to fetch:
  - Today's stats (pomodoros, tasks, MITs, focus minutes, breaks)
  - Current streak
  - Lifetime totals (tasks, pomodoros, focus minutes, sessions)
  - Weekly history data for chart + weekly totals
  - Previous week data for comparison
  - Peak hours
  - Consistency metrics (active days in period)
- Formats and returns JSON response

**`app/api/productivity/service.ts`**
- Supabase query functions:
  - `fetchTodayStats(supabase, userId)` — daily_stats for today
  - `fetchTodayTasksCompleted(supabase, userId)` — count of tasks completed today
  - `fetchTodayMITsCompleted(supabase, userId)` — count of MITs completed today
  - `fetchTodayFocusMinutes(supabase, userId)` — sum of duration_minutes from session_logs today (was_break=false)
  - `fetchTodayBreaks(supabase, userId)` — count of breaks today
  - `fetchLifetimeTaskCount(supabase, userId)` — count of all completed tasks
  - `fetchLifetimeStats(supabase, userId)` — sum of daily_pomodoro and daily_task_completed across all daily_stats rows
  - `fetchLifetimeSessionCount(supabase, userId)` — count of all non-break sessions
  - `fetchDailyStatsRange(supabase, userId, startDate, endDate)` — already exists in analytics/history, extract to shared lib or duplicate (per DRY rule, wait for 3rd occurrence before extracting)
  - `fetchActiveDaysInRange(supabase, userId, startDate, endDate)` — count of distinct dates where the user had activity
  - `fetchPeakHours(supabase, userId)` — reuse or duplicate from analytics/summary

#### 1.3 New React Query Hook
**`hooks/useProductivity.ts`**
- Custom hook wrapping `useQuery` with queryKey `["productivity"]`
- Fetches `GET /api/productivity`
- Returns typed data, loading state, and error state
- Follows existing hook patterns in `hooks/useTasksApi.ts`

#### 1.4 New Components
**`components/dashboard/productivity/ProductivityKPIGrid.tsx`**
- Props: `today: TodayStats`
- Renders a 2×2 or 4-column grid of stat cards:
  - Pomodoros completed today
  - Tasks completed today
  - Focus minutes today
  - Current streak
- Each card shows icon, value, and label
- Styled consistently with existing cards (rounded-3xl, soft background colors)

**`components/dashboard/productivity/ProductivityKPICard.tsx`**
- Reusable atomic card component
- Props: `label: string`, `value: string | number`, `icon: React.ReactNode`, `color?: string`, `trend?: { value: number; isPositive: boolean }`
- Renders a single KPI stat card

**`components/dashboard/productivity/ProductivityLifetime.tsx`**
- Props: `lifetime: LifetimeStats`
- Displays lifetime totals: total tasks, total pomodoros, total focus hours, total sessions
- Rendered as a 2×2 grid or horizontal bar of stats

**`components/dashboard/productivity/ProductivityPeakHours.tsx`**
- Props: `peakHours: PeakHours | null`
- Shows the user's most productive time window (e.g., "10:00 – 12:00")
- Displays an inline bar/visual representation of the peak window
- Gracefully handles null/empty state

**`components/dashboard/productivity/ProductivityConsistency.tsx`**
- Props: `consistency: { activeDays: number; totalDays: number; rate: number }`
- Shows consistency percentage with a circular or linear progress indicator
- Displays "X of Y days active this period"
- Color-coded: green for ≥80%, yellow for ≥50%, red for <50%

**`components/dashboard/productivity/ProductivityComparison.tsx`**
- Props: `comparison: { pomodorosChange: number; tasksChange: number; focusChange: number } | null`
- Shows week-over-week change for each metric with up/down arrows
- Positive changes in green, negative in red

### 2. Files to Modify

#### 2.1 Sidebar Navigation
**`components/sidebar/sidebar.tsx`**
- Add a new nav item to the `navItems` array:
  ```ts
  { href: "/dashboard/productivity", label: "Productivity", icon: BarChart3 }
  ```
- Import `BarChart3` from `lucide-react`

### 3. API Data Flow

```
Browser                        Next.js Server                     Supabase
  │                                │                                 │
  │  GET /dashboard/productivity   │                                 │
  │  ─────────────────────────►    │                                 │
  │                                │                                 │
  │                                │  route.ts delegates to          │
  │                                │  controller.ts                  │
  │                                │       │                         │
  │                                │  resolveUser(request)           │
  │                                │       │                         │
  │                                │       ▼                         │
  │                                │  service.ts calls 7+ queries    │
  │                                │  in parallel via Promise.all    │
  │                                │       │                         │
  │                                │       ▼                         │
  │                                │  ────────────────►              │
  │                                │  ◄────────────────              │
  │                                │                                 │
  │                                │  controller formats response    │
  │                                │       │                         │
  │  JSON response ◄───────────────┘       │                         │
  │       │                                                         │
  │  useProductivity()            │                                 │
  │  caches in React Query        │                                 │
  │  (queryKey: ["productivity"], │                                 │
  │   staleTime: 30s)             │                                 │
  │       │                                                         │
  │  Components re-render         │                                 │
  │  with data                    │                                 │
```

### 4. Response Shape

```typescript
interface ProductivityResponse {
  today: {
    pomodorosCompleted: number
    tasksCompleted: number
    mitsCompleted: number
    focusMinutes: number
    breakCount: number
  }
  streak: number
  lifetime: {
    totalTasks: number
    totalPomodoros: number
    totalFocusMinutes: number
    totalSessions: number
  }
  weeklyHistory: Array<{
    date: string
    day: string
    pomodoros: number
    tasks: number
    focusMinutes: number
  }>
  weeklyTotals: {
    pomodoros: number
    tasks: number
    focusMinutes: number
  }
  peakHours: {
    start: number // hour (0-23)
    end: number   // hour (0-23)
    avgPomodoros: number
  } | null
  consistency: {
    activeDays: number
    totalDays: number
    rate: number // 0-100 percentage
  }
  comparison: {
    pomodorosChange: number   // percentage change (e.g., 15 for +15%, -10 for -10%)
    tasksChange: number
    focusChange: number
  } | null
}
```

### 5. Data Fetching Strategy

- **Single endpoint, single query**: Use one `GET /api/productivity` call via `useQuery` with `staleTime: 30_000` (matching existing patterns)
- **Invalidation**: The productivity data should be invalidated when tasks or sessions change (timer completes, task is checked off). Add `queryClient.invalidateQueries({ queryKey: ["productivity"] })` to:
  - Task completion/mutation in `useTasksApi.ts`
  - Timer completion handler (where session_logs are recorded)
- **Refetch on focus**: `refetchOnWindowFocus: true` for fresh data when returning to the tab

### 6. Component Tree

```
DashboardLayout (app/dashboard/layout.tsx)
  └── Sidebar (with new "Productivity" nav item)
  └── main
       └── ProductivityPage (app/dashboard/productivity/page.tsx)
            ├── PageHeader ("Productivity" title + description)
            ├── ProductivityKPIGrid
            │    ├── ProductivityKPICard (pomodoros today)
            │    ├── ProductivityKPICard (tasks today)
            │    ├── ProductivityKPICard (focus today)
            │    └── ProductivityKPICard (streak)
            ├── AnalyticsChart (reused from components/dashboard/Analytics-chart.tsx)
            ├── ProductivityLifetime
            │    ├── stat (total tasks)
            │    ├── stat (total pomodoros)
            │    ├── stat (total focus hours)
            │    └── stat (total sessions)
            ├── ProductivityPeakHours
            ├── ProductivityConsistency
            └── ProductivityComparison
```

## Acceptance Criteria

- [ ] Sidebar shows a "Productivity" nav item with a chart icon (e.g., `BarChart3` from lucide-react)
- [ ] Clicking "Productivity" navigates to `/dashboard/productivity` and highlights the nav item
- [ ] The page renders a header "Productivity" with a subtitle "Your performance at a glance"
- [ ] KPI grid shows 4 cards: pomodoros today, tasks today, focus minutes today, and current streak
- [ ] Each KPI card displays the correct numeric value from the API, or `0` / `--` when no data exists
- [ ] Weekly chart renders with bar chart showing pomodoros per day (reused `AnalyticsChart`)
- [ ] Lifetime totals section shows total tasks, total pomodoros, total focus hours, and total sessions
- [ ] Peak hours card renders when data exists, or shows a "No data yet" message when null
- [ ] Consistency rate shows percentage with color coding (green ≥ 80%, yellow ≥ 50%, red < 50%)
- [ ] Week-over-week comparison shows percentage deltas with up/down arrows and color coding
- [ ] All sections handle loading state (skeleton/spinner matches existing pattern)
- [ ] All sections handle error state (fallback message, does not break the page)
- [ ] All sections handle empty state (shows "No data yet" or `0` instead of NaN/undefined)
- [ ] API controller returns correctly structured JSON for both authenticated and unauthenticated users
- [ ] API controller returns 200 with zeroed data when user has no activity yet
- [ ] API controller handles Supabase errors gracefully, returns 500 with `{ error: string }`
- [ ] React Query hook has correct `queryKey: ["productivity"]` and `staleTime: 30000`
- [ ] No new dependencies required beyond existing ones (recharts, lucide-react, @tanstack/react-query)
- [ ] All new files follow kebab-case naming convention
- [ ] All new code uses named exports only (no `export default` except page.tsx)
- [ ] API follows 3-layer pattern: route.ts (≤3 lines) → controller.ts (orchestration) → service.ts (queries)
- [ ] Service layer uses `@/lib/auth-helpers` for Supabase client creation, not inline `createClient()`
