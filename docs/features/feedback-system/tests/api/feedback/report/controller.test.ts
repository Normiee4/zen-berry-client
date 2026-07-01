// ---------------------------------------------------------------------------
// Unit Tests: app/api/feedback/report/controller.ts
// ---------------------------------------------------------------------------
// Tests the handleCreateReport controller function.
// Mocks resolveUser, supabase client, and report service functions.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"

// ---- Mocks ----
const mockResolveUser = vi.fn()
vi.mock("@/lib/auth-helpers", () => ({
  resolveUser: mockResolveUser,
}))

const mockReportService = vi.hoisted(() => ({
  insertReport: vi.fn(),
  formatReport: vi.fn(),
}))

vi.mock("@/app/api/feedback/report/service", () => mockReportService)

// ---- Module under test ----
import { handleCreateReport } from "@/app/api/feedback/report/controller"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockSupabase() {
  return { from: vi.fn() } as any
}

function mockAuth(userId: string | null) {
  const supabase = createMockSupabase()
  mockResolveUser.mockResolvedValue({ userId, supabase })
}

const validReportPayload = {
  issue: "Timer doesn't stop",
  explanation: "When I press pause, the timer keeps going for 5 more seconds",
  suggestions: "Add a debounce to the pause button",
}

const formattedReport = {
  id: "rpt-1",
  userId: "user-1",
  issue: "Timer doesn't stop",
  explanation: "When I press pause, the timer keeps going for 5 more seconds",
  suggestions: "Add a debounce to the pause button",
  bugDetail: null,
  createdAt: "2026-06-30T12:00:00Z",
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleCreateReport", () => {
  // -----------------------------------------------------------------------
  // Happy path
  // -----------------------------------------------------------------------

  it("returns 201 for valid report body", async () => {
    mockAuth("user-1")
    mockReportService.insertReport.mockResolvedValue({
      data: { id: "rpt-1", user_id: "user-1", ...validReportPayload, bug_detail: null, created_at: "2026-06-30T12:00:00Z" },
      error: null,
    })
    mockReportService.formatReport.mockReturnValue(formattedReport)

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReportPayload),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toEqual(formattedReport)
  })

  it("calls insertReport with the correct userId and data", async () => {
    mockAuth("user-42")
    mockReportService.insertReport.mockResolvedValue({
      data: { id: "rpt-1", user_id: "user-42", ...validReportPayload, bug_detail: null, created_at: "2026-06-30T12:00:00Z" },
      error: null,
    })
    mockReportService.formatReport.mockReturnValue(formattedReport)

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReportPayload),
    })
    await handleCreateReport(request)

    expect(mockReportService.insertReport).toHaveBeenCalledWith(
      expect.anything(),
      "user-42",
      expect.objectContaining({
        issue: "Timer doesn't stop",
        explanation: expect.stringContaining("pause"),
      }),
    )
  })

  it("includes optional bug_detail when provided", async () => {
    mockAuth("user-1")
    mockReportService.insertReport.mockResolvedValue({
      data: { id: "rpt-2", user_id: "user-1", ...validReportPayload, bug_detail: "Console error: undefined is not a function", created_at: "2026-06-30T12:00:00Z" },
      error: null,
    })
    mockReportService.formatReport.mockReturnValue({
      ...formattedReport,
      id: "rpt-2",
      bugDetail: "Console error: undefined is not a function",
    })

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...validReportPayload, bug_detail: "Console error: undefined is not a function" }),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body.bugDetail).toBe("Console error: undefined is not a function")
  })

  // -----------------------------------------------------------------------
  // Validation errors
  // -----------------------------------------------------------------------

  it("returns 400 when issue is missing", async () => {
    mockAuth("user-1")
    const { issue: _, ...noIssue } = validReportPayload

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noIssue),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body).toHaveProperty("error")
  })

  it("returns 400 when explanation is missing", async () => {
    mockAuth("user-1")
    const { explanation: _, ...noExplanation } = validReportPayload

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noExplanation),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(400)
  })

  it("returns 400 when suggestions is missing", async () => {
    mockAuth("user-1")
    const { suggestions: _, ...noSuggestions } = validReportPayload

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(noSuggestions),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(400)
  })

  it("returns 400 when all required fields are empty strings", async () => {
    mockAuth("user-1")

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue: "", explanation: "", suggestions: "" }),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(400)
  })

  it("returns 400 when body is empty object", async () => {
    mockAuth("user-1")

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(400)
  })

  // -----------------------------------------------------------------------
  // Auth errors
  // -----------------------------------------------------------------------

  it("returns 401 when user is not authenticated", async () => {
    mockAuth(null)

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReportPayload),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })

  it("does not call insertReport when user is not authenticated", async () => {
    mockAuth(null)

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReportPayload),
    })
    await handleCreateReport(request)

    expect(mockReportService.insertReport).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  it("returns 500 when resolveUser throws", async () => {
    mockResolveUser.mockRejectedValue(new Error("Auth failure"))

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReportPayload),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(500)
  })

  it("returns 500 when insertReport throws", async () => {
    mockAuth("user-1")
    mockReportService.insertReport.mockRejectedValue(new Error("DB timeout"))

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validReportPayload),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(500)
  })
})
