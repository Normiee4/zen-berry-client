// ---------------------------------------------------------------------------
// Component Tests: ProductivityComparison
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProductivityComparison } from "@/components/dashboard/productivity/productivity-comparison"

describe("ProductivityComparison", () => {
  it("returns null when comparison is null", () => {
    const { container } = render(<ProductivityComparison comparison={null} />)
    expect(container.innerHTML).toBe("")
  })

  it("renders all 3 comparison rows when comparison is provided", () => {
    render(
      <ProductivityComparison
        comparison={{ pomodorosChange: 15, tasksChange: -10, focusChange: 0 }}
      />
    )

    expect(screen.getByText("Pomodoros")).toBeInTheDocument()
    expect(screen.getByText("Tasks")).toBeInTheDocument()
    expect(screen.getByText("Focus Time")).toBeInTheDocument()
  })

  it("renders section heading", () => {
    render(
      <ProductivityComparison
        comparison={{ pomodorosChange: 15, tasksChange: -10, focusChange: 0 }}
      />
    )

    expect(screen.getByText("Week-over-Week Change")).toBeInTheDocument()
  })

  // ---- Positive change ----

  it("shows positive change with + sign and green TrendingUp icon", () => {
    render(
      <ProductivityComparison
        comparison={{ pomodorosChange: 25, tasksChange: 0, focusChange: 0 }}
      />
    )

    expect(screen.getByText("+25%")).toBeInTheDocument()
    const changeElement = screen.getByText("+25%")
    expect(changeElement.className).toContain("text-green-600")
  })

  // ---- Negative change ----

  it("shows negative change with - sign and red TrendingDown icon", () => {
    render(
      <ProductivityComparison
        comparison={{ pomodorosChange: -20, tasksChange: 0, focusChange: 0 }}
      />
    )

    expect(screen.getByText("-20%")).toBeInTheDocument()
    const changeElement = screen.getByText("-20%")
    expect(changeElement.className).toContain("text-red-500")
  })

  // ---- Zero change ----

  it("shows zero change as 0% with Minus icon", () => {
    render(
      <ProductivityComparison
        comparison={{ pomodorosChange: 0, tasksChange: 0, focusChange: 0 }}
      />
    )

    expect(screen.getByText("0%")).toBeInTheDocument()
    const changeElement = screen.getByText("0%")
    expect(changeElement.className).toContain("text-muted-foreground")
  })

  // ---- Mixed values ----

  it("renders different change values for each metric", () => {
    render(
      <ProductivityComparison
        comparison={{ pomodorosChange: 33, tasksChange: -15, focusChange: 5 }}
      />
    )

    expect(screen.getByText("+33%")).toBeInTheDocument()
    expect(screen.getByText("-15%")).toBeInTheDocument()
    expect(screen.getByText("+5%")).toBeInTheDocument()
  })

  // ---- Color coding ----

  it("applies correct color classes to each row", () => {
    const { container } = render(
      <ProductivityComparison
        comparison={{ pomodorosChange: 10, tasksChange: -10, focusChange: 0 }}
      />
    )

    // Find all percentage text elements
    const percentages = container.querySelectorAll(".text-sm.font-semibold")
    expect(percentages).toHaveLength(3)

    // Positive (10) — green
    expect(percentages[0].className).toContain("text-green-600")
    // Negative (-10) — red
    expect(percentages[1].className).toContain("text-red-500")
    // Zero (0) — muted
    expect(percentages[2].className).toContain("text-muted-foreground")
  })
})
