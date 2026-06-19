// ---------------------------------------------------------------------------
// Component Tests: ProductivityPage (app/dashboard/productivity/page.tsx)
// ---------------------------------------------------------------------------
// Tests the page component in loading, error, and data states.
// Mocks the useProductivity hook and child components to isolate page logic.
// ---------------------------------------------------------------------------

import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import type { ProductivityResponse } from "@/hooks/useProductivity"

// ---- Mocks ----

// Mock the hook before importing the page
const mockUseProductivity = vi.fn()
vi.mock("@/hooks/useProductivity", () => ({
  useProductivity: mockUseProductivity,
}))

// Mock child components to simplify test assertions
vi.mock("@/components/dashboard/productivity/productivity-kpi-grid", () => ({
  ProductivityKPIGrid: ({ today, streak }: { today: any; streak: number }) => (
    <div data-testid="kpi-grid">
      KPI Grid: {today.pomodorosCompleted} pomodoros, streak {streak}
    </div>
  ),
}))

vi.mock("@/components/dashboard/productivity/productivity-lifetime", () => ({
  ProductivityLifetime: ({ lifetime }: { lifetime: any }) => (
    <div data-testid="lifetime">Lifetime: {lifetime.totalTasks} tasks</div>
  ),
}))

vi.mock("@/components/dashboard/productivity/productivity-peak-hours", () => ({
  ProductivityPeakHours: ({ peakHours }: { peakHours: any }) => (
    <div data-testid="peak-hours">{peakHours ? "Peak: data" : "Peak: null"}</div>
  ),
}))

vi.mock("@/components/dashboard/productivity/productivity-consistency", () => ({
  ProductivityConsistency: ({ consistency }: { consistency: any }) => (
    <div data-testid="consistency">Consistency: {consistency.rate}%</div>
  ),
}))

vi.mock("@/components/dashboard/productivity/productivity-comparison", () => ({
  ProductivityComparison: ({ comparison }: { comparison: any }) => (
    <div data-testid="comparison">
      {comparison ? `Comparison: ${comparison.pomodorosChange}%` : "Comparison: null"}
    </div>
  ),
}))

vi.mock("@/components/dashboard/Analytics-chart", () => ({
  AnalyticsChart: ({ period }: { period: string }) => (
    <div data-testid="analytics-chart">Chart: {period}</div>
  ),
}))

vi.mock("@/components/ErrorBoundary", () => ({
  ErrorBoundary: ({ children, name, fallback }: { children: any; name: string; fallback?: any }) => (
    <div data-testid={`error-boundary-${name}`}>{children}</div>
  ),
}))

// ---- Module under test ----
import ProductivityPage from "@/app/dashboard/productivity/page"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockData: ProductivityResponse = {
  today: {
    pomodorosCompleted: 8,
    tasksCompleted: 5,
    mitsCompleted: 2,
    focusMinutes: 120,
    breakCount: 3,
  },
  streak: 3,
  lifetime: {
    totalTasks: 150,
    totalPomodoros: 300,
    totalFocusMinutes: 7500,
    totalSessions: 200,
  },
  weeklyHistory: [
    { date: "2026-06-13", day: "Sat", pomodoros: 5, tasks: 3, focusMinutes: 50 },
    { date: "2026-06-14", day: "Sun", pomodoros: 7, tasks: 4, focusMinutes: 50 },
    { date: "2026-06-15", day: "Mon", pomodoros: 0, tasks: 0, focusMinutes: 0 },
    { date: "2026-06-16", day: "Tue", pomodoros: 0, tasks: 0, focusMinutes: 0 },
    { date: "2026-06-17", day: "Wed", pomodoros: 0, tasks: 0, focusMinutes: 0 },
    { date: "2026-06-18", day: "Thu", pomodoros: 0, tasks: 0, focusMinutes: 0 },
    { date: "2026-06-19", day: "Fri", pomodoros: 0, tasks: 0, focusMinutes: 0 },
  ],
  weeklyTotals: { pomodoros: 12, tasks: 7, focusMinutes: 100 },
  peakHours: { start: 10, end: 12, avgPomodoros: 2.5 },
  consistency: { activeDays: 5, totalDays: 7, rate: 71 },
  comparison: { pomodorosChange: 33, tasksChange: 25, focusChange: 33 },
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ProductivityPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---- Loading state ----

  it("shows loading skeleton when isLoading is true", () => {
    mockUseProductivity.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    const { container } = render(<ProductivityPage />)

    // Loading skeleton has animate-pulse elements
    const skeletonElements = container.querySelectorAll(".animate-pulse")
    expect(skeletonElements.length).toBeGreaterThan(0)

    // Should NOT render any data sections
    expect(screen.queryByTestId("kpi-grid")).not.toBeInTheDocument()
    expect(screen.queryByTestId("lifetime")).not.toBeInTheDocument()
  })

  it("does not show error message while loading", () => {
    mockUseProductivity.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.queryByText("Unable to load productivity data")).not.toBeInTheDocument()
  })

  // ---- Error state ----

  it("shows error fallback when error is present", () => {
    mockUseProductivity.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch"),
    })

    render(<ProductivityPage />)

    expect(screen.getByText("Unable to load productivity data")).toBeInTheDocument()
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument()
  })

  it("shows generic error message when error is not an Error instance", () => {
    mockUseProductivity.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: "Something broke",
    })

    render(<ProductivityPage />)

    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
  })

  it("shows error fallback when data is null despite no error", () => {
    mockUseProductivity.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByText("Unable to load productivity data")).toBeInTheDocument()
  })

  it("does not render any sections when in error state", () => {
    mockUseProductivity.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed"),
    })

    render(<ProductivityPage />)

    expect(screen.queryByTestId("kpi-grid")).not.toBeInTheDocument()
    expect(screen.queryByTestId("lifetime")).not.toBeInTheDocument()
  })

  // ---- Data state ----

  it("renders page header with title and subtitle when data is loaded", () => {
    mockUseProductivity.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByText("Productivity")).toBeInTheDocument()
    expect(screen.getByText("Your performance at a glance")).toBeInTheDocument()
  })

  it("renders KPI grid with correct data", () => {
    mockUseProductivity.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("kpi-grid")).toBeInTheDocument()
    expect(screen.getByText("KPI Grid: 8 pomodoros, streak 3")).toBeInTheDocument()
  })

  it("renders AnalyticsChart with period='week'", () => {
    mockUseProductivity.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("analytics-chart")).toBeInTheDocument()
    expect(screen.getByText("Chart: week")).toBeInTheDocument()
  })

  it("renders lifetime section", () => {
    mockUseProductivity.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("lifetime")).toBeInTheDocument()
    expect(screen.getByText("Lifetime: 150 tasks")).toBeInTheDocument()
  })

  it("renders peak hours section with data", () => {
    mockUseProductivity.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("peak-hours")).toBeInTheDocument()
    expect(screen.getByText("Peak: data")).toBeInTheDocument()
  })

  it("renders peak hours section with null data", () => {
    const dataWithoutPeakHours = {
      ...mockData,
      peakHours: null,
    }

    mockUseProductivity.mockReturnValue({
      data: dataWithoutPeakHours,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("peak-hours")).toBeInTheDocument()
    expect(screen.getByText("Peak: null")).toBeInTheDocument()
  })

  it("renders consistency section", () => {
    mockUseProductivity.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("consistency")).toBeInTheDocument()
    expect(screen.getByText("Consistency: 71%")).toBeInTheDocument()
  })

  it("renders comparison section with data", () => {
    mockUseProductivity.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("comparison")).toBeInTheDocument()
    expect(screen.getByText("Comparison: 33%")).toBeInTheDocument()
  })

  it("renders comparison section with null data", () => {
    const dataWithoutComparison = {
      ...mockData,
      comparison: null,
    }

    mockUseProductivity.mockReturnValue({
      data: dataWithoutComparison,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("comparison")).toBeInTheDocument()
    expect(screen.getByText("Comparison: null")).toBeInTheDocument()
  })

  it("renders all sections wrapped in ErrorBoundary components", () => {
    mockUseProductivity.mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    expect(screen.getByTestId("error-boundary-Productivity KPI")).toBeInTheDocument()
    expect(screen.getByTestId("error-boundary-Productivity Chart")).toBeInTheDocument()
    expect(screen.getByTestId("error-boundary-Productivity Lifetime")).toBeInTheDocument()
    expect(screen.getByTestId("error-boundary-Productivity Peak Hours")).toBeInTheDocument()
    expect(screen.getByTestId("error-boundary-Productivity Consistency")).toBeInTheDocument()
    expect(screen.getByTestId("error-boundary-Productivity Comparison")).toBeInTheDocument()
  })

  // ---- Edge cases ----

  it("handles data with all zero metrics gracefully", () => {
    const zeroData: ProductivityResponse = {
      today: {
        pomodorosCompleted: 0,
        tasksCompleted: 0,
        mitsCompleted: 0,
        focusMinutes: 0,
        breakCount: 0,
      },
      streak: 0,
      lifetime: {
        totalTasks: 0,
        totalPomodoros: 0,
        totalFocusMinutes: 0,
        totalSessions: 0,
      },
      weeklyHistory: [
        { date: "2026-06-13", day: "Sat", pomodoros: 0, tasks: 0, focusMinutes: 0 },
        { date: "2026-06-14", day: "Sun", pomodoros: 0, tasks: 0, focusMinutes: 0 },
        { date: "2026-06-15", day: "Mon", pomodoros: 0, tasks: 0, focusMinutes: 0 },
        { date: "2026-06-16", day: "Tue", pomodoros: 0, tasks: 0, focusMinutes: 0 },
        { date: "2026-06-17", day: "Wed", pomodoros: 0, tasks: 0, focusMinutes: 0 },
        { date: "2026-06-18", day: "Thu", pomodoros: 0, tasks: 0, focusMinutes: 0 },
        { date: "2026-06-19", day: "Fri", pomodoros: 0, tasks: 0, focusMinutes: 0 },
      ],
      weeklyTotals: { pomodoros: 0, tasks: 0, focusMinutes: 0 },
      peakHours: null,
      consistency: { activeDays: 0, totalDays: 7, rate: 0 },
      comparison: null,
    }

    mockUseProductivity.mockReturnValue({
      data: zeroData,
      isLoading: false,
      error: null,
    })

    render(<ProductivityPage />)

    // Page should still render all sections with zero data
    expect(screen.getByText("Productivity")).toBeInTheDocument()
    expect(screen.getByTestId("kpi-grid")).toBeInTheDocument()
    expect(screen.getByTestId("lifetime")).toBeInTheDocument()
    expect(screen.getByTestId("peak-hours")).toBeInTheDocument()
    expect(screen.getByTestId("consistency")).toBeInTheDocument()
    expect(screen.getByTestId("comparison")).toBeInTheDocument()
  })
})
