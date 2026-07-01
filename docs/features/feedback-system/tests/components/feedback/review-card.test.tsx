// ---------------------------------------------------------------------------
// Unit Tests: components/feedback/review-card.tsx
// ---------------------------------------------------------------------------
// Tests the ReviewCard presentational component with various review data.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, afterEach } from "vitest"
import { render, screen, cleanup } from "@testing-library/react"
import { ReviewCard } from "@/components/feedback/review-card"
import type { FormattedReview } from "@/app/api/feedback/review/service"

vi.mock("lucide-react", () => ({
  Star: ({ className }: { className?: string }) => (
    <span data-testid="star-icon" className={className} />
  ),
}))

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

function createReview(overrides: Partial<FormattedReview> = {}): FormattedReview {
  return {
    id: "rev-1",
    username: "jane_doe",
    rating: 4,
    strugglesSolved: "Helped me stop procrastinating",
    routineImprovement: "I now have a consistent morning routine",
    completedMore: "I finish my top 3 tasks every day",
    partOfRoutine: "Yes, it's part of my daily ritual",
    recommendToOthers: "Absolutely, I tell everyone about it",
    additionalFeedback: null,
    createdAt: "2026-06-30T12:00:00Z",
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReviewCard", () => {
  // -----------------------------------------------------------------------
  // Basic rendering
  // -----------------------------------------------------------------------

  it("renders the username", () => {
    const review = createReview({ username: "alice" })
    render(<ReviewCard review={review} />)

    expect(screen.getByText("alice")).toBeTruthy()
  })

  it("renders the user's initial avatar", () => {
    const review = createReview({ username: "bob" })
    render(<ReviewCard review={review} />)

    expect(screen.getByText("B")).toBeTruthy()
  })

  it("renders the correct number of star icons (5)", () => {
    const review = createReview()
    render(<ReviewCard review={review} />)

    const stars = screen.getAllByTestId("star-icon")
    expect(stars).toHaveLength(5)
  })

  it("renders filled stars for the rating value", () => {
    const review = createReview({ rating: 3 })
    render(<ReviewCard review={review} />)

    const stars = screen.getAllByTestId("star-icon")
    // First 3 should be filled (amber), last 2 should be gray
    stars.forEach((star, i) => {
      if (i < 3) {
        expect(star.className).toContain("fill-amber-400")
      } else {
        expect(star.className).toContain("fill-gray-200")
      }
    })
  })

  it("renders all 5 Q&A pairs", () => {
    const review = createReview()
    render(<ReviewCard review={review} />)

    expect(screen.getByText("Struggles solved")).toBeTruthy()
    expect(screen.getByText("Routine improvement")).toBeTruthy()
    expect(screen.getByText("Completed more")).toBeTruthy()
    expect(screen.getByText("Part of daily routine")).toBeTruthy()
    expect(screen.getByText("Would recommend to others")).toBeTruthy()
  })

  it("renders all Q&A answer values", () => {
    const review = createReview()
    render(<ReviewCard review={review} />)

    expect(screen.getByText("Helped me stop procrastinating")).toBeTruthy()
    expect(screen.getByText("I now have a consistent morning routine")).toBeTruthy()
    expect(screen.getByText("I finish my top 3 tasks every day")).toBeTruthy()
    expect(screen.getByText("Yes, it's part of my daily ritual")).toBeTruthy()
    expect(screen.getByText("Absolutely, I tell everyone about it")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Additional feedback handling
  // -----------------------------------------------------------------------

  it("renders the additional feedback section when present", () => {
    const review = createReview({ additionalFeedback: "Love this app so much!" })
    render(<ReviewCard review={review} />)

    expect(screen.getByText("Additional feedback")).toBeTruthy()
    expect(screen.getByText("Love this app so much!")).toBeTruthy()
  })

  it("does not render additional feedback section when null", () => {
    const review = createReview({ additionalFeedback: null })
    render(<ReviewCard review={review} />)

    expect(screen.queryByText("Additional feedback")).toBeNull()
  })

  it("does not render additional feedback section when empty string", () => {
    const review = createReview({ additionalFeedback: "" })
    render(<ReviewCard review={review} />)

    expect(screen.queryByText("Additional feedback")).toBeNull()
  })

  // -----------------------------------------------------------------------
  // Timestamp
  // -----------------------------------------------------------------------

  it("renders a relative timestamp", () => {
    // Set a recent timestamp (1 minute ago) for testing "1 minute ago"
    const oneMinuteAgo = new Date(Date.now() - 60000).toISOString()
    const review = createReview({ createdAt: oneMinuteAgo })
    render(<ReviewCard review={review} />)

    expect(screen.getByText("1 minute ago")).toBeTruthy()
  })

  it("renders 'just now' for very recent timestamps", () => {
    const now = new Date().toISOString()
    const review = createReview({ createdAt: now })
    render(<ReviewCard review={review} />)

    expect(screen.getByText("just now")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  it("handles rating of 1 (minimum)", () => {
    const review = createReview({ rating: 1 })
    render(<ReviewCard review={review} />)

    const stars = screen.getAllByTestId("star-icon")
    expect(stars[0].className).toContain("fill-amber-400")
    for (let i = 1; i < 5; i++) {
      expect(stars[i].className).toContain("fill-gray-200")
    }
  })

  it("handles rating of 5 (maximum)", () => {
    const review = createReview({ rating: 5 })
    render(<ReviewCard review={review} />)

    const stars = screen.getAllByTestId("star-icon")
    stars.forEach((star) => {
      expect(star.className).toContain("fill-amber-400")
    })
  })

  it("renders with a very long username", () => {
    const review = createReview({ username: "a_very_long_username_indeed_12345" })
    render(<ReviewCard review={review} />)

    expect(screen.getByText("a_very_long_username_indeed_12345")).toBeTruthy()
    expect(screen.getByText("A")).toBeTruthy() // First letter capitalized
  })

  it("renders the card container with rounded-3xl class", () => {
    const review = createReview()
    const { container } = render(<ReviewCard review={review} />)

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain("rounded-3xl")
  })
})
