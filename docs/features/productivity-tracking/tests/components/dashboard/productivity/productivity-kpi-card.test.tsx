// ---------------------------------------------------------------------------
// Component Tests: ProductivityKPICard
// ---------------------------------------------------------------------------

import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProductivityKPICard } from "@/components/dashboard/productivity/productivity-kpi-card"
import { Timer } from "lucide-react"

describe("ProductivityKPICard", () => {
  it("renders label and value", () => {
    render(
      <ProductivityKPICard
        label="Pomodoros Today"
        value={5}
        icon={<Timer data-testid="icon" />}
      />
    )

    expect(screen.getByText("Pomodoros Today")).toBeInTheDocument()
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("renders icon element", () => {
    render(
      <ProductivityKPICard
        label="Test"
        value={0}
        icon={<Timer data-testid="icon" />}
      />
    )

    expect(screen.getByTestId("icon")).toBeInTheDocument()
  })

  it("applies custom color class when provided", () => {
    const { container } = render(
      <ProductivityKPICard
        label="Test"
        value={10}
        icon={<Timer />}
        color="bg-blue-200"
      />
    )

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain("bg-blue-200")
  })

  it("uses default color when no color prop is given", () => {
    const { container } = render(
      <ProductivityKPICard
        label="Test"
        value={10}
        icon={<Timer />}
      />
    )

    const card = container.firstChild as HTMLElement
    expect(card.className).toContain("bg-strawberry-light/30")
  })

  it("renders trend indicator for positive trend", () => {
    render(
      <ProductivityKPICard
        label="Test"
        value={10}
        icon={<Timer />}
        trend={{ value: 15, isPositive: true }}
      />
    )

    expect(screen.getByText("↑ 15%")).toBeInTheDocument()
    const trendSpan = screen.getByText("↑ 15%")
    expect(trendSpan.className).toContain("text-green-600")
  })

  it("renders trend indicator for negative trend", () => {
    render(
      <ProductivityKPICard
        label="Test"
        value={10}
        icon={<Timer />}
        trend={{ value: 20, isPositive: false }}
      />
    )

    expect(screen.getByText("↓ 20%")).toBeInTheDocument()
    const trendSpan = screen.getByText("↓ 20%")
    expect(trendSpan.className).toContain("text-red-500")
  })

  it("does not render trend section when trend is null", () => {
    render(
      <ProductivityKPICard
        label="Test"
        value={10}
        icon={<Timer />}
        trend={null}
      />
    )

    expect(screen.queryByText("↑")).not.toBeInTheDocument()
    expect(screen.queryByText("↓")).not.toBeInTheDocument()
  })

  it("does not render trend section when trend is undefined", () => {
    render(
      <ProductivityKPICard
        label="Test"
        value={10}
        icon={<Timer />}
      />
    )

    expect(screen.queryByText("↑")).not.toBeInTheDocument()
    expect(screen.queryByText("↓")).not.toBeInTheDocument()
  })

  it("handles string values correctly", () => {
    render(
      <ProductivityKPICard
        label="Focus Hours"
        value="2h 30m"
        icon={<Timer />}
      />
    )

    expect(screen.getByText("2h 30m")).toBeInTheDocument()
  })

  it("handles zero value", () => {
    render(
      <ProductivityKPICard
        label="Break Count"
        value={0}
        icon={<Timer />}
      />
    )

    expect(screen.getByText("0")).toBeInTheDocument()
  })
})
