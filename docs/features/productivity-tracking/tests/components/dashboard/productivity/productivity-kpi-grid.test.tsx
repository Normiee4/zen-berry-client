// ---------------------------------------------------------------------------
// Component Tests: ProductivityKPIGrid
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProductivityKPIGrid } from "@/components/dashboard/productivity/productivity-kpi-grid"

describe("ProductivityKPIGrid", () => {
  const defaultToday = {
    pomodorosCompleted: 8,
    tasksCompleted: 5,
    focusMinutes: 120,
    breakCount: 3,
  }

  it("renders all 4 KPI cards with correct labels", () => {
    render(<ProductivityKPIGrid today={defaultToday} streak={4} />)

    expect(screen.getByText("Pomodoros Today")).toBeInTheDocument()
    expect(screen.getByText("Tasks Done")).toBeInTheDocument()
    expect(screen.getByText("Focus Minutes")).toBeInTheDocument()
    expect(screen.getByText("Current Streak")).toBeInTheDocument()
  })

  it("passes correct values to each card", () => {
    render(<ProductivityKPIGrid today={defaultToday} streak={4} />)

    expect(screen.getByText("8")).toBeInTheDocument() // pomodoros
    expect(screen.getByText("5")).toBeInTheDocument() // tasks
    expect(screen.getByText("120")).toBeInTheDocument() // focus minutes
    expect(screen.getByText("4")).toBeInTheDocument() // streak
  })

  it("handles zero values for all metrics", () => {
    const zeroToday = {
      pomodorosCompleted: 0,
      tasksCompleted: 0,
      focusMinutes: 0,
      breakCount: 0,
    }

    render(<ProductivityKPIGrid today={zeroToday} streak={0} />)

    // There should be four "0"s
    const zeroElements = screen.getAllByText("0")
    expect(zeroElements).toHaveLength(4)
  })

  it("renders in a grid layout with 2 columns", () => {
    const { container } = render(<ProductivityKPIGrid today={defaultToday} streak={4} />)

    const gridDiv = container.firstChild as HTMLElement
    expect(gridDiv.className).toContain("grid-cols-2")
  })

  it("handles large streak values", () => {
    render(<ProductivityKPIGrid today={defaultToday} streak={365} />)
    expect(screen.getByText("365")).toBeInTheDocument()
  })
})
