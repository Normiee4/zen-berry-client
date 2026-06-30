// ---------------------------------------------------------------------------
// Unit Tests: app/feedback/page.tsx
// ---------------------------------------------------------------------------
// Tests the FeedbackPage component covering auth states and tab switching.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import FeedbackPage from "@/app/feedback/page"

// ---- Mocks ----
const mockGetUser = vi.fn()
vi.mock("@/lib/supabase", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
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

vi.mock("@/components/feedback/review-form", () => ({
  ReviewForm: () => <div data-testid="review-form">ReviewForm Component</div>,
}))

vi.mock("@/components/feedback/report-form", () => ({
  ReportForm: () => <div data-testid="report-form">ReportForm Component</div>,
}))

vi.mock("lucide-react", () => ({
  MessageSquareText: () => <span data-testid="icon-message-square">MS</span>,
  Flag: () => <span data-testid="icon-flag">F</span>,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  cleanup()
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("FeedbackPage", () => {
  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  it("shows loading spinner initially", () => {
    // Keep the promise pending
    mockGetUser.mockReturnValue(new Promise(() => {}))

    render(<FeedbackPage />)

    const spinner = document.querySelector(".animate-spin")
    expect(spinner).toBeTruthy()
  })

  it("does not render any form content while loading", () => {
    mockGetUser.mockReturnValue(new Promise(() => {}))

    render(<FeedbackPage />)

    expect(screen.queryByText("Share Your Experience")).toBeNull()
    expect(screen.queryByText("Report an Issue")).toBeNull()
    expect(screen.queryByTestId("review-form")).toBeNull()
  })

  // -----------------------------------------------------------------------
  // Unauthenticated state
  // -----------------------------------------------------------------------

  it("shows login prompt when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(<FeedbackPage />)

    await waitFor(() => {
      expect(screen.getByText("Authentication Required")).toBeTruthy()
    })
  })

  it("shows 'Please log in to submit feedback.' message when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(<FeedbackPage />)

    await waitFor(() => {
      expect(screen.getByText("Please log in to submit feedback.")).toBeTruthy()
    })
  })

  it("renders a link to /auth/login when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(<FeedbackPage />)

    await waitFor(() => {
      const loginLink = screen.getByText("Go to Login")
      expect(loginLink).toBeTruthy()
      expect(loginLink.getAttribute("href")).toBe("/auth/login")
    })
  })

  it("does not show tabs when not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    render(<FeedbackPage />)

    await waitFor(() => {
      expect(screen.queryByText("Send a Review")).toBeNull()
      expect(screen.queryByText("Report an Issue")).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Authenticated — default tab
  // -----------------------------------------------------------------------

  it("shows review tab by default when authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(<FeedbackPage />)

    await waitFor(() => {
      expect(screen.getByTestId("review-form")).toBeTruthy()
    })
  })

  it("shows 'Share Your Experience' heading by default", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(<FeedbackPage />)

    await waitFor(() => {
      expect(screen.getByText("Share Your Experience")).toBeTruthy()
    })
  })

  it("does not show report form by default", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(<FeedbackPage />)

    await waitFor(() => {
      expect(screen.getByTestId("review-form")).toBeTruthy()
      expect(screen.queryByTestId("report-form")).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Tab switching
  // -----------------------------------------------------------------------

  it("can switch to report tab by clicking 'Report an Issue'", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(<FeedbackPage />)

    await waitFor(() => {
      expect(screen.getByTestId("review-form")).toBeTruthy()
    })

    fireEvent.click(screen.getByText("Report an Issue"))

    await waitFor(() => {
      expect(screen.getByTestId("report-form")).toBeTruthy()
      expect(screen.queryByTestId("review-form")).toBeNull()
    })
  })

  it("shows 'Report an Issue' heading after switching to report tab", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(<FeedbackPage />)
    await waitFor(() => expect(screen.getByTestId("review-form")).toBeTruthy())

    fireEvent.click(screen.getByText("Report an Issue"))

    await waitFor(() => {
      expect(screen.getByText("Report an Issue")).toBeTruthy()
      expect(screen.getByText("Help us improve by reporting bugs or suggesting improvements.")).toBeTruthy()
    })
  })

  it("can switch back to review tab from report tab", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(<FeedbackPage />)
    await waitFor(() => expect(screen.getByTestId("review-form")).toBeTruthy())

    // Switch to report
    fireEvent.click(screen.getByText("Report an Issue"))
    await waitFor(() => expect(screen.getByTestId("report-form")).toBeTruthy())

    // Switch back to review
    fireEvent.click(screen.getByText("Send a Review"))
    await waitFor(() => {
      expect(screen.getByTestId("review-form")).toBeTruthy()
      expect(screen.queryByTestId("report-form")).toBeNull()
    })
  })

  // -----------------------------------------------------------------------
  // Navigation links
  // -----------------------------------------------------------------------

  it("renders 'Zen Berry' link back to home", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(<FeedbackPage />)

    await waitFor(() => {
      const homeLink = screen.getByText("Zen Berry")
      expect(homeLink).toBeTruthy()
      expect(homeLink.getAttribute("href")).toBe("/")
    })
  })

  it("renders 'Read Reviews' link to /reviews", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } })

    render(<FeedbackPage />)

    await waitFor(() => {
      const reviewsLink = screen.getByText("Read Reviews")
      expect(reviewsLink).toBeTruthy()
      expect(reviewsLink.getAttribute("href")).toBe("/reviews")
    })
  })
})
