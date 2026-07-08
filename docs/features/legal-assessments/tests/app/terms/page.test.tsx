// ---------------------------------------------------------------------------
// Unit Tests: app/terms/page.tsx (Server Component)
// ---------------------------------------------------------------------------
// Tests the Terms of Use page — a static server component with hardcoded
// content, no data fetching.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import TermsPage from "@/app/terms/page"

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

vi.mock("@/components/landing/Footer", () => ({
  Footer: () => <div data-testid="footer-mock" />,
}))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TermsPage", () => {
  // -----------------------------------------------------------------------
  // Page title and layout
  // -----------------------------------------------------------------------

  it("renders 'Terms of Use' as the page title", async () => {
    render(await TermsPage())

    expect(screen.getByText("Terms of Use")).toBeTruthy()
  })

  it("renders 'Back to Home' link pointing to '/'", async () => {
    render(await TermsPage())

    const backLink = screen.getByText("← Back to Home")
    expect(backLink).toBeTruthy()
    expect(backLink.getAttribute("href")).toBe("/")
  })

  it("renders the Footer component", async () => {
    render(await TermsPage())

    expect(screen.getByTestId("footer-mock")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // All 15 section headings
  // -----------------------------------------------------------------------

  it("renders all 15 section headings", async () => {
    render(await TermsPage())

    const headings = [
      "1. Acceptance of Terms",
      "2. Eligibility",
      "3. Account Registration & Security",
      "4. Acceptable Use",
      "5. User Content & License",
      "6. AI Features",
      "7. Intellectual Property",
      "8. Third-Party Services",
      "9. Disclaimer of Warranties",
      "10. Limitation of Liability",
      "11. Indemnification",
      "12. Termination",
      "13. Governing Law & Dispute Resolution",
      "14. Changes to Terms",
      "15. Contact",
    ]

    for (const heading of headings) {
      expect(screen.getByText(heading)).toBeTruthy()
    }
  })

  // -----------------------------------------------------------------------
  // Governing law and venue
  // -----------------------------------------------------------------------

  it("renders Republic of the Philippines as governing law", async () => {
    render(await TermsPage())

    expect(screen.getByText(/Republic of the Philippines/)).toBeTruthy()
    expect(screen.getByText(/governed by and construed in accordance with the laws of the Republic of the Philippines/)).toBeTruthy()
  })

  it("renders Regional Trial Court of Antipolo as venue", async () => {
    render(await TermsPage())

    expect(screen.getByText(/Regional Trial Court of Antipolo/)).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Eligibility
  // -----------------------------------------------------------------------

  it("renders eligibility age requirement", async () => {
    render(await TermsPage())

    expect(screen.getByText("2. Eligibility")).toBeTruthy()

    // Should mention 13 years of age
    expect(screen.getByText(/at least 13 years of age/)).toBeTruthy()
    expect(screen.getByText(/between 13 and 18/)).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // AI Features
  // -----------------------------------------------------------------------

  it("renders AI Features section mentioning Gemini", async () => {
    render(await TermsPage())

    expect(screen.getByText("6. AI Features")).toBeTruthy()

    // Should mention Gemini API
    expect(screen.getByText(/Google Gemini API/)).toBeTruthy()

    // Should mention anonymized processing
    expect(screen.getByText(/anonymized, non-personally-identifiable productivity statistics/)).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Contact
  // -----------------------------------------------------------------------

  it("renders dpo@zenberry.app contact email", async () => {
    render(await TermsPage())

    const emailLink = screen.getByText("dpo@zenberry.app")
    expect(emailLink).toBeTruthy()
    expect(emailLink.getAttribute("href")).toBe("mailto:dpo@zenberry.app")
  })

  it("renders Norman Bautista in the Contact section", async () => {
    render(await TermsPage())

    expect(screen.getByText("Norman Bautista")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Intellectual Property section
  // -----------------------------------------------------------------------

  it("renders Intellectual Property section with Norman Bautista", async () => {
    render(await TermsPage())

    expect(screen.getByText("7. Intellectual Property")).toBeTruthy()
    expect(screen.getByText(/owned by Norman Bautista/)).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Server component check
  // -----------------------------------------------------------------------

  it("is a server component (no 'use client' directive)", async () => {
    const mod = await import("@/app/terms/page")
    const src = mod.default.toString()

    expect(src.includes("use client")).toBe(false)
  })
})
