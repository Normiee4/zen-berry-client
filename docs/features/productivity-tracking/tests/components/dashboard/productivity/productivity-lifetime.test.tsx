// ---------------------------------------------------------------------------
// Component Tests: ProductivityLifetime
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProductivityLifetime } from "@/components/dashboard/productivity/productivity-lifetime"

describe("ProductivityLifetime", () => {
  const defaultLifetime = {
    totalTasks: 150,
    totalPomodoros: 300,
    totalFocusMinutes: 7500,
    totalSessions: 200,
  }

  it("renders all 4 lifetime stat items with labels", () => {
    render(<ProductivityLifetime lifetime={defaultLifetime} />)

    expect(screen.getByText("Total Tasks")).toBeInTheDocument()
    expect(screen.getByText("Total Pomodoros")).toBeInTheDocument()
    expect(screen.getByText("Focus Hours")).toBeInTheDocument()
    expect(screen.getByText("Sessions")).toBeInTheDocument()
  })

  it("renders correct values", () => {
    render(<ProductivityLifetime lifetime={defaultLifetime} />)

    expect(screen.getByText("150")).toBeInTheDocument() // total tasks
    expect(screen.getByText("300")).toBeInTheDocument() // total pomodoros
    expect(screen.getByText("200")).toBeInTheDocument() // sessions
  })

  it("formats focus hours as Xh Ym", () => {
    render(<ProductivityLifetime lifetime={defaultLifetime} />)
    // 7500 minutes = 125 hours
    expect(screen.getByText("125h 0m")).toBeInTheDocument()
  })

  it("formats focus hours with remainder minutes", () => {
    render(
      <ProductivityLifetime
        lifetime={{
          totalTasks: 0,
          totalPomodoros: 0,
          totalFocusMinutes: 150,
          totalSessions: 0,
        }}
      />
    )
    expect(screen.getByText("2h 30m")).toBeInTheDocument()
  })

  it("handles zero values", () => {
    const zeroLifetime = {
      totalTasks: 0,
      totalPomodoros: 0,
      totalFocusMinutes: 0,
      totalSessions: 0,
    }

    render(<ProductivityLifetime lifetime={zeroLifetime} />)

    expect(screen.getByText("0")).toBeInTheDocument() // tasks
    expect(screen.getByText("0")).toBeInTheDocument() // pomodoros
    expect(screen.getByText("0")).toBeInTheDocument() // sessions
    expect(screen.getByText("0h 0m")).toBeInTheDocument() // focus hours
  })

  it("displays section heading", () => {
    render(<ProductivityLifetime lifetime={defaultLifetime} />)
    expect(screen.getByText("Lifetime Totals")).toBeInTheDocument()
  })

  it("renders with 2-column grid", () => {
    const { container } = render(<ProductivityLifetime lifetime={defaultLifetime} />)

    const gridDiv = container.querySelector(".grid")
    expect(gridDiv?.className).toContain("grid-cols-2")
  })

  it("handles large focus minutes correctly", () => {
    render(
      <ProductivityLifetime
        lifetime={{
          totalTasks: 0,
          totalPomodoros: 0,
          totalFocusMinutes: 10080, // 168 hours = 7 days
          totalSessions: 0,
        }}
      />
    )
    expect(screen.getByText("168h 0m")).toBeInTheDocument()
  })
})
