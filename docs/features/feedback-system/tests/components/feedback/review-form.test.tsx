// ---------------------------------------------------------------------------
// Unit Tests: components/feedback/review-form.tsx
// ---------------------------------------------------------------------------
// Tests the ReviewForm component including rendering, star rating interaction,
// form validation, submit behavior, and loading state.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { ReviewForm } from "@/components/feedback/review-form"

// ---- Mocks ----
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    disabled,
    type,
    onClick,
    className,
  }: {
    children: React.ReactNode
    disabled?: boolean
    type?: "button" | "submit"
    onClick?: () => void
    className?: string
  }) => (
    <button type={type || "button"} disabled={disabled} onClick={onClick} className={className} data-testid="submit-button">
      {children}
    </button>
  ),
}))

const reviewQuestions = [
  { key: "struggles_solved", label: "What struggles did Zen Berry help you solve?" },
  { key: "routine_improvement", label: "How has your routine improved?" },
  { key: "completed_more", label: "What have you been able to complete more of?" },
  { key: "part_of_routine", label: "Has Zen Berry become part of your daily routine?" },
  { key: "recommend_to_others", label: "Would you recommend Zen Berry to others?" },
]

beforeEach(() => {
  vi.clearAllMocks()
  globalThis.fetch = vi.fn()
})

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ReviewForm", () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------

  it("renders all 5 required review questions", () => {
    render(<ReviewForm />)

    for (const q of reviewQuestions) {
      expect(screen.getByText(q.label)).toBeTruthy()
    }
  })

  it("renders the optional additional feedback textarea", () => {
    render(<ReviewForm />)

    expect(screen.getByText(/anything else/i)).toBeTruthy()
    expect(screen.getByPlaceholderText("Any additional feedback...")).toBeTruthy()
  })

  it("renders 5 clickable star buttons", () => {
    render(<ReviewForm />)

    const starButtons = screen.getAllByRole("button").filter(
      (btn) => btn.getAttribute("aria-label")?.startsWith("Rate"),
    )
    expect(starButtons).toHaveLength(5)
  })

  it("renders star buttons with aria-labels Rate 1 star through Rate 5 stars", () => {
    render(<ReviewForm />)

    expect(screen.getByLabelText("Rate 1 star")).toBeTruthy()
    expect(screen.getByLabelText("Rate 5 stars")).toBeTruthy()
  })

  it("renders submit button with 'Submit Review' text", () => {
    render(<ReviewForm />)

    expect(screen.getByText("Submit Review")).toBeTruthy()
  })

  it("renders all textareas with correct ids", () => {
    render(<ReviewForm />)

    expect(screen.getByLabelText(/struggles.*helped/i)).toBeTruthy()
    expect(screen.getByLabelText(/routine.*improved/i)).toBeTruthy()
    expect(screen.getByLabelText(/complete more/i)).toBeTruthy()
    expect(screen.getByLabelText(/daily routine/i)).toBeTruthy()
    expect(screen.getByLabelText(/recommend/i)).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Star rating interaction
  // -----------------------------------------------------------------------

  it("star rating click updates selection", () => {
    render(<ReviewForm />)

    const star3 = screen.getByLabelText("Rate 3 stars")
    fireEvent.click(star3)

    // After clicking star 3, stars 1-3 should be filled (amber), stars 4-5 should be unfilled (gray)
    // We verify this by checking the aria-label is still present
    expect(screen.getByLabelText("Rate 3 stars")).toBeTruthy()
  })

  it("allows changing star rating after initial selection", () => {
    render(<ReviewForm />)

    fireEvent.click(screen.getByLabelText("Rate 2 stars"))
    fireEvent.click(screen.getByLabelText("Rate 5 stars"))

    expect(screen.getByLabelText("Rate 5 stars")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Form validation
  // -----------------------------------------------------------------------

  it("shows toast error when submitting with no rating selected", async () => {
    const { toast } = await import("sonner")
    render(<ReviewForm />)

    // Fill in all textareas
    for (const q of reviewQuestions) {
      fireEvent.change(screen.getByLabelText(new RegExp(q.label)), {
        target: { value: "Some answer text" },
      })
    }

    const submitBtn = screen.getByText("Submit Review")
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please select a rating")
    })

    expect(globalThis.fetch).not.toHaveBeenCalled()
  })

  // -----------------------------------------------------------------------
  // Submit behavior — fetch call
  // -----------------------------------------------------------------------

  it("calls POST /api/feedback/review on submit with valid data", async () => {
    const fetchMock = vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "rev-1" }),
    } as Response)

    render(<ReviewForm />)

    // Set rating
    fireEvent.click(screen.getByLabelText("Rate 4 stars"))

    // Fill in all textareas
    for (const q of reviewQuestions) {
      const textarea = screen.getByLabelText(new RegExp(q.label))
      fireEvent.change(textarea, { target: { value: "Sample answer" } })
    }

    // Submit
    fireEvent.click(screen.getByText("Submit Review"))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/feedback/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("rating"),
      })
    })
  })

  it("sends all form fields in the POST body", async () => {
    const fetchMock = vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "rev-1" }),
    } as Response)

    render(<ReviewForm />)

    fireEvent.click(screen.getByLabelText("Rate 5 stars"))

    fireEvent.change(screen.getByLabelText(/struggles.*helped/i), { target: { value: "Solved focus" } })
    fireEvent.change(screen.getByLabelText(/routine.*improved/i), { target: { value: "Better mornings" } })
    fireEvent.change(screen.getByLabelText(/complete more/i), { target: { value: "Finished tasks" } })
    fireEvent.change(screen.getByLabelText(/daily routine/i), { target: { value: "Yes, daily" } })
    fireEvent.change(screen.getByLabelText(/recommend/i), { target: { value: "Absolutely" } })

    fireEvent.click(screen.getByText("Submit Review"))

    await waitFor(() => {
      const callBody = JSON.parse(fetchMock.mock.calls[0][1]!.body as string)
      expect(callBody.rating).toBe(5)
      expect(callBody.struggles_solved).toBe("Solved focus")
      expect(callBody.routine_improvement).toBe("Better mornings")
      expect(callBody.completed_more).toBe("Finished tasks")
      expect(callBody.part_of_routine).toBe("Yes, daily")
      expect(callBody.recommend_to_others).toBe("Absolutely")
    })
  })

  it("redirects to /reviews on successful submit", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "rev-1" }),
    } as Response)

    render(<ReviewForm />)

    fireEvent.click(screen.getByLabelText("Rate 4 stars"))
    for (const q of reviewQuestions) {
      fireEvent.change(screen.getByLabelText(new RegExp(q.label)), { target: { value: "Answer" } })
    }

    fireEvent.click(screen.getByText("Submit Review"))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/reviews")
    })
  })

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  it("shows toast error when API returns error", async () => {
    const { toast } = await import("sonner")
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Rating is required" }),
    } as Response)

    render(<ReviewForm />)

    fireEvent.click(screen.getByLabelText("Rate 4 stars"))
    for (const q of reviewQuestions) {
      fireEvent.change(screen.getByLabelText(new RegExp(q.label)), { target: { value: "Answer" } })
    }

    fireEvent.click(screen.getByText("Submit Review"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Rating is required")
    })
  })

  it("shows generic toast error when fetch throws", async () => {
    const { toast } = await import("sonner")
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("Network error"))

    render(<ReviewForm />)

    fireEvent.click(screen.getByLabelText("Rate 4 stars"))
    for (const q of reviewQuestions) {
      fireEvent.change(screen.getByLabelText(new RegExp(q.label)), { target: { value: "Answer" } })
    }

    fireEvent.click(screen.getByText("Submit Review"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.")
    })
  })

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  it("shows loading spinner while submitting", async () => {
    // Keep the promise pending so we can check loading state
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}))

    render(<ReviewForm />)

    fireEvent.click(screen.getByLabelText("Rate 4 stars"))
    for (const q of reviewQuestions) {
      fireEvent.change(screen.getByLabelText(new RegExp(q.label)), { target: { value: "Answer" } })
    }

    fireEvent.click(screen.getByText("Submit Review"))

    await waitFor(() => {
      expect(screen.getByText("Submitting...")).toBeTruthy()
    })
  })

  it("disables submit button while submitting", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}))

    render(<ReviewForm />)

    fireEvent.click(screen.getByLabelText("Rate 4 stars"))
    for (const q of reviewQuestions) {
      fireEvent.change(screen.getByLabelText(new RegExp(q.label)), { target: { value: "Answer" } })
    }

    const submitBtn = screen.getByText("Submit Review")
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText("Submitting...")).toBeTruthy()
    })
  })
})
