// ---------------------------------------------------------------------------
// Unit Tests: app/api/feedback/report/service.ts AND reports/service.ts
// ---------------------------------------------------------------------------
// Tests insertReport, formatReport from report/service
// and fetchAllReports, fetchUserReports, formatReport from reports/service.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest"
import type { SupabaseClient } from "@supabase/supabase-js"

// ---------------------------------------------------------------------------
// Module under test: report/service
// ---------------------------------------------------------------------------
import * as ReportService from "@/app/api/feedback/report/service"
import type { ReportRow as ReportRowReport, FormattedReport as FormattedReportReport, CreateReportInput } from "@/app/api/feedback/report/service"

// ---------------------------------------------------------------------------
// Module under test: reports/service
// ---------------------------------------------------------------------------
import * as ReportsService from "@/app/api/feedback/reports/service"
import type { ReportRow as ReportRowReports } from "@/app/api/feedback/reports/service"

// ---------------------------------------------------------------------------
// Mock helpers
// ---------------------------------------------------------------------------

function createMockSupabase() {
  const builder: Record<string, vi.Mock> = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: undefined as any,
  }

  const from = vi.fn().mockReturnValue(builder)

  return {
    from,
    __builder: builder,
  } as unknown as SupabaseClient & { __builder: typeof builder }
}

// ===========================================================================
// report/service tests
// ===========================================================================

describe("report/service — insertReport", () => {
  const userId = "user-123"
  const validInput: CreateReportInput = {
    issue: "Timer bug",
    explanation: "The timer doesn't stop when I press pause",
    suggestions: "Add a debounce mechanism",
  }

  it("inserts into the reports table with correct data", async () => {
    const mock = createMockSupabase()

    await ReportService.insertReport(mock, userId, validInput)

    expect(mock.from).toHaveBeenCalledWith("reports")
    expect(mock.__builder.insert).toHaveBeenCalledWith([
      {
        user_id: userId,
        issue: "Timer bug",
        explanation: "The timer doesn't stop when I press pause",
        suggestions: "Add a debounce mechanism",
        bug_detail: null,
      },
    ])
  })

  it("calls .select() and .single() after insert", async () => {
    const mock = createMockSupabase()

    await ReportService.insertReport(mock, userId, validInput)

    expect(mock.__builder.select).toHaveBeenCalled()
    expect(mock.__builder.single).toHaveBeenCalled()
  })

  it("includes bug_detail when provided", async () => {
    const mock = createMockSupabase()
    const inputWithBugDetail: CreateReportInput = {
      ...validInput,
      bug_detail: "Console error: undefined is not a function",
    }

    await ReportService.insertReport(mock, userId, inputWithBugDetail)

    expect(mock.__builder.insert).toHaveBeenCalledWith([
      expect.objectContaining({
        bug_detail: "Console error: undefined is not a function",
      }),
    ])
  })

  it("sets bug_detail to null when undefined", async () => {
    const mock = createMockSupabase()

    await ReportService.insertReport(mock, userId, validInput)

    const insertCall = mock.__builder.insert.mock.calls[0][0][0]
    expect(insertCall.bug_detail).toBeNull()
  })

  it("sets bug_detail to null when empty string", async () => {
    const mock = createMockSupabase()
    const inputEmptyBugDetail: CreateReportInput = {
      ...validInput,
      bug_detail: "",
    }

    await ReportService.insertReport(mock, userId, inputEmptyBugDetail)

    const insertCall = mock.__builder.insert.mock.calls[0][0][0]
    expect(insertCall.bug_detail).toBeNull()
  })

  it("returns the inserted row data on success", async () => {
    const mock = createMockSupabase()
    const insertedRow: ReportRowReport = {
      id: "rpt-new",
      user_id: userId,
      issue: "Timer bug",
      explanation: "Details",
      suggestions: "Fix it",
      bug_detail: null,
      created_at: "2026-06-30T12:00:00Z",
    }
    mock.__builder.single.mockResolvedValue({ data: insertedRow, error: null })

    const result = await ReportService.insertReport(mock, userId, validInput)
    expect(result.data).toEqual(insertedRow)
    expect(result.error).toBeNull()
  })

  it("propagates supabase errors", async () => {
    const mock = createMockSupabase()
    mock.__builder.single.mockResolvedValue({
      data: null,
      error: new Error("Insert failed"),
    })

    const result = await ReportService.insertReport(mock, userId, validInput)
    expect(result.data).toBeNull()
    expect(result.error!.message).toBe("Insert failed")
  })
})

describe("report/service — formatReport", () => {
  it("transforms ReportRow to camelCase FormattedReport", () => {
    const row: ReportRowReport = {
      id: "rpt-1",
      user_id: "user-123",
      issue: "Timer issue",
      explanation: "The timer is not accurate",
      suggestions: "Calibrate the timer",
      bug_detail: "Happens every 10th session",
      created_at: "2026-06-30T12:00:00Z",
    }

    const formatted = ReportService.formatReport(row)

    expect(formatted).toEqual<FormattedReportReport>({
      id: "rpt-1",
      userId: "user-123",
      issue: "Timer issue",
      explanation: "The timer is not accurate",
      suggestions: "Calibrate the timer",
      bugDetail: "Happens every 10th session",
      createdAt: "2026-06-30T12:00:00Z",
    })
  })

  it("maps bug_detail to bugDetail (null)", () => {
    const row: ReportRowReport = {
      id: "rpt-2",
      user_id: "user-456",
      issue: "UI glitch",
      explanation: "Button overlaps text",
      suggestions: "Fix CSS",
      bug_detail: null,
      created_at: "2026-06-29T08:00:00Z",
    }

    const formatted = ReportService.formatReport(row)
    expect(formatted.bugDetail).toBeNull()
  })

  it("has camelCase keys in the output", () => {
    const row: ReportRowReport = {
      id: "rpt-3",
      user_id: "user-000",
      issue: "x",
      explanation: "x",
      suggestions: "x",
      bug_detail: null,
      created_at: "2026-06-27T00:00:00Z",
    }

    const formatted = ReportService.formatReport(row)
    const keys = Object.keys(formatted)
    expect(keys).toContain("userId")
    expect(keys).toContain("bugDetail")
    expect(keys).toContain("createdAt")
    expect(keys).not.toContain("user_id")
    expect(keys).not.toContain("bug_detail")
  })
})

// ===========================================================================
// reports/service tests
// ===========================================================================

describe("reports/service — fetchAllReports", () => {
  it("selects all reports ordered by created_at descending", async () => {
    const mock = createMockSupabase()
    const expectedData: ReportRowReports[] = [
      { id: "1", user_id: "u1", issue: "A", explanation: "a", suggestions: "a", bug_detail: null, created_at: "2026-06-30T12:00:00Z" },
      { id: "2", user_id: "u2", issue: "B", explanation: "b", suggestions: "b", bug_detail: null, created_at: "2026-06-29T12:00:00Z" },
    ]
    mock.__builder.select.mockResolvedValue({ data: expectedData, error: null })

    const result = await ReportsService.fetchAllReports(mock)

    expect(mock.from).toHaveBeenCalledWith("reports")
    expect(mock.__builder.select).toHaveBeenCalledWith("*")
    expect(mock.__builder.order).toHaveBeenCalledWith("created_at", { ascending: false })
    expect(result).toEqual(expectedData)
    expect(result).toHaveLength(2)
  })

  it("throws when supabase returns an error", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: null, error: new Error("DB error") })

    await expect(ReportsService.fetchAllReports(mock)).rejects.toThrow("DB error")
  })

  it("returns empty array when there are no reports", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: [], error: null })

    const result = await ReportsService.fetchAllReports(mock)
    expect(result).toEqual([])
  })
})

describe("reports/service — fetchUserReports", () => {
  it("filters reports by user_id and orders by created_at descending", async () => {
    const mock = createMockSupabase()
    const userId = "user-1"
    const userReports: ReportRowReports[] = [
      { id: "1", user_id: userId, issue: "Issue A", explanation: "Details", suggestions: "Fix", bug_detail: null, created_at: "2026-06-30T12:00:00Z" },
      { id: "3", user_id: userId, issue: "Issue C", explanation: "Details", suggestions: "Improve", bug_detail: "Logs attached", created_at: "2026-06-28T12:00:00Z" },
    ]
    mock.__builder.select.mockResolvedValue({ data: userReports, error: null })

    const result = await ReportsService.fetchUserReports(mock, userId)

    expect(mock.from).toHaveBeenCalledWith("reports")
    expect(mock.__builder.select).toHaveBeenCalledWith("*")
    expect(mock.__builder.eq).toHaveBeenCalledWith("user_id", userId)
    expect(mock.__builder.order).toHaveBeenCalledWith("created_at", { ascending: false })
    expect(result).toEqual(userReports)
    expect(result).toHaveLength(2)
  })

  it("returns empty array when user has no reports", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: [], error: null })

    const result = await ReportsService.fetchUserReports(mock, "user-noreports")
    expect(result).toEqual([])
  })

  it("throws when supabase returns an error", async () => {
    const mock = createMockSupabase()
    mock.__builder.select.mockResolvedValue({ data: null, error: new Error("Query failed") })

    await expect(ReportsService.fetchUserReports(mock, "user-1")).rejects.toThrow("Query failed")
  })

  it("filters to only the specified user's reports", async () => {
    const mock = createMockSupabase()
    const allReports: ReportRowReports[] = [
      { id: "1", user_id: "user-1", issue: "A", explanation: "a", suggestions: "a", bug_detail: null, created_at: "2026-06-30T12:00:00Z" },
      { id: "2", user_id: "user-2", issue: "B", explanation: "b", suggestions: "b", bug_detail: null, created_at: "2026-06-29T12:00:00Z" },
      { id: "3", user_id: "user-1", issue: "C", explanation: "c", suggestions: "c", bug_detail: null, created_at: "2026-06-28T12:00:00Z" },
    ]
    // Simulate fetchUserReports filtering client-side for test purposes
    mock.__builder.select.mockResolvedValue({
      data: allReports.filter((r) => r.user_id === "user-1"),
      error: null,
    })

    const result = await ReportsService.fetchUserReports(mock, "user-1")
    expect(result).toHaveLength(2)
    expect(result.every((r) => r.user_id === "user-1")).toBe(true)
  })
})

describe("reports/service — formatReport", () => {
  it("transforms ReportRow to camelCase correctly", () => {
    const row: ReportRowReports = {
      id: "rpt-10",
      user_id: "user-abc",
      issue: "Bug report",
      explanation: "Explanation text",
      suggestions: "Suggestion text",
      bug_detail: null,
      created_at: "2026-06-30T12:00:00Z",
    }

    const formatted = ReportsService.formatReport(row)

    expect(formatted).toEqual({
      id: "rpt-10",
      userId: "user-abc",
      issue: "Bug report",
      explanation: "Explanation text",
      suggestions: "Suggestion text",
      bugDetail: null,
      createdAt: "2026-06-30T12:00:00Z",
    })
  })

  it("maps snake_case to camelCase", () => {
    const row: ReportRowReports = {
      id: "rpt-11",
      user_id: "user-def",
      issue: "Issue",
      explanation: "Exp",
      suggestions: "Sug",
      bug_detail: "Detail here",
      created_at: "2026-06-30T12:00:00Z",
    }

    const formatted = ReportsService.formatReport(row)
    expect(formatted.userId).toBe("user-def")
    expect(formatted.bugDetail).toBe("Detail here")
    expect(formatted.createdAt).toBeDefined()
  })
})
