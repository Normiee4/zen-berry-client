// ---------------------------------------------------------------------------
// Unit Tests: components/feedback/reviews-list.tsx
// ---------------------------------------------------------------------------
// Tests the ReviewsList component for grid rendering, empty state, and count.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { ReviewsList } from "@/components/feedback/reviews-list"
import type { FormattedReview } from "@/app/api/feedback/review/service"

// ---- Mocks ----
vi.mock("@/components/feedback/review-card", () => ({
  ReviewCard: ({ review }: { review: FormattedReview }) => (
    <div data-testid="review-card" data-review-id={review.id}>
      {review.username}
    </div>
  ),
}))

vi.mock("lucide-react", () => ({
  Star: () => <span data-testid="star-icon" />,
}))

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

function createReview(id: string, overrides: Partial<FormattedReview> = {}): FormattedReview {
  return {
    id,
    username: `user_${id}`,
    rating: 4,
    strugglesSolved: "Helped me focus",
    routineImprovement: "Better routine",
    completedMore: "More tasks done",
    partOfRoutine: "Yes, daily",
    recommendToOthers: "Absolutely",
    additionalFeedback: null,
    createdAt: "2026-06-30T12:00:00Z",
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReviewsList", () => {
  // -----------------------------------------------------------------------
  // Grid rendering
  // -----------------------------------------------------------------------

  it("renders a grid of ReviewCard components", () => {
    const reviews = [createReview("1"), createReview("2"), createReview("3")]
    render(<ReviewsList reviews={reviews} />)

    const cards = screen.getAllByTestId("review-card")
    expect(cards).toHaveLength(3)
  })

  it("renders each user's name from the reviews", () => {
    const reviews = [
      createReview("1", { username: "alice" }),
      createReview("2", { username: "bob" }),
    ]
    render(<ReviewsList reviews={reviews} />)

    expect(screen.getByText("alice")).toBeTruthy()
    expect(screen.getByText("bob")).toBeTruthy()
  })

  it("passes the correct review id to each ReviewCard", () => {
    const reviews = [createReview("rev-100"), createReview("rev-200")]
    render(<ReviewsList reviews={reviews} />)

    const cards = screen.getAllByTestId("review-card")
    expect(cards[0].getAttribute("data-review-id")).toBe("rev-100")
    expect(cards[1].getAttribute("data-review-id")).toBe("rev-200")
  })

  it("returns a grid container with responsive columns", () => {
    const reviews = [createReview("1")]
    const { container } = render(<ReviewsList reviews={reviews} />)

    const grid = container.firstChild as HTMLElement
    expect(grid.className).toContain("grid")
    expect(grid.className).toContain("sm:grid-cols-2")
    expect(grid.className).toContain("lg:grid-cols-3")
  })

  // -----------------------------------------------------------------------
  // Count
  // -----------------------------------------------------------------------

  it("shows correct count of reviews (1 review)", () => {
    const reviews = [createReview("1")]
    render(<ReviewsList reviews={reviews} />)

    // 1 ReviewCard should be rendered
    expect(screen.getAllByTestId("review-card")).toHaveLength(1)
  })

  it("shows correct count of reviews (many reviews)", () => {
    const reviews = Array.from({ length: 10 }, (_, i) => createReview(`rev-${i}`))
    render(<ReviewsList reviews={reviews} />)

    expect(screen.getAllByTestId("review-card")).toHaveLength(10)
  })

  // -----------------------------------------------------------------------
  // Empty state
  // -----------------------------------------------------------------------

  it("shows empty state message when no reviews", () => {
    render(<ReviewsList reviews={[]} />)

    expect(screen.getByText("No reviews yet. Be the first!")).toBeTruthy()
  })

  it("does not render any ReviewCard when reviews is empty", () => {
    render(<ReviewsList reviews={[]} />)

    expect(screen.queryByTestId("review-card")).toBeNull()
  })

  it("does not render grid when reviews is empty", () => {
    const { container } = render(<ReviewsList reviews={[]} />)

    const firstChild = container.firstChild as HTMLElement
    // Should be the empty state div, not a grid
    expect(firstChild.className).not.toContain("grid")
    expect(firstChild.textContent).toContain("No reviews yet")
  })

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  it("handles a single review correctly", () => {
    const reviews = [createReview("single")]
    render(<ReviewsList reviews={reviews} />)

    // Should render grid (not empty state) with 1 card
    expect(screen.queryByText("No reviews yet")).toBeNull()
    expect(screen.getAllByTestId("review-card")).toHaveLength(1)
    expect(screen.getByText("user_single")).toBeTruthy()
  })
})
