// ---------------------------------------------------------------------------
// Component Tests: ProductivityConsistency
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProductivityConsistency } from "@/components/dashboard/productivity/productivity-consistency"

describe("ProductivityConsistency", () => {
  it("renders rate percentage", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 5, totalDays: 7, rate: 71 }} />)
    expect(screen.getByText("71%")).toBeInTheDocument()
  })

  it("renders 'X of Y days' text", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 5, totalDays: 7, rate: 71 }} />)
    expect(screen.getByText("(5 of 7 days)")).toBeInTheDocument()
  })

  it("renders section heading", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 3, totalDays: 7, rate: 43 }} />)
    expect(screen.getByText("Consistency Rate")).toBeInTheDocument()
  })

  // ---- Color coding: Green (>= 80) ----

  it("uses green color for rate >= 80", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 7, totalDays: 7, rate: 100 }} />)

    const percentageElement = screen.getByText("100%")
    expect(percentageElement.className).toContain("text-green-600")
  })

  it("shows 'Excellent consistency' message for rate >= 80", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 6, totalDays: 7, rate: 86 }} />)
    expect(screen.getByText("Excellent consistency! Keep it up!")).toBeInTheDocument()
  })

  // ---- Color coding: Yellow (>= 50 and < 80) ----

  it("uses yellow color for rate >= 50 and < 80", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 4, totalDays: 7, rate: 57 }} />)

    const percentageElement = screen.getByText("57%")
    expect(percentageElement.className).toContain("text-yellow-500")
  })

  it("shows 'Good progress' message for rate >= 50", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 4, totalDays: 7, rate: 57 }} />)
    expect(screen.getByText("Good progress, try to be more consistent.")).toBeInTheDocument()
  })

  // ---- Color coding: Red (< 50) ----

  it("uses red color for rate < 50", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 2, totalDays: 7, rate: 29 }} />)

    const percentageElement = screen.getByText("29%")
    expect(percentageElement.className).toContain("text-red-500")
  })

  it("shows 'Keep showing up' message for rate < 50", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 2, totalDays: 7, rate: 29 }} />)
    expect(screen.getByText("Keep showing up — every day counts!")).toBeInTheDocument()
  })

  // ---- Boundary: Rate exactly at thresholds ----

  it("treats rate of 80 as green", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 6, totalDays: 7, rate: 80 }} />)

    const percentageElement = screen.getByText("80%")
    expect(percentageElement.className).toContain("text-green-600")
    expect(screen.getByText("Excellent consistency! Keep it up!")).toBeInTheDocument()
  })

  it("treats rate of 50 as yellow", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 4, totalDays: 7, rate: 50 }} />)

    const percentageElement = screen.getByText("50%")
    expect(percentageElement.className).toContain("text-yellow-500")
    expect(screen.getByText("Good progress, try to be more consistent.")).toBeInTheDocument()
  })

  it("treats rate of 49 as red", () => {
    render(<ProductivityConsistency consistency={{ activeDays: 3, totalDays: 7, rate: 49 }} />)

    const percentageElement = screen.getByText("49%")
    expect(percentageElement.className).toContain("text-red-500")
    expect(screen.getByText("Keep showing up — every day counts!")).toBeInTheDocument()
  })

  // ---- Progress bar ----

  it("renders progress bar with width matching rate", () => {
    const { container } = render(
      <ProductivityConsistency consistency={{ activeDays: 3, totalDays: 7, rate: 43 }} />
    )

    const bar = container.querySelector(".h-full.rounded-full")
    expect(bar).toBeInTheDocument()
    expect((bar as HTMLElement).style.width).toBe("43%")
  })

  it("caps progress bar at 100%", () => {
    const { container } = render(
      <ProductivityConsistency consistency={{ activeDays: 7, totalDays: 7, rate: 100 }} />
    )

    const bar = container.querySelector(".h-full.rounded-full")
    expect((bar as HTMLElement).style.width).toBe("100%")
  })
})
