// ---------------------------------------------------------------------------
// Unit Tests: components/feedback/report-form.tsx
// ---------------------------------------------------------------------------
// Tests the ReportForm component including rendering, form validation,
// submit behavior, and loading state.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react"
import { ReportForm } from "@/components/feedback/report-form"

// ---- Mocks ----
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
  }: {
    children: React.ReactNode
    disabled?: boolean
    type?: "button" | "submit"
    onClick?: () => void
  }) => (
    <button type={type || "button"} disabled={disabled} onClick={onClick} data-testid="submit-button">
      {children}
    </button>
  ),
}))

const reportQuestions = [
  { key: "issue", label: "What issue did you encounter?" },
  { key: "explanation", label: "Explain the issue in detail" },
  { key: "suggestions", label: "Do you have any suggestions?" },
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

describe("ReportForm", () => {
  // -----------------------------------------------------------------------
  // Rendering
  // -----------------------------------------------------------------------

  it("renders all 3 required report questions", () => {
    render(<ReportForm />)

    for (const q of reportQuestions) {
      expect(screen.getByText(q.label)).toBeTruthy()
    }
  })

  it("renders the optional bug detail textarea", () => {
    render(<ReportForm />)

    expect(screen.getByText(/Additional bug details/i)).toBeTruthy()
    expect(screen.getByPlaceholderText("Any additional details...")).toBeTruthy()
  })

  it("renders submit button with 'Submit Report' text", () => {
    render(<ReportForm />)

    expect(screen.getByText("Submit Report")).toBeTruthy()
  })

  it("renders all textareas with required attribute on required fields", () => {
    render(<ReportForm />)

    const issueTextarea = screen.getByLabelText(/What issue did you encounter/i)
    const explanationTextarea = screen.getByLabelText(/Explain the issue/i)
    const suggestionsTextarea = screen.getByLabelText(/suggestions/i)
    const bugDetailTextarea = screen.getByLabelText(/Additional bug details/i)

    expect(issueTextarea).toBeRequired()
    expect(explanationTextarea).toBeRequired()
    expect(suggestionsTextarea).toBeRequired()
    expect(bugDetailTextarea).not.toBeRequired()
  })

  // -----------------------------------------------------------------------
  // Submit behavior
  // -----------------------------------------------------------------------

  it("calls POST /api/feedback/report on submit with valid data", async () => {
    const fetchMock = vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "rpt-1" }),
    } as Response)

    render(<ReportForm />)

    fireEvent.change(screen.getByLabelText(/What issue/i), { target: { value: "Timer issue" } })
    fireEvent.change(screen.getByLabelText(/Explain the issue/i), { target: { value: "It doesn't stop" } })
    fireEvent.change(screen.getByLabelText(/suggestions/i), { target: { value: "Fix it please" } })

    fireEvent.click(screen.getByText("Submit Report"))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/feedback/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: expect.stringContaining("Timer issue"),
      })
    })
  })

  it("sends all form fields in the POST body", async () => {
    const fetchMock = vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "rpt-1" }),
    } as Response)

    render(<ReportForm />)

    fireEvent.change(screen.getByLabelText(/What issue/i), { target: { value: "Login bug" } })
    fireEvent.change(screen.getByLabelText(/Explain the issue/i), { target: { value: "Cannot login after reset" } })
    fireEvent.change(screen.getByLabelText(/suggestions/i), { target: { value: "Add a reset password link" } })
    fireEvent.change(screen.getByLabelText(/Additional bug details/i), { target: { value: "Happens on Safari" } })

    fireEvent.click(screen.getByText("Submit Report"))

    await waitFor(() => {
      const callBody = JSON.parse(fetchMock.mock.calls[0][1]!.body as string)
      expect(callBody.issue).toBe("Login bug")
      expect(callBody.explanation).toBe("Cannot login after reset")
      expect(callBody.suggestions).toBe("Add a reset password link")
      expect(callBody.bug_detail).toBe("Happens on Safari")
    })
  })

  it("clears form on successful submit", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "rpt-1" }),
    } as Response)

    render(<ReportForm />)

    fireEvent.change(screen.getByLabelText(/What issue/i), { target: { value: "Timer bug" } })
    fireEvent.change(screen.getByLabelText(/Explain the issue/i), { target: { value: "Details" } })
    fireEvent.change(screen.getByLabelText(/suggestions/i), { target: { value: "Fix" } })

    fireEvent.click(screen.getByText("Submit Report"))

    await waitFor(() => {
      // After success, the form clears (setFormData({}))
      const issueField = screen.getByLabelText(/What issue/i) as HTMLTextAreaElement
      expect(issueField.value).toBe("")
    })
  })

  // -----------------------------------------------------------------------
  // Error handling
  // -----------------------------------------------------------------------

  it("shows toast error when API returns error", async () => {
    const { toast } = await import("sonner")
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Issue is required" }),
    } as Response)

    render(<ReportForm />)

    fireEvent.change(screen.getByLabelText(/What issue/i), { target: { value: "Bug" } })
    fireEvent.change(screen.getByLabelText(/Explain the issue/i), { target: { value: "Detail" } })
    fireEvent.change(screen.getByLabelText(/suggestions/i), { target: { value: "Suggestion" } })

    fireEvent.click(screen.getByText("Submit Report"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Issue is required")
    })
  })

  it("shows generic toast error when fetch throws", async () => {
    const { toast } = await import("sonner")
    vi.mocked(globalThis.fetch).mockRejectedValue(new Error("Network error"))

    render(<ReportForm />)

    fireEvent.change(screen.getByLabelText(/What issue/i), { target: { value: "Bug" } })
    fireEvent.change(screen.getByLabelText(/Explain the issue/i), { target: { value: "Detail" } })
    fireEvent.change(screen.getByLabelText(/suggestions/i), { target: { value: "Suggestion" } })

    fireEvent.click(screen.getByText("Submit Report"))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong. Please try again.")
    })
  })

  // -----------------------------------------------------------------------
  // Loading state
  // -----------------------------------------------------------------------

  it("shows loading spinner while submitting", async () => {
    vi.mocked(globalThis.fetch).mockReturnValue(new Promise(() => {}))

    render(<ReportForm />)

    fireEvent.change(screen.getByLabelText(/What issue/i), { target: { value: "Bug" } })
    fireEvent.change(screen.getByLabelText(/Explain the issue/i), { target: { value: "Detail" } })
    fireEvent.change(screen.getByLabelText(/suggestions/i), { target: { value: "Suggestion" } })

    fireEvent.click(screen.getByText("Submit Report"))

    await waitFor(() => {
      expect(screen.getByText("Submitting...")).toBeTruthy()
    })
  })
})
