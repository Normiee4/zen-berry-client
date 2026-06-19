// ---------------------------------------------------------------------------
// Component Tests: Sidebar (productivity nav item)
// ---------------------------------------------------------------------------
// Verifies that the Productivity nav item is rendered in the sidebar,
// navigates to the correct route, and is highlighted when active.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"

// -- Mocks --
const mockPush = vi.fn()
const mockUsePathname = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockUsePathname(),
}))

vi.mock("lucide-react", () => ({
  Timer: () => <span data-testid="icon-timer" />,
  Pin: () => <span data-testid="icon-pin" />,
  BarChart3: () => <span data-testid="icon-barchart3" />,
  LogOut: () => <span data-testid="icon-logout" />,
}))

import { Sidebar } from "@/components/sidebar/sidebar"

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Sidebar — Productivity nav item", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders a nav item with 'Productivity' label", () => {
    mockUsePathname.mockReturnValue("/dashboard")
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByText("Productivity")).toBeInTheDocument()
  })

  it("renders the Productivity nav item alongside Focus and Pins", () => {
    mockUsePathname.mockReturnValue("/dashboard")
    render(<Sidebar {...defaultProps} />)

    const navButtons = screen.getAllByRole("button")
    const labels = navButtons.map((btn) => btn.textContent)
    expect(labels).toContain("Focus")
    expect(labels).toContain("Pins")
    expect(labels).toContain("Productivity")
  })

  it("renders the BarChart3 icon for the Productivity item", () => {
    mockUsePathname.mockReturnValue("/dashboard")
    render(<Sidebar {...defaultProps} />)

    expect(screen.getByTestId("icon-barchart3")).toBeInTheDocument()
  })

  it("navigates to /dashboard/productivity when clicked", () => {
    mockUsePathname.mockReturnValue("/dashboard")
    render(<Sidebar {...defaultProps} />)

    const productivityButton = screen.getByText("Productivity").closest("button")
    expect(productivityButton).not.toBeNull()

    fireEvent.click(productivityButton!)
    expect(mockPush).toHaveBeenCalledWith("/dashboard/productivity")
  })

  it("calls onClose after navigating", () => {
    const onClose = vi.fn()
    mockUsePathname.mockReturnValue("/dashboard")
    render(<Sidebar {...defaultProps} onClose={onClose} />)

    fireEvent.click(screen.getByText("Productivity"))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("applies active styling when on the productivity page", () => {
    mockUsePathname.mockReturnValue("/dashboard/productivity")
    render(<Sidebar {...defaultProps} />)

    const productivityButton = screen.getByText("Productivity").closest("button")
    expect(productivityButton?.className).toContain("bg-matcha/10")
    expect(productivityButton?.className).toContain("text-matcha")
  })

  it("does NOT apply active styling when on a different page", () => {
    mockUsePathname.mockReturnValue("/dashboard")
    render(<Sidebar {...defaultProps} />)

    const productivityButton = screen.getByText("Productivity").closest("button")
    expect(productivityButton?.className).toContain("text-muted-foreground")
    expect(productivityButton?.className).not.toContain("bg-matcha/10")
  })
})
