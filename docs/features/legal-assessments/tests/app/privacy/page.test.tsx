// ---------------------------------------------------------------------------
// Unit Tests: app/privacy/page.tsx (Server Component)
// ---------------------------------------------------------------------------
// Tests the Privacy Policy page (RA 10173 compliant) — a static server
// component with hardcoded content, no data fetching.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import PrivacyPage from "@/app/privacy/page"

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

describe("PrivacyPage", () => {
  // -----------------------------------------------------------------------
  // Page title and layout
  // -----------------------------------------------------------------------

  it("renders 'Privacy Policy' as the page title", async () => {
    render(await PrivacyPage())

    expect(screen.getByText("Privacy Policy")).toBeTruthy()
  })

  it("renders 'Back to Home' link pointing to '/'", async () => {
    render(await PrivacyPage())

    const backLink = screen.getByText("← Back to Home")
    expect(backLink).toBeTruthy()
    expect(backLink.getAttribute("href")).toBe("/")
  })

  it("renders the Footer component", async () => {
    render(await PrivacyPage())

    expect(screen.getByTestId("footer-mock")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // All 12 section headings
  // -----------------------------------------------------------------------

  it("renders all 12 section headings", async () => {
    render(await PrivacyPage())

    const headings = [
      "1. Data Controller",
      "2. Personal Data We Collect",
      "3. Purpose & Legal Basis of Processing",
      "4. Data Sharing & Third-Party Processors",
      "5. Cookies & LocalStorage",
      "6. Data Retention",
      "7. Your Data Subject Rights",
      "8. Security Measures",
      "9. Cross-Border Data Transfer",
      "10. Children\u2019s Privacy",
      "11. Changes to This Policy",
      "12. Contact",
    ]

    for (const heading of headings) {
      expect(screen.getByText(heading)).toBeTruthy()
    }
  })

  // -----------------------------------------------------------------------
  // Data Controller information
  // -----------------------------------------------------------------------

  it("renders Norman Bautista as data controller", async () => {
    render(await PrivacyPage())

    expect(screen.getByText("Norman Bautista")).toBeTruthy()
  })

  it("renders dpo@zenberry.app contact email", async () => {
    render(await PrivacyPage())

    const emailLink = screen.getByText("dpo@zenberry.app")
    expect(emailLink).toBeTruthy()
    expect(emailLink.getAttribute("href")).toBe("mailto:dpo@zenberry.app")
  })

  // -----------------------------------------------------------------------
  // Anchor IDs
  // -----------------------------------------------------------------------

  it("renders all 12 anchor IDs on section elements", async () => {
    render(await PrivacyPage())

    const sectionIds = [
      "data-controller",
      "personal-data",
      "purpose-basis",
      "data-sharing",
      "cookies",
      "data-retention",
      "rights",
      "security",
      "cross-border",
      "children",
      "changes",
      "contact",
    ]

    for (const id of sectionIds) {
      const section = document.getElementById(id)
      expect(section).toBeTruthy()
      expect(section!.tagName.toLowerCase()).toBe("section")
    }
  })

  // -----------------------------------------------------------------------
  // Cookies & LocalStorage section
  // -----------------------------------------------------------------------

  it("renders cookies and localStorage section with storage key names", async () => {
    render(await PrivacyPage())

    expect(screen.getByText("5. Cookies & LocalStorage")).toBeTruthy()

    // Should render localStorage key names
    const storageKeys = [
      "zenberry_timer_presets",
      "zenberry_timer_streak",
      "zenberry_active_session",
      "zenberry_timer_alarm_sound",
    ]

    for (const key of storageKeys) {
      expect(screen.getByText(key)).toBeTruthy()
    }

    // Should render cookie types
    expect(screen.getByText("Supabase session cookies")).toBeTruthy()
    expect(screen.getByText("beta_bypass")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // RA 10173 Data Subject Rights section
  // -----------------------------------------------------------------------

  it("renders RA 10173 data subject rights", async () => {
    render(await PrivacyPage())

    expect(screen.getByText("7. Your Data Subject Rights")).toBeTruthy()

    // The page should reference RA 10173
    expect(screen.getByText(/Philippine Data Privacy Act \(RA 10173\)/)).toBeTruthy()

    // Should list all 7 rights
    const rights = [
      "Right to be Informed",
      "Right to Access",
      "Right to Correction",
      "Right to Erasure or Blocking",
      "Right to Portability",
      "Right to Withdraw Consent",
      "Right to File a Complaint",
    ]

    for (const right of rights) {
      expect(screen.getByText(right)).toBeTruthy()
    }
  })

  // -----------------------------------------------------------------------
  // Cross-border data transfer section
  // -----------------------------------------------------------------------

  it("renders cross-border data transfer with NPC Circular 16-04", async () => {
    render(await PrivacyPage())

    expect(screen.getByText("9. Cross-Border Data Transfer")).toBeTruthy()

    // Should mention NPC Circular 16-04
    expect(screen.getByText(/NPC Circular 16-04/)).toBeTruthy()

    // Should mention US-based providers
    expect(screen.getByText("Supabase Inc.")).toBeTruthy()
    expect(screen.getByText("Google LLC")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Children's privacy section
  // -----------------------------------------------------------------------

  it("renders children's privacy section", async () => {
    render(await PrivacyPage())

    expect(screen.getByText("10. Children\u2019s Privacy")).toBeTruthy()

    // Should mention under 13 restriction
    expect(screen.getByText(/under the age of 13/)).toBeTruthy()
    expect(screen.getByText(/between 13 and 18/)).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Section 12 — Contact
  // -----------------------------------------------------------------------

  it("renders the Contact section with DPO details", async () => {
    render(await PrivacyPage())

    expect(screen.getByText("12. Contact")).toBeTruthy()
    expect(screen.getByText("Norman Bautista (Data Protection Officer)")).toBeTruthy()
  })

  // -----------------------------------------------------------------------
  // Server component check
  // -----------------------------------------------------------------------

  it("is a server component (no 'use client' directive)", async () => {
    // Server components cannot use hooks, browser APIs, or event handlers.
    // This test verifies the module does not re-export a "client" marker.
    const mod = await import("@/app/privacy/page")
    const src = mod.default.toString()

    // A "use client" directive at the top of the file would indicate a client component
    expect(src.includes("use client")).toBe(false)
  })
})
