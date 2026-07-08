// ---------------------------------------------------------------------------
// Unit Tests: components/landing/Footer.tsx (Client Component)
// ---------------------------------------------------------------------------
// Tests the Footer component's legal links: Privacy, Terms, and Cookies.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { Footer } from "@/components/landing/Footer"

// ---- Mocks ----

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
  Leaf: () => <span data-testid="icon-leaf" />,
  Heart: () => <span data-testid="icon-heart" />,
  Mail: () => <span data-testid="icon-mail" />,
}))

vi.mock("@mui/icons-material/GitHub", () => ({
  default: () => <span data-testid="icon-github" />,
}))

vi.mock("@mui/icons-material/LinkedIn", () => ({
  default: () => <span data-testid="icon-linkedin" />,
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Footer — Legal Links", () => {
  // -----------------------------------------------------------------------
  // Legal links
  // -----------------------------------------------------------------------

  it("renders Privacy link pointing to /privacy", () => {
    render(<Footer />)

    const privacyLink = screen.getByText("Privacy")
    expect(privacyLink).toBeTruthy()
    expect(privacyLink.getAttribute("href")).toBe("/privacy")
  })

  it("renders Terms link pointing to /terms", () => {
    render(<Footer />)

    const termsLink = screen.getByText("Terms")
    expect(termsLink).toBeTruthy()
    expect(termsLink.getAttribute("href")).toBe("/terms")
  })

  it("renders Cookies link pointing to /privacy#cookies", () => {
    render(<Footer />)

    const cookiesLink = screen.getByText("Cookies")
    expect(cookiesLink).toBeTruthy()
    expect(cookiesLink.getAttribute("href")).toBe("/privacy#cookies")
  })

  // -----------------------------------------------------------------------
  // Legal section heading
  // -----------------------------------------------------------------------

  it("renders the 'Legal' section heading", () => {
    render(<Footer />)

    expect(screen.getByText("Legal")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Brand link
  // -----------------------------------------------------------------------

  it("renders 'Zen Berry' brand link pointing to /", () => {
    render(<Footer />)

    const brandLink = screen.getByText("Zen Berry")
    expect(brandLink).toBeTruthy()
    expect(brandLink.getAttribute("href")).toBe("/")
  })

  // -----------------------------------------------------------------------
  // Other navigation sections are present
  // -----------------------------------------------------------------------

  it("renders the Product section with links", () => {
    render(<Footer />)

    expect(screen.getByText("Product")).toBeTruthy()
    expect(screen.getByText("Features")).toBeTruthy()
    expect(screen.getByText("Pricing")).toBeTruthy()
    expect(screen.getByText("Reviews")).toBeTruthy()
  })

  it("renders the Resources section with links", () => {
    render(<Footer />)

    expect(screen.getByText("Resources")).toBeTruthy()
    expect(screen.getByText("Help Center")).toBeTruthy()
    expect(screen.getByText("Feedback")).toBeTruthy()
  })
})
