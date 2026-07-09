import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

vi.mock("lucide-react", () => ({
  HelpCircle: () => <div data-testid="icon-help-circle" />,
}))

// ──────────────────────────────────────────────
// Import after mocks
// ──────────────────────────────────────────────

import { TourHelpButton } from "@/components/product-tour/tour-help-button"

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("TourHelpButton", () => {
  it("renders a button element", () => {
    render(<TourHelpButton onClick={vi.fn()} />)

    const button = screen.getByRole("button")
    expect(button).toBeTruthy()
  })

  it("displays 'Help' text", () => {
    render(<TourHelpButton onClick={vi.fn()} />)

    expect(screen.getByText("Help")).toBeTruthy()
  })

  it("renders the HelpCircle icon", () => {
    render(<TourHelpButton onClick={vi.fn()} />)

    expect(screen.getByTestId("icon-help-circle")).toBeTruthy()
  })

  it("has data-tour='step-7' attribute", () => {
    render(<TourHelpButton onClick={vi.fn()} />)

    const button = screen.getByRole("button")
    expect(button.getAttribute("data-tour")).toBe("step-7")
  })

  it("has title='Start product tour' attribute", () => {
    render(<TourHelpButton onClick={vi.fn()} />)

    const button = screen.getByRole("button")
    expect(button.getAttribute("title")).toBe("Start product tour")
  })

  it("calls onClick handler when clicked", async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<TourHelpButton onClick={handleClick} />)

    const button = screen.getByRole("button")
    await user.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it("calls onClick with the correct event", async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<TourHelpButton onClick={handleClick} />)

    const button = screen.getByRole("button")
    await user.click(button)

    // First argument should be a mouse event (React.MouseEvent)
    expect(handleClick.mock.calls[0][0]).toBeTypeOf("object")
  })

  it("has className as a non-empty string (styling is applied)", () => {
    render(<TourHelpButton onClick={vi.fn()} />)

    const button = screen.getByRole("button")
    expect(button.className).toBeTruthy()
    expect(typeof button.className).toBe("string")
  })

  it("renders icon before text (icon is first child)", () => {
    render(<TourHelpButton onClick={vi.fn()} />)

    const button = screen.getByRole("button")
    const firstChild = button.children[0]

    expect(firstChild).toBe(screen.getByTestId("icon-help-circle"))
  })
})
