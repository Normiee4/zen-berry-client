# Test Spec: Productivity Tracking

## Overview
This document describes the test strategy for the Productivity Tracking feature. The feature consists of an API endpoint (`/api/productivity`) following the 3-layer pattern, a React Query hook, and multiple dashboard components.

Since the project does not currently have a unit test runner configured, test files live under `tests/` as reference specs. They are written in a standard `describe`/`it`/`expect` pattern compatible with Vitest (recommended) or Jest. Mocking patterns use `vi.mock()` (Vitest) and can be adapted to `jest.mock()` if needed.

---

## Test Layers

### 1. Service Layer — `app/api/productivity/service.ts`
**Framework**: Unit tests with mocked Supabase client

#### Happy Path
- `getToday()` returns today's date in `YYYY-MM-DD` format
- `getDaysAgo(n)` returns a date string `n` days ago
- `fetchTodayStats` queries `daily_stats` with correct filters and returns the row
- `fetchTodayTasksCompleted` counts tasks with `complete_at` not null and `>=` today
- `fetchTodayMITsCompleted` counts MIT-type completed tasks for today
- `fetchTodayFocusMinutes` sums non-break `session_logs.duration_minutes` for today
- `fetchTodayBreaks` counts break sessions for today
- `fetchLifetimeTaskCount` counts all completed tasks ever
- `fetchLifetimePomodoroCount` sums `daily_pomodoro` across all days
- `fetchLifetimeFocusMinutes` sums all non-break session durations ever
- `fetchLifetimeSessionCount` counts all non-break sessions ever
- `fetchDailyStatsRange` queries with correct date range and ordering
- `fetchSessionLogsRange` queries non-break sessions in date range
- `fetchActiveDaysInRange` counts distinct active dates from both `session_logs` and `daily_stats`
- `fetchPeakHours` computes the best 2-hour window from `daily_activity_log` data
- `fetchWeekTotalStats` sums pomodoros, tasks, and focus minutes for a week range

#### Edge Cases
- `fetchTodayStats` returns `{ data: null }` when no daily_stats row exists for today
- `fetchTodayTasksCompleted` returns `0` when `count` is null
- `fetchTodayFocusMinutes` returns `0` when `data` is null or empty array
- `fetchLifetimePomodoroCount` returns `0` when `data` is null/empty
- `fetchPeakHours` returns `null` when there's an error or empty data
- `fetchPeakHours` returns `null` when maxPomodoros is 0 (no activity)
- `fetchActiveDaysInRange` handles overlapping dates between the two sources (deduplicates)
- `fetchActiveDaysInRange` returns `0` when both queries return null data
- `fetchWeekTotalStats` returns zeroed object when no data exists

#### Error Scenarios
- All Supabase query failures are surfaced as rejected promises (test that a mock rejection propagates)

---

### 2. Controller Layer — `app/api/productivity/controller.ts`
**Framework**: Unit tests with mocked service module

#### Happy Path
- Returns `200` with fully populated `ProductivityResponse` for authenticated user
- Returns `200` with zeroed data for unauthenticated user (no userId)
- Weekly history contains exactly 7 entries, one for each day of the current week
- Consistency rate is correctly computed: `activeDays / totalDays * 100`
- Week-over-week comparison calculates percentage changes correctly:
  - `(current - previous) / previous * 100`
  - Returns `0` when both current and previous are 0
  - Returns `100` when previous is 0 but current > 0
- Peak hours are included in response when service returns data
- Response shape matches `ProductivityResponse` interface exactly

#### Edge Cases
- All zero data when service returns all zeroes/null
- `weeklyHistory` entries default to `0` when stats map has no entry for a date
- `focusMinutesByDate` correctly accumulates session durations per date
- `comparison` returns `0` change for zero/zero case
- `comparison` returns `+100%` when previous was 0 and current > 0

#### Error Scenarios
- `resolveUser` throws → controller returns `500` with `{ error: "Internal Server Error" }`
- Any individual service function throws → controller catches and returns `500`
- Supabase returns error objects (not thrown) → controller handles gracefully

---

### 3. Route Layer — `app/api/productivity/route.ts`
**Framework**: Integration test (or unit with mocked controller)

#### Happy Path
- `GET` handler exists and delegates to `getProductivity`
- Response from route matches response from controller

#### Error Scenarios
- Route returns whatever controller returns (pass-through verification)

---

### 4. React Query Hook — `hooks/useProductivity.ts`
**Framework**: Unit tests with mocked fetch

#### Happy Path
- Hook has `queryKey: ["productivity"]`
- Hook has `staleTime: 30000`
- Hook has `refetchOnWindowFocus: true`
- Hook has `retry: 1`
- `fetchProductivity` calls `GET /api/productivity` and returns JSON
- Hook returns typed `ProductivityResponse` data on success

#### Error Scenarios
- `fetchProductivity` throws when response is not OK (`!res.ok`)
- Hook handles network errors gracefully

---

### 5. Components
**Framework**: Component/render tests with mock data

#### 5.1 `ProductivityKPICard`
- Renders label and value correctly
- Renders icon element
- Applies custom color class when provided
- Uses default color when no color prop
- Shows trend arrow and value when trend is provided
- Positive trend shows ↑ (green), negative shows ↓ (red)
- Does not render trend section when trend is null/undefined
- Handles numeric value 0 correctly

#### 5.2 `ProductivityKPIGrid`
- Renders all 4 KPI cards (Pomodoros Today, Tasks Done, Focus Minutes, Current Streak)
- Passes correct props to each `ProductivityKPICard`
- Renders in a 2-column grid layout

#### 5.3 `ProductivityLifetime`
- Renders all 4 lifetime stat items
- Formats focus hours as `Xh Ym` (e.g., `2h 30m`)
- Shows `0h 0m` when totalFocusMinutes is 0
- Renders correct icons and labels

#### 5.4 `ProductivityPeakHours`
- When peakHours is provided: renders time range (e.g., "10 AM – 12 PM")
- When peakHours is null: renders "No data yet" message
- `formatHour` helper:
  - `0` → "12 AM"
  - `11` → "11 AM"
  - `12` → "12 PM"
  - `15` → "3 PM"
  - `23` → "11 PM"
- Timeline bar width is proportional to the peak window duration

#### 5.5 `ProductivityConsistency`
- Renders rate percentage with correct color:
  - `rate >= 80`: green (`text-green-600`, `bg-green-500`)
  - `rate >= 50` and `< 80`: yellow (`text-yellow-500`, `bg-yellow-500`)
  - `rate < 50`: red (`text-red-500`, `bg-red-500`)
- Displays "X of Y days" text
- Encouragement message matches rate tier:
  - `>= 80`: "Excellent consistency! Keep it up!"
  - `>= 50`: "Good progress, try to be more consistent."
  - `< 50`: "Keep showing up — every day counts!"
- Progress bar width is `Math.min(rate, 100)%`

#### 5.6 `ProductivityComparison`
- When comparison is null: returns null (renders nothing)
- When comparison is provided: renders 3 comparison rows (Pomodoros, Tasks, Focus Time)
- Positive change shows `+X%` with green `TrendingUp` icon
- Negative change shows `X%` (no + sign) with red `TrendingDown` icon
- Zero change shows `0%` with `Minus` icon in muted color

#### 5.7 `ProductivityPage`
- Shows `LoadingSkeleton` when `isLoading` is true
- Shows `ErrorFallback` when `error` is present
- Shows `ErrorFallback` when `data` is null
- Error fallback displays error message from Error object
- Renders all child components when data is loaded
- Each section is wrapped in `ErrorBoundary`

---

## Mocking Strategy

### Supabase Client
All service functions receive a `SupabaseClient` instance. Mock it as an object with a `.from()` method that returns a chainable query builder:
```ts
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  lt: vi.fn().mockReturnThis(),
  not: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  // ... etc
}
```

### Auth Helpers
Mock `resolveUser` from `@/lib/auth-helpers` to return controlled `{ userId, supabase }` values.

### Global fetch
Mock `fetch` for the hook test using `vi.stubGlobal('fetch', mockFn)`.

---

## Acceptance Criteria Coverage

| AC # | Description | Test Location |
|------|------------|---------------|
| 1 | Sidebar shows "Productivity" nav item with BarChart3 icon | `sidebar.test.tsx` (visual / nav item check) |
| 2 | Click navigates to `/dashboard/productivity` | `sidebar.test.tsx` (navigation check) |
| 3 | Page renders header "Productivity" with subtitle | `page.test.tsx` |
| 4 | KPI grid shows 4 cards with correct data | `productivity-kpi-grid.test.tsx` |
| 5 | Each KPI card displays correct numeric value or `0` | `productivity-kpi-card.test.tsx` |
| 6 | Weekly chart renders (reused AnalyticsChart) | `page.test.tsx` (presence check) |
| 7 | Lifetime totals section renders correctly | `productivity-lifetime.test.tsx` |
| 8 | Peak hours card shows data or "No data yet" | `productivity-peak-hours.test.tsx` |
| 9 | Consistency rate color-coded (green/yellow/red) | `productivity-consistency.test.tsx` |
| 10 | Comparison shows deltas with arrows and color | `productivity-comparison.test.tsx` |
| 11 | Loading state shows skeleton | `page.test.tsx` |
| 12 | Error state shows fallback message | `page.test.tsx` |
| 13 | Empty state shows zeroes / "No data yet" | `controller.test.ts`, `peak-hours.test.tsx` |
| 14 | API returns correctly structured JSON | `controller.test.ts` |
| 15 | API returns 200 with zeroed data for new users | `controller.test.ts` |
| 16 | API handles Supabase errors → 500 | `controller.test.ts` |
| 17 | Hook has `queryKey: ["productivity"]`, `staleTime: 30000` | `useProductivity.test.ts` |
| 18 | No new dependencies | (build check) |
| 19 | All files use kebab-case | (lint check) |
| 20 | Named exports only | (lint check) |
| 21 | API follows 3-layer pattern | `route.test.ts`, `controller.test.ts`, `service.test.ts` |
| 22 | Service uses `@/lib/auth-helpers` | (code review) |

---

## Setup Requirements

To run these tests, the project needs:
1. A test runner: **Vitest** (recommended) or **Jest**
2. Testing library: **@testing-library/react** for component tests
3. **jsdom** or equivalent DOM environment for component rendering
4. **@testing-library/jest-dom** for DOM matchers

### Recommended Vitest installation
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Add `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
})
```
