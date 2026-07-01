import { describe, it, expect, vi, beforeEach } from "vitest"

// ---- Auth-helpers mock (shared by all API controllers) ----
const mockResolveUser = vi.fn()
vi.mock("@/lib/auth-helpers", () => ({
  resolveUser: mockResolveUser,
}))

// ---- Review service mock ----
const mockReviewService = vi.hoisted(() => ({
  insertReview: vi.fn(),
  formatReview: vi.fn(),
}))
vi.mock("@/app/api/feedback/review/service", () => mockReviewService)

// ---- Report service mock ----
const mockReportService = vi.hoisted(() => ({
  insertReport: vi.fn(),
  formatReport: vi.fn(),
}))
vi.mock("@/app/api/feedback/report/service", () => mockReportService)

// ---- Reports service mock ----
const mockReportsService = vi.hoisted(() => ({
  fetchAllReports: vi.fn(),
  fetchUserReports: vi.fn(),
  formatReport: vi.fn(),
}))
vi.mock("@/app/api/feedback/reports/service", () => mockReportsService)

// ---- Admin client mock ----
vi.mock("@/lib/supabase-admin", () => ({
  createAdminClient: vi.fn(),
}))

describe("API Route Access Control", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("unauthenticated user cannot POST to /api/feedback/review", async () => {
    mockResolveUser.mockResolvedValue({ userId: null, supabase: { from: vi.fn() } })

    const { handleCreateReview } = await import("@/app/api/feedback/review/controller")

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 4, struggles_solved: "test", routine_improvement: "test", completed_more: "test", part_of_routine: "test", recommend_to_others: "test" }),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })

  it("unauthenticated user gets 401 from POST /api/feedback/review even with valid body", async () => {
    mockResolveUser.mockResolvedValue({ userId: null, supabase: { from: vi.fn() } })

    const { handleCreateReview } = await import("@/app/api/feedback/review/controller")

    const request = new Request("http://localhost/api/feedback/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 5, struggles_solved: "Great", routine_improvement: "Great", completed_more: "Great", part_of_routine: "Yes", recommend_to_others: "Yes" }),
    })
    const response = await handleCreateReview(request)

    expect(response.status).toBe(401)
  })

  it("unauthenticated user cannot POST to /api/feedback/report", async () => {
    mockResolveUser.mockResolvedValue({ userId: null, supabase: { from: vi.fn() } })

    const { handleCreateReport } = await import("@/app/api/feedback/report/controller")

    const request = new Request("http://localhost/api/feedback/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ issue: "Bug", explanation: "Detail", suggestions: "Fix" }),
    })
    const response = await handleCreateReport(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })

  it("unauthenticated user cannot GET /api/feedback/reports", async () => {
    mockResolveUser.mockResolvedValue({ userId: null, supabase: { from: vi.fn() } })

    const { handleGetReports } = await import("@/app/api/feedback/reports/controller")

    const request = new Request("http://localhost/api/feedback/reports")
    const response = await handleGetReports(request)

    expect(response.status).toBe(401)
    const body = await response.json()
    expect(body.error).toBe("Unauthorized")
  })
})

describe("Page Access Control", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("/reviews page is accessible without auth", async () => {
    const mockFrom = vi.fn()
    const builder = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    mockFrom.mockReturnValue(builder)

    vi.mock("@/lib/supabase-server", () => ({
      createServerSupabaseClient: vi.fn().mockResolvedValue({ from: mockFrom }),
    }))

    const ReviewsPage = (await import("@/app/reviews/page")).default
    const result = await ReviewsPage()

    expect(result).toBeDefined()
  })

  it("/feedback page shows login prompt when not authenticated", async () => {
    vi.mock("@/lib/supabase", () => ({
      createClient: () => ({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
        },
      }),
    }))

    vi.mock("next/link", () => ({
      default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
    }))

    vi.mock("@/components/feedback/review-form", () => ({ ReviewForm: () => <div /> }))
    vi.mock("@/components/feedback/report-form", () => ({ ReportForm: () => <div /> }))

    const { render, screen, waitFor } = await import("@testing-library/react")
    const FeedbackPage = (await import("@/app/feedback/page")).default

    render(<FeedbackPage />)

    await waitFor(() => {
      expect(screen.getByText("Authentication Required")).toBeTruthy()
    })
  })

  it("/report-logs shows 404 for non-owner users", async () => {
    const mockNotFound = vi.fn()

    vi.mock("next/navigation", () => ({
      redirect: () => { throw new Error("NEXT_REDIRECT") },
      notFound: (...args: unknown[]) => {
        mockNotFound(...args)
        throw new Error("NEXT_NOT_FOUND")
      },
    }))

    vi.stubEnv("OWNER_USER_ID", "owner-123")

    vi.mock("@/lib/supabase-server", () => ({
      createServerSupabaseClient: vi.fn().mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "non-owner-user" } } }),
        },
        from: vi.fn(),
      }),
    }))

    const ReportLogsPage = (await import("@/app/report-logs/page")).default

    await expect(ReportLogsPage()).rejects.toThrow("NEXT_NOT_FOUND")
    expect(mockNotFound).toHaveBeenCalled()
  })

  it("/report-logs does not 404 for the owner user", async () => {
    vi.stubEnv("OWNER_USER_ID", "owner-123")

    vi.mock("@/lib/supabase-server", () => ({
      createServerSupabaseClient: vi.fn().mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({ data: { user: { id: "owner-123" } } }),
        },
        from: vi.fn(),
      }),
    }))

    vi.mock("@/lib/supabase-admin", () => ({
      createAdminClient: vi.fn().mockReturnValue({}),
    }))

    vi.mock("@/app/api/feedback/reports/service", () => ({
      fetchAllReports: vi.fn().mockResolvedValue([]),
    }))

    const ReportLogsPage = (await import("@/app/report-logs/page")).default

    const result = await ReportLogsPage()
    expect(result).toBeDefined()
  })
})
