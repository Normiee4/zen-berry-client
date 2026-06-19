// ---------------------------------------------------------------------------
// Unit Tests: app/api/productivity/service.ts
// ---------------------------------------------------------------------------
// Tests all 13+ exported functions from the service layer.
// Each test mocks the Supabase client chain and verifies query construction,
// data transformation, and edge cases (null, empty, errors).
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"
import type { SupabaseClient, PostgrestResponse, PostgrestSingleResponse } from "@supabase/supabase-js"

// ---- Module under test ----
import * as S from "@/app/api/productivity/service"

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

/**
 * Creates a mock Supabase client that returns a chainable query builder.
 * Each call to `.from(tablename)` returns a fresh builder scoped to that table.
 */
function createMockSupabase() {
  const builder: Record<string, vi.Mock> = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    lt: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  }

  // `select` with `{ count: "exact", head: true }` returns `{ data, count }`
  builder.select.mockImplementation((_columns?: string, opts?: { count?: "exact"; head?: boolean }) => {
    if (opts?.count === "exact" && opts?.head) {
      // head query — returns { data: null, count }
      return Object.assign(Object.create(builder), {
        then: (resolve: (val: { data: null; count: number | null }) => void) =>
          resolve({ data: null, count: null }),
      })
    }
    return builder
  })

  const from = vi.fn().mockReturnValue(builder)

  return {
    from,
    // Expose builder for result injection in tests
    __builder: builder,
  } as unknown as SupabaseClient & { __builder: typeof builder }
}

// ---------------------------------------------------------------------------
// Date helpers
// ---------------------------------------------------------------------------

describe("date helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("getToday() returns today's date in YYYY-MM-DD", () => {
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"))
    expect(S.getToday()).toBe("2026-06-19")
  })

  it("getDaysAgo(0) returns today", () => {
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"))
    expect(S.getDaysAgo(0)).toBe("2026-06-19")
  })

  it("getDaysAgo(7) returns date 7 days ago", () => {
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"))
    expect(S.getDaysAgo(7)).toBe("2026-06-12")
  })

  it("getDaysAgo(1) returns yesterday", () => {
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"))
    expect(S.getDaysAgo(1)).toBe("2026-06-18")
  })

  it("getDaysAgo handles month boundary", () => {
    vi.setSystemTime(new Date("2026-03-01T12:00:00Z"))
    expect(S.getDaysAgo(1)).toBe("2026-02-28")
  })

  it("getDaysAgo handles year boundary", () => {
    vi.setSystemTime(new Date("2026-01-01T12:00:00Z"))
    expect(S.getDaysAgo(1)).toBe("2025-12-31")
  })
})

// ---------------------------------------------------------------------------
// Today Stats
// ---------------------------------------------------------------------------

describe("fetchTodayStats", () => {
  it("queries daily_stats for today with correct filters", async () => {
    const mock = createMockSupabase()
    const userId = "user-1"

    // Make maybeSingle resolve with a row
    mock.__builder.maybeSingle.mockResolvedValue({
      data: { daily_pomodoro: 5, daily_task_completed: 3, streak_maintained: 2 },
      error: null,
    })

    const result = await S.fetchTodayStats(mock, userId)

    expect(mock.from).toHaveBeenCalledWith("daily_stats")
    expect(mock.__builder.select).toHaveBeenCalledWith("daily_pomodoro, daily_task_completed, streak_maintained")
    expect(mock.__builder.eq).toHaveBeenCalledWith("user_id", userId)
    expect(mock.__builder.eq).toHaveBeenCalledWith("date", S.getToday())
    expect(result.data).toEqual({ daily_pomodoro: 5, daily_task_completed: 3, streak_maintained: 2 })
  })

  it("returns null data when no daily_stats row for today", async () => {
    const mock = createMockSupabase()
    mock.__builder.maybeSingle.mockResolvedValue({ data: null, error: null })

    const result = await S.fetchTodayStats(mock, "user-1")
    expect(result.data).toBeNull()
  })

  it("propagates supabase error", async () => {
    const mock = createMockSupabase()
    mock.__builder.maybeSingle.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    })

    const result = await S.fetchTodayStats(mock, "user-1")
    expect(result.error).toBeDefined()
  })
})

describe("fetchTodayTasksCompleted", () => {
  it("counts tasks with non-null complete_at and gte today", async () => {
    const mock = createMockSupabase()
    // The head query goes through `.then()` — we need the builder's select to return a thenable
    mock.__builder.select.mockReturnValue({
      then: (resolve: (val: { data: null; count: number }) => void) =>
        resolve({ data: null, count: 7 }),
    } as any)

    const result = await S.fetchTodayTasksCompleted(mock, "user-1")
    expect(result).toBe(7)
    expect(mock.from).toHaveBeenCalledWith("tasks")
    expect(mock.__builder.not).toHaveBeenCalledWith("complete_at", "is", null)
    expect(mock.__builder.gte).toHaveBeenCalledWith("complete_at", S.getToday())
  })

  it("returns 0 when count is null", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockReturnValue({
      then: (resolve: (val: { data: null; count: null }) => void) =>
        resolve({ data: null, count: null }),
    } as any)

    const result = await S.fetchTodayTasksCompleted(mock, "user-1")
    expect(result).toBe(0)
  })
})

describe("fetchTodayMITsCompleted", () => {
  it("counts MIT tasks completed today", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockReturnValue({
      then: (resolve: (val: { data: null; count: number }) => void) =>
        resolve({ data: null, count: 3 }),
    } as any)

    const result = await S.fetchTodayMITsCompleted(mock, "user-1")
    expect(result).toBe(3)
    expect(mock.__builder.eq).toHaveBeenCalledWith("type", "MIT")
    expect(mock.__builder.not).toHaveBeenCalledWith("complete_at", "is", null)
    expect(mock.__builder.gte).toHaveBeenCalledWith("complete_at", S.getToday())
  })
})

describe("fetchTodayFocusMinutes", () => {
  it("sums non-break session durations for today", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({
      data: [
        { duration_minutes: 25 },
        { duration_minutes: 25 },
        { duration_minutes: 15 },
      ],
      error: null,
    })

    const result = await S.fetchTodayFocusMinutes(mock, "user-1")
    expect(result).toBe(65)
    expect(mock.__builder.eq).toHaveBeenCalledWith("was_break", false)
    expect(mock.__builder.gte).toHaveBeenCalledWith("completed_at", S.getToday())
  })

  it("returns 0 when data is null", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: null, error: null })

    const result = await S.fetchTodayFocusMinutes(mock, "user-1")
    expect(result).toBe(0)
  })

  it("returns 0 when data is empty array", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: [], error: null })

    const result = await S.fetchTodayFocusMinutes(mock, "user-1")
    expect(result).toBe(0)
  })
})

describe("fetchTodayBreaks", () => {
  it("counts break sessions for today", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockReturnValue({
      then: (resolve: (val: { data: null; count: number }) => void) =>
        resolve({ data: null, count: 2 }),
    } as any)

    const result = await S.fetchTodayBreaks(mock, "user-1")
    expect(result).toBe(2)
    expect(mock.__builder.eq).toHaveBeenCalledWith("was_break", true)
  })
})

// ---------------------------------------------------------------------------
// Lifetime Stats
// ---------------------------------------------------------------------------

describe("fetchLifetimeTaskCount", () => {
  it("counts all completed tasks", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockReturnValue({
      then: (resolve: (val: { data: null; count: number }) => void) =>
        resolve({ data: null, count: 42 }),
    } as any)

    const result = await S.fetchLifetimeTaskCount(mock, "user-1")
    expect(result).toBe(42)
    expect(mock.__builder.not).toHaveBeenCalledWith("complete_at", "is", null)
  })
})

describe("fetchLifetimePomodoroCount", () => {
  it("sums daily_pomodoro across all daily_stats", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({
      data: [
        { daily_pomodoro: 5 },
        { daily_pomodoro: 8 },
        { daily_pomodoro: 3 },
      ],
      error: null,
    })

    const result = await S.fetchLifetimePomodoroCount(mock, "user-1")
    expect(result).toBe(16)
  })

  it("returns 0 when no data", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: null, error: null })

    const result = await S.fetchLifetimePomodoroCount(mock, "user-1")
    expect(result).toBe(0)
  })

  it("handles null daily_pomodoro values", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({
      data: [{ daily_pomodoro: null }, { daily_pomodoro: 5 }],
      error: null,
    })

    const result = await S.fetchLifetimePomodoroCount(mock, "user-1")
    expect(result).toBe(5)
  })
})

describe("fetchLifetimeFocusMinutes", () => {
  it("sums all non-break session durations", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({
      data: [
        { duration_minutes: 25 },
        { duration_minutes: 50 },
        { duration_minutes: 25 },
      ],
      error: null,
    })

    const result = await S.fetchLifetimeFocusMinutes(mock, "user-1")
    expect(result).toBe(100)
  })

  it("returns 0 when data is null", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: null, error: null })
    expect(await S.fetchLifetimeFocusMinutes(mock, "user-1")).toBe(0)
  })

  it("returns 0 when data is empty", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: [], error: null })
    expect(await S.fetchLifetimeFocusMinutes(mock, "user-1")).toBe(0)
  })
})

describe("fetchLifetimeSessionCount", () => {
  it("counts all non-break sessions", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockReturnValue({
      then: (resolve: (val: { data: null; count: number }) => void) =>
        resolve({ data: null, count: 30 }),
    } as any)

    const result = await S.fetchLifetimeSessionCount(mock, "user-1")
    expect(result).toBe(30)
    expect(mock.__builder.eq).toHaveBeenCalledWith("was_break", false)
  })
})

// ---------------------------------------------------------------------------
// Weekly History
// ---------------------------------------------------------------------------

describe("fetchDailyStatsRange", () => {
  it("queries daily_stats with date range and ascending order", async () => {
    const mock = createMockSupabase()
    const data = [
      { date: "2026-06-12", daily_pomodoro: 4, daily_task_completed: 2 },
      { date: "2026-06-13", daily_pomodoro: 6, daily_task_completed: 3 },
    ]
    mock.__builder.select.mockResolvedValue({ data, error: null })

    const result = await S.fetchDailyStatsRange(mock, "user-1", "2026-06-12", "2026-06-19")
    expect(mock.__builder.gte).toHaveBeenCalledWith("date", "2026-06-12")
    expect(mock.__builder.lte).toHaveBeenCalledWith("date", "2026-06-19")
    expect(mock.__builder.order).toHaveBeenCalledWith("date", { ascending: true })
    expect(result.data).toEqual(data)
  })
})

describe("fetchSessionLogsRange", () => {
  it("queries non-break sessions in range", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: [], error: null })

    await S.fetchSessionLogsRange(mock, "user-1", "2026-06-12", "2026-06-19T23:59:59")
    expect(mock.__builder.eq).toHaveBeenCalledWith("was_break", false)
    expect(mock.__builder.gte).toHaveBeenCalledWith("completed_at", "2026-06-12")
    expect(mock.__builder.lt).toHaveBeenCalledWith("completed_at", "2026-06-19T23:59:59")
  })
})

// ---------------------------------------------------------------------------
// Active Days (Consistency)
// ---------------------------------------------------------------------------

describe("fetchActiveDaysInRange", () => {
  it("counts distinct active dates from both session_logs and daily_stats", async () => {
    const mock = createMockSupabase()

    // Two queries happen: session_logs and daily_stats
    // First call for session_logs
    mock.__builder.select
      // First select for session_logs
      .mockResolvedValueOnce({
        data: [
          { completed_at: "2026-06-12T10:00:00" },
          { completed_at: "2026-06-12T14:00:00" },  // same date, should dedupe
          { completed_at: "2026-06-13T09:00:00" },
        ],
        error: null,
      })
      // Second select for daily_stats
      .mockResolvedValueOnce({
        data: [
          { date: "2026-06-12" },  // already counted
          { date: "2026-06-14" },  // new
        ],
        error: null,
      })

    const result = await S.fetchActiveDaysInRange(mock, "user-1", "2026-06-12", "2026-06-19")
    // Distinct: 06-12, 06-13, 06-14 = 3
    expect(result).toBe(3)
  })

  it("returns 0 when both queries return null data", async () => {
    const mock = createMockSupabase()
    mock.__builder.select
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: null })

    const result = await S.fetchActiveDaysInRange(mock, "user-1", "2026-06-12", "2026-06-19")
    expect(result).toBe(0)
  })

  it("handles session_logs being null but daily_stats having data", async () => {
    const mock = createMockSupabase()
    mock.__builder.select
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: [{ date: "2026-06-12" }, { date: "2026-06-13" }],
        error: null,
      })

    const result = await S.fetchActiveDaysInRange(mock, "user-1", "2026-06-12", "2026-06-19")
    expect(result).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// Peak Hours
// ---------------------------------------------------------------------------

describe("fetchPeakHours", () => {
  it("returns peak 2-hour window from daily_activity_log data", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({
      data: [
        { hour_slot: 9, pomodoros_completed: 2 },
        { hour_slot: 10, pomodoros_completed: 5 },
        { hour_slot: 11, pomodoros_completed: 3 },
        { hour_slot: 14, pomodoros_completed: 4 },
      ],
      error: null,
    })

    const result = await S.fetchPeakHours(mock, "user-1")
    expect(result).toEqual({
      start: 10,
      end: 12,
      avgPomodoros: 0.7, // 5 / 7 ≈ 0.714 -> round to 0.7
    })
  })

  it("returns null when there is an error", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({
      data: null,
      error: new Error("DB error"),
    })

    const result = await S.fetchPeakHours(mock, "user-1")
    expect(result).toBeNull()
  })

  it("returns null when data is empty", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: [], error: null })

    const result = await S.fetchPeakHours(mock, "user-1")
    expect(result).toBeNull()
  })

  it("returns null when maxPomodoros is 0", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({
      data: [
        { hour_slot: 9, pomodoros_completed: 0 },
        { hour_slot: 10, pomodoros_completed: 0 },
      ],
      error: null,
    })

    const result = await S.fetchPeakHours(mock, "user-1")
    expect(result).toBeNull()
  })

  it("selects the hour with highest pomodoro count", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({
      data: [
        { hour_slot: 8, pomodoros_completed: 1 },
        { hour_slot: 15, pomodoros_completed: 10 },
        { hour_slot: 20, pomodoros_completed: 3 },
      ],
      error: null,
    })

    const result = await S.fetchPeakHours(mock, "user-1")
    expect(result?.start).toBe(15)
    expect(result?.end).toBe(17)
  })
})

// ---------------------------------------------------------------------------
// Week Total Stats (Comparison)
// ---------------------------------------------------------------------------

describe("fetchWeekTotalStats", () => {
  it("sums pomodoros, tasks, and focus minutes for a date range", async () => {
    const mock = createMockSupabase()

    // First query: daily_stats
    mock.__builder.select
      .mockResolvedValueOnce({
        data: [
          { daily_pomodoro: 5, daily_task_completed: 3 },
          { daily_pomodoro: 4, daily_task_completed: 2 },
          { daily_pomodoro: 6, daily_task_completed: 1 },
        ],
        error: null,
      })
      // Second query: session_logs
      .mockResolvedValueOnce({
        data: [
          { duration_minutes: 25 },
          { duration_minutes: 25 },
          { duration_minutes: 50 },
        ],
        error: null,
      })

    const result = await S.fetchWeekTotalStats(mock, "user-1", "2026-06-12", "2026-06-19")
    expect(result).toEqual({ pomodoros: 15, tasks: 6, focusMinutes: 100 })
  })

  it("returns zeroed object when no data exists", async () => {
    const mock = createMockSupabase()
    mock.__builder.select
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: null })

    const result = await S.fetchWeekTotalStats(mock, "user-1", "2026-06-12", "2026-06-19")
    expect(result).toEqual({ pomodoros: 0, tasks: 0, focusMinutes: 0 })
  })

  it("handles null values in daily_stats rows", async () => {
    const mock = createMockSupabase()
    mock.__builder.select
      .mockResolvedValueOnce({
        data: [
          { daily_pomodoro: null, daily_task_completed: 3 },
          { daily_pomodoro: 5, daily_task_completed: null },
        ],
        error: null,
      })
      .mockResolvedValueOnce({ data: [], error: null })

    const result = await S.fetchWeekTotalStats(mock, "user-1", "2026-06-12", "2026-06-19")
    expect(result).toEqual({ pomodoros: 5, tasks: 3, focusMinutes: 0 })
  })
})

// ---------------------------------------------------------------------------
// Error propagation (all service functions)
// ---------------------------------------------------------------------------

describe("service error propagation", () => {
  it("fetchTodayStats rejects when supabase query fails", async () => {
    const mock = createMockSupabase()
    mock.__builder.maybeSingle.mockRejectedValue(new Error("Network error"))
    await expect(S.fetchTodayStats(mock, "user-1")).rejects.toThrow("Network error")
  })

  it("fetchTodayFocusMinutes rejects on query failure", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockRejectedValue(new Error("Timeout"))
    await expect(S.fetchTodayFocusMinutes(mock, "user-1")).rejects.toThrow("Timeout")
  })

  it("fetchPeakHours rejects on query failure", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockRejectedValue(new Error("DB down"))
    await expect(S.fetchPeakHours(mock, "user-1")).rejects.toThrow("DB down")
  })

  it("fetchActiveDaysInRange rejects on query failure", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockRejectedValue(new Error("Connection lost"))
    await expect(S.fetchActiveDaysInRange(mock, "user-1", "a", "b")).rejects.toThrow("Connection lost")
  })
})
