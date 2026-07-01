// ---------------------------------------------------------------------------
// Unit Tests: app/api/feedback/reports/controller.ts
// ---------------------------------------------------------------------------
// Tests the handleGetReports controller function.
// Covers owner vs non-owner branching, auth guard, admin client creation.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"

// ---- Mocks ----
const mockResolveUser = vi.fn()
vi.mock("@/lib/auth-helpers", () => ({
  resolveUser: mockResolveUser,
}))

const mockReportsService = vi.hoisted(() => ({
  fetchAllReports: vi.fn(),
  fetchUserReports: vi.fn(),
  formatReport: vi.fn(),
}))

vi.mock("@/app/api/feedback/reports/service", () => mockReportsService)

const mockCreateAdminClient = vi.fn()
vi.mock("@/lib/supabase-admin", () => ({
  createAdminClient: mockCreateAdminClient,
}))

// ---- Module under test ----
import { handleGetReports } from "@/app/api/feedback/reports/controller"

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

const mockReports = [
  { id: "rpt-1", user_id: "user-1", issue: "Bug A", explanation: "...", suggestions: "...", bug_detail: null, created_at: "2026-06-30T10:00:00Z" },
  { id: "rpt-2", user_id: "user-2", issue: "Bug B", explanation: "...", suggestions: "...", bug_detail: null, created_at: "2026-06-30T11:00:00Z" },
  { id: "rpt-3", user_id: "user-1", issue: "Bug C", explanation: "...", suggestions: "...", bug_detail: null, created_at: "2026-06-30T12:00:00Z" },
]

const formattedReports = mockReports.map((r) => ({
  id: r.id,
  userId: r.user_id,
  issue: r.issue,
  explanation: r.explanation,
  suggestions: r.suggestions,
  bugDetail: r.bug_detail,
  createdAt: r.created_at,
}))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("OWNER_USER_ID", "owner-123")
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("handleGetReports", () => {
  // -----------------------------------------------------------------------
  // Owner user — returns all reports
  // -----------------------------------------------------------------------

  it("returns all reports for owner user", async () => {
    mockAuth("owner-123")
    mockCreateAdminClient.mockReturnValue({} as any)
    mockReportsService.fetchAllReports.mockResolvedValue(mockReports)
    mockReportsService.formatReport.mockImplementation((row: any) => {
      const f = formattedReports.find((fr) => fr.id === row.id)
      return f ?? row
    })

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.reports).toHaveLength(3)
    expect(body.reports.map((r: any) => r.id)).toEqual(["rpt-1", "rpt-2", "rpt-3"])
  })

  it("uses admin Supabase client for owner user", async () => {
    mockAuth("owner-123")
    const adminClient = { admin: true }
    mockCreateAdminClient.mockReturnValue(adminClient)
    mockReportsService.fetchAllReports.mockResolvedValue([])
    mockReportsService.formatReport.mockReturnValue({} as any)

    const request = new Request("http://localhost/api/feedback/reports")
    await handleGetReports(request)

    expect(mockCreateAdminClient).toHaveBeenCalledTimes(1)
    expect(mockReportsService.fetchAllReports).toHaveBeenCalledWith(adminClient)
    expect(mockReportsService.fetchUserReports).not.toHaveBeenCalled()
  })

  it("does not use admin client for owner when fetchAllReports is called", async () => {
    mockAuth("owner-123")
    mockCreateAdminClient.mockReturnValue({} as any)
    mockReportsService.fetchAllReports.mockResolvedValue(mockReports)
    mockReportsService.formatReport.mockImplementation((row: any) => {
      const f = formattedReports.find((fr) => fr.id === row.id)
      return f ?? row
    })

    const request = new Request("http://localhost/api/feedback/reports")
    await handleGetReports(request)

    expect(mockReportsService.fetchAllReports).toHaveBeenCalledTimes(1)
    expect(mockReportsService.fetchUserReports).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // Non-owner user — returns own reports only
  // -----------------------------------------------------------------------

  it("returns only own reports for non-owner user", async () => {
    mockAuth("user-1")
    const ownReports = mockReports.filter((r) => r.user_id === "user-1")
    mockReportsService.fetchUserReports.mockResolvedValue(ownReports)
    mockReportsService.formatReport.mockImplementation((row: any) => {
      const f = formattedReports.find((fr) => fr.id === row.id)
      return f ?? row
    })

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.reports).toHaveLength(2)
    expect(body.reports.map((r: any) => r.id)).toEqual(["rpt-1", "rpt-3"])
  })

  it("calls fetchUserReports with the correct userId for non-owner", async () => {
    mockAuth("user-2")
    mockReportsService.fetchUserReports.mockResolvedValue([mockReports[1]])
    mockReportsService.formatReport.mockReturnValue({} as any)

    const request = new Request("http://localhost/api/feedback/reports")
    await handleGetReports(request)

    expect(mockReportsService.fetchUserReports).toHaveBeenCalledWith(expect.anything(), "user-2")
    expect(mockReportsService.fetchAllReports).not.toHaveBeenCalled()
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // Empty results
  // -----------------------------------------------------------------------

  it("returns empty array when non-owner has no reports", async () => {
    mockAuth("user-noreports")
    mockReportsService.fetchUserReports.mockResolvedValue([])
    mockReportsService.formatReport.mockReturnValue({} as any)

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.reports).toEqual([])
  })

  it("returns empty array when there are no reports at all (owner)", async () => {
    mockAuth("owner-123")
    mockCreateAdminClient.mockReturnValue({} as any)
    mockReportsService.fetchAllReports.mockResolvedValue([])
    mockReportsService.formatReport.mockReturnValue({} as any)

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.reports).toEqual([])
  })

  // -----------------------------------------------------------------------
  // Auth errors
  // -----------------------------------------------------------------------

  it("returns 401 when user is not authenticated", async () => {
    mockAuth(null)

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })

  it("does not call any service function when not authenticated", async () => {
    mockAuth(null)

    const request = new Request("http://localhost/api/feedback/reports")
    await handleGetReports(request)

    expect(mockReportsService.fetchAllReports).not.toHaveBeenCalled()
    expect(mockReportsService.fetchUserReports).not.toHaveBeenCalled()
    expect(mockCreateAdminClient).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  it("returns 500 when resolveUser throws", async () => {
    mockResolveUser.mockRejectedValue(new Error("Auth failure"))

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(500)
  })

  it("returns 500 when fetchAllReports throws", async () => {
    mockAuth("owner-123")
    mockCreateAdminClient.mockReturnValue({} as any)
    mockReportsService.fetchAllReports.mockRejectedValue(new Error("Admin query failed"))

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(500)
  })

  it("returns 500 when fetchUserReports throws", async () => {
    mockAuth("user-1")
    mockReportsService.fetchUserReports.mockRejectedValue(new Error("Query failed"))

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(500)
  })

  // -----------------------------------------------------------------------
  // Environment variable handling
  // -----------------------------------------------------------------------

  it("treats undefined OWNER_USER_ID as non-owner matching", async () => {
    vi.stubEnv("OWNER_USER_ID", undefined)
    mockAuth("some-user")
    mockReportsService.fetchUserReports.mockResolvedValue([])
    mockReportsService.formatReport.mockReturnValue({} as any)

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    // Should take the non-owner path (userId !== undefined)
    expect(response.status).toBe(200)
    expect(mockReportsService.fetchUserReports).toHaveBeenCalled()
    expect(mockReportsService.fetchAllReports).not.toHaveBeenCalled()
  })
})
