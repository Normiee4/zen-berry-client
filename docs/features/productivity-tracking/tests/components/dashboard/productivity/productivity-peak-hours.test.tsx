// ---------------------------------------------------------------------------
// Component Tests: ProductivityPeakHours
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProductivityPeakHours } from "@/components/dashboard/productivity/productivity-peak-hours"

describe("ProductivityPeakHours", () => {
  it("renders time range when peakHours is provided", () => {
    render(
      <ProductivityPeakHours
        peakHours={{ start: 10, end: 12, avgPomodoros: 2.5 }}
      />
    )

    expect(screen.getByText("10 AM – 12 PM")).toBeInTheDocument()
    expect(screen.getByText("~2.5 pomodoros avg")).toBeInTheDocument()
  })

  it("renders 'No data yet' when peakHours is null", () => {
    render(<ProductivityPeakHours peakHours={null} />)

    expect(screen.getByText("No data yet")).toBeInTheDocument()
  })

  it("renders section heading", () => {
    render(
      <ProductivityPeakHours
        peakHours={{ start: 14, end: 16, avgPomodoros: 3 }}
      />
    )

    expect(screen.getByText("Peak Productivity Hours")).toBeInTheDocument()
  })

  it("renders heading even when null", () => {
    render(<ProductivityPeakHours peakHours={null} />)

    expect(screen.getByText("Peak Productivity Hours")).toBeInTheDocument()
  })

  it("renders timeline bar when data exists", () => {
    const { container } = render(
      <ProductivityPeakHours
        peakHours={{ start: 9, end: 11, avgPomodoros: 1.5 }}
      />
    )

    // Timeline labels
    expect(screen.getByText("00:00")).toBeInTheDocument()
    expect(screen.getByText("12:00")).toBeInTheDocument()
    expect(screen.getByText("23:00")).toBeInTheDocument()

    // The bar element should exist
    const bar = container.querySelector(".rounded-full.bg-matcha")
    expect(bar).toBeInTheDocument()
  })

  it("does not render timeline bar when null", () => {
    const { container } = render(<ProductivityPeakHours peakHours={null} />)

    const bar = container.querySelector(".rounded-full.bg-matcha")
    expect(bar).not.toBeInTheDocument()
  })
})

describe("formatHour (internal helper)", () => {
  // We test the behavior indirectly through rendered output

  it("formats midnight as 12 AM", () => {
    render(<ProductivityPeakHours peakHours={{ start: 0, end: 2, avgPomodoros: 1 }} />)
    expect(screen.getByText("12 AM – 2 AM")).toBeInTheDocument()
  })

  it("formats noon as 12 PM", () => {
    render(<ProductivityPeakHours peakHours={{ start: 12, end: 14, avgPomodoros: 1 }} />)
    expect(screen.getByText("12 PM – 2 PM")).toBeInTheDocument()
  })

  it("formats morning hours correctly", () => {
    render(<ProductivityPeakHours peakHours={{ start: 9, end: 11, avgPomodoros: 1 }} />)
    expect(screen.getByText("9 AM – 11 AM")).toBeInTheDocument()
  })

  it("formats afternoon/evening hours correctly", () => {
    render(<ProductivityPeakHours peakHours={{ start: 15, end: 17, avgPomodoros: 1 }} />)
    expect(screen.getByText("3 PM – 5 PM")).toBeInTheDocument()
  })

  it("formats late night correctly", () => {
    render(<ProductivityPeakHours peakHours={{ start: 23, end: 24, avgPomodoros: 1 }} />)
    expect(screen.getByText("11 PM – 12 AM")).toBeInTheDocument()
  })
})
