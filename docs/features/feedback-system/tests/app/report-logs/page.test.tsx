// ---------------------------------------------------------------------------
// Unit Tests: app/report-logs/page.tsx (Server Component)
// ---------------------------------------------------------------------------
// Tests the ReportLogsPage server component covering auth redirect,
// owner gating (404), and report table rendering.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import ReportLogsPage from "@/app/report-logs/page"

// ---- Mocks ----
const mockGetUser = vi.fn()
const mockServerSupabase = vi.fn()
const mockAdminClient = vi.fn()
const mockFetchAllReports = vi.fn()

vi.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: mockServerSupabase,
}))

vi.mock("@/lib/supabase-admin", () => ({
  createAdminClient: mockAdminClient,
}))

vi.mock("@/app/api/feedback/reports/service", () => ({
  fetchAllReports: mockFetchAllReports,
}))

const mockRedirect = vi.fn()
const mockNotFound = vi.fn()

vi.mock("next/navigation", () => ({
  redirect: (...args: any[]) => {
    mockRedirect(...args)
    // Simulate Next.js redirect behavior by throwing
    throw new Error("NEXT_REDIRECT")
  },
  notFound: (...args: any[]) => {
    mockNotFound(...args)
    throw new Error("NEXT_NOT_FOUND")
  },
}))

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode
    href: string
    className?: string
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}))

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left">AL</span>,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function setupAuthenticatedSupabase(userId: string | null) {
  const supabase = {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: userId ? { id: userId } : null } }),
    },
    from: vi.fn(),
  }
  mockServerSupabase.mockResolvedValue(supabase)
  return supabase
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("OWNER_USER_ID", "owner-123")
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReportLogsPage", () => {
  // -----------------------------------------------------------------------
  // Auth redirect
  // -----------------------------------------------------------------------

  it("redirects to /auth/login when user is not authenticated", async () => {
    setupAuthenticatedSupabase(null)

    await expect(ReportLogsPage()).rejects.toThrow("NEXT_REDIRECT")
    expect(mockRedirect).toHaveBeenCalledWith("/auth/login")
  })

  // -----------------------------------------------------------------------
  // Owner check — 404 for non-owner
  // -----------------------------------------------------------------------

  it("shows 404 if user is not the owner", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("regular-user-456")

    await expect(ReportLogsPage()).rejects.toThrow("NEXT_NOT_FOUND")
    expect(mockNotFound).toHaveBeenCalled()
  })

  it("does not call fetchAllReports for non-owner user", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("regular-user-456")

    await expect(ReportLogsPage()).rejects.toThrow("NEXT_NOT_FOUND")
    expect(mockFetchAllReports).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // Owner — fetches and renders reports
  // -----------------------------------------------------------------------

  it("fetches all reports using admin client for owner", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("owner-123")

    const adminClient = { admin: true }
    mockAdminClient.mockReturnValue(adminClient)
    mockFetchAllReports.mockResolvedValue([])

    render(await ReportLogsPage())

    expect(mockAdminClient).toHaveBeenCalledTimes(1)
    expect(mockFetchAllReports).toHaveBeenCalledWith(adminClient)
  })

  it("renders the report table for owner with reports", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("owner-123")

    mockAdminClient.mockReturnValue({} as any)
    mockFetchAllReports.mockResolvedValue([
      {
        id: "rpt-1",
        user_id: "user-1",
        issue: "Login bug",
        explanation: "Cannot login after password reset",
        suggestions: "Add reset link",
        bug_detail: null,
        created_at: "2026-06-30T12:00:00Z",
      },
      {
        id: "rpt-2",
        user_id: "user-2",
        issue: "Timer freeze",
        explanation: "Timer stops responding after 1 hour",
        suggestions: "Add auto-reset",
        bug_detail: "Chrome only",
        created_at: "2026-06-29T10:00:00Z",
      },
    ])

    render(await ReportLogsPage())

    // Should render table headers
    expect(screen.getByText("Date")).toBeTruthy()
    expect(screen.getByText("Issue")).toBeTruthy()
    expect(screen.getByText("Explanation")).toBeTruthy()
    expect(screen.getByText("Suggestions")).toBeTruthy()
    expect(screen.getByText("Bug Details")).toBeTruthy()

    // Should render report data
    expect(screen.getByText("Login bug")).toBeTruthy()
    expect(screen.getByText("Timer freeze")).toBeTruthy()
    expect(screen.getByText("Cannot login after password reset")).toBeTruthy()
  })

  it("shows 'All Reports' heading with correct count", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("owner-123")

    mockAdminClient.mockReturnValue({} as any)
    mockFetchAllReports.mockResolvedValue([
      { id: "1", user_id: "u1", issue: "A", explanation: "a", suggestions: "a", bug_detail: null, created_at: "2026-06-30T12:00:00Z" },
    ])

    render(await ReportLogsPage())

    expect(screen.getByText("All Reports")).toBeTruthy()
    expect(screen.getByText("1 report submitted")).toBeTruthy()
  })

  it("shows 'reports' (plural) when count is not 1", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("owner-123")

    mockAdminClient.mockReturnValue({} as any)
    mockFetchAllReports.mockResolvedValue([
      { id: "1", user_id: "u1", issue: "A", explanation: "a", suggestions: "a", bug_detail: null, created_at: "2026-06-30T12:00:00Z" },
      { id: "2", user_id: "u2", issue: "B", explanation: "b", suggestions: "b", bug_detail: null, created_at: "2026-06-29T12:00:00Z" },
    ])

    render(await ReportLogsPage())

    expect(screen.getByText("2 reports submitted")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------

  it("shows empty state when there are no reports", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("owner-123")

    mockAdminClient.mockReturnValue({} as any)
    mockFetchAllReports.mockResolvedValue([])

    render(await ReportLogsPage())

    expect(screen.getByText("No reports yet.")).toBeTruthy()
    expect(screen.queryByText("Date")).toBeNull() // Table should not be rendered
  })

  // -----------------------------------------------------------------------
  // Navigation
  // -----------------------------------------------------------------------

  it("renders 'Back to home' link", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("owner-123")

    mockAdminClient.mockReturnValue({} as any)
    mockFetchAllReports.mockResolvedValue([])

    render(await ReportLogsPage())

    const backLink = screen.getByText("Back to home")
    expect(backLink).toBeTruthy()
    expect(backLink.getAttribute("href")).toBe("/")
  })

  it("renders 'Report Logs' heading in header", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")
    setupAuthenticatedSupabase("owner-123")

    mockAdminClient.mockReturnValue({} as any)
    mockFetchAllReports.mockResolvedValue([])

    render(await ReportLogsPage())

    expect(screen.getByText("Report Logs")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Metadata
  // -----------------------------------------------------------------------

  it("has correct page title", async () => {
    const { metadata } = await import("@/app/report-logs/page")
    expect(metadata.title).toBe("Report Logs | Zen Berry")
    expect(metadata.description).toContain("reports and feedback")
  })
})
