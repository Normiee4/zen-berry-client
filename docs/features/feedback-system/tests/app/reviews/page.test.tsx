// ---------------------------------------------------------------------------
// Unit Tests: app/reviews/page.tsx (Server Component)
// ---------------------------------------------------------------------------
// Tests the ReviewsPage server component by mocking the Supabase server
// client and checking data fetching and rendering behavior.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import ReviewsPage from "@/app/reviews/page"

// ---- Mocks ----
const mockFrom = vi.fn()
const mockServerSupabase = vi.fn()

vi.mock("@/lib/supabase-server", () => ({
  createServerSupabaseClient: mockServerSupabase,
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

vi.mock("@/components/feedback/reviews-list", () => ({
  ReviewsList: ({ reviews }: { reviews: any[] }) => (
    <div data-testid="reviews-list" data-review-count={reviews.length}>
      {reviews.length === 0 ? (
        <p>No reviews yet. Be the first!</p>
      ) : (
        reviews.map((r: any) => <div key={r.id} data-testid="review-item">{r.username}</div>)
      )}
    </div>
  ),
}))

vi.mock("@/app/api/feedback/review/service", () => ({
  formatReview: (row: any) => ({
    id: row.id,
    username: row.username,
    rating: row.rating,
    strugglesSolved: row.struggles_solved,
    routineImprovement: row.routine_improvement,
    completedMore: row.completed_more,
    partOfRoutine: row.part_of_routine,
    recommendToOthers: row.recommend_to_others,
    additionalFeedback: row.additional_feedback,
    createdAt: row.created_at,
  }),
  type: {} as any,
})

vi.mock("lucide-react", () => ({
  ArrowLeft: () => <span data-testid="icon-arrow-left">AL</span>,
  MessageSquareText: () => <span data-testid="icon-message-square">MS</span>,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockReviewRow(overrides: Record<string, any> = {}) {
  return {
    id: "rev-1",
    user_id: "user-1",
    username: "jane",
    rating: 4,
    struggles_solved: "Helped me focus",
    routine_improvement: "Better mornings",
    completed_more: "More done",
    part_of_routine: "Yes",
    recommend_to_others: "Yes!",
    additional_feedback: null,
    created_at: "2026-06-30T12:00:00Z",
    ...overrides,
  }
}

function setupSupabaseMock(data: any[] | null) {
  const builder = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data, error: null }),
  }
  mockFrom.mockReturnValue(builder)
  mockServerSupabase.mockResolvedValue({ from: mockFrom })
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReviewsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // -----------------------------------------------------------------------
  // Data fetching
  // -----------------------------------------------------------------------

  it("fetches reviews from supabase on render", async () => {
    setupSupabaseMock([])

    render(await ReviewsPage())

    expect(mockServerSupabase).toHaveBeenCalledTimes(1)
    expect(mockFrom).toHaveBeenCalledWith("reviews")
  })

  it("queries reviews ordered by created_at descending", async () => {
    const builder = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }
    mockFrom.mockReturnValue(builder)
    mockServerSupabase.mockResolvedValue({ from: mockFrom })

    render(await ReviewsPage())

    expect(builder.order).toHaveBeenCalledWith("created_at", { ascending: false })
  })

  // -----------------------------------------------------------------------
  // Rendering with reviews
  // -----------------------------------------------------------------------

  it("renders the reviews list with formatted data", async () => {
    const rows = [
      createMockReviewRow({ id: "rev-1", username: "alice", rating: 5 }),
      createMockReviewRow({ id: "rev-2", username: "bob", rating: 3 }),
    ]
    setupSupabaseMock(rows)

    render(await ReviewsPage())

    const list = screen.getByTestId("reviews-list")
    expect(list).toBeTruthy()
    expect(list.getAttribute("data-review-count")).toBe("2")
    expect(screen.getByText("alice")).toBeTruthy()
    expect(screen.getByText("bob")).toBeTruthy()
  })

  it("renders the page title", async () => {
    setupSupabaseMock([])

    render(await ReviewsPage())

    expect(screen.getByText("What Our Users Say")).toBeTruthy()
  })

  it("renders navigation links", async () => {
    setupSupabaseMock([])

    render(await ReviewsPage())

    expect(screen.getByText("Back to home")).toBeTruthy()
    expect(screen.getByText("Share your experience")).toBeTruthy()
  })

  it("renders 'Share your experience' link pointing to /feedback", async () => {
    setupSupabaseMock([])

    render(await ReviewsPage())

    const shareLink = screen.getByText("Share your experience")
    expect(shareLink.getAttribute("href")).toBe("/feedback")
  })

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------

  it("shows empty state when no reviews are returned", async () => {
    setupSupabaseMock([])

    render(await ReviewsPage())

    expect(screen.getByText("No reviews yet. Be the first!")).toBeTruthy()
  })

  it("renders the reviews list with 0 reviews when data is null", async () => {
    setupSupabaseMock(null)

    render(await ReviewsPage())

    const list = screen.getByTestId("reviews-list")
    expect(list.getAttribute("data-review-count")).toBe("0")
  })

  // -----------------------------------------------------------------------
  // Metadata
  // -----------------------------------------------------------------------

  it("has correct page title (not directly testable via render, but structural)", async () => {
    // Metadata is exported as a static object on the page module
    const { metadata } = await import("@/app/reviews/page")
    expect(metadata.title).toBe("Reviews | Zen Berry")
    expect(metadata.description).toContain("what our users are saying")
  })
})
