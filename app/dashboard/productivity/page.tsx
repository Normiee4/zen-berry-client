"use client"

import { useProductivity } from "@/hooks/useProductivity"
import { ProductivityKPIGrid } from "@/components/dashboard/productivity/productivity-kpi-grid"
import { ProductivityLifetime } from "@/components/dashboard/productivity/productivity-lifetime"
import { ProductivityPeakHours } from "@/components/dashboard/productivity/productivity-peak-hours"
import { ProductivityConsistency } from "@/components/dashboard/productivity/productivity-consistency"
import { ProductivityComparison } from "@/components/dashboard/productivity/productivity-comparison"
import { AnalyticsChart } from "@/components/dashboard/Analytics-chart"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { BarChart3 } from "lucide-react"

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="h-8 w-48 rounded-full bg-gray-200 animate-pulse" />
        <div className="mt-2 h-4 w-64 rounded-full bg-gray-100 animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-3xl bg-gray-100 animate-pulse" />
        ))}
      </div>
      <div className="h-48 rounded-3xl bg-gray-100 animate-pulse" />
      <div className="grid grid-cols-2 gap-4">
        <div className="h-32 rounded-3xl bg-gray-100 animate-pulse" />
        <div className="h-32 rounded-3xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  )
}

function ErrorFallback({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <BarChart3 className="size-12 text-muted-foreground/50" strokeWidth={1} />
        <h2 className="text-lg font-semibold text-foreground">Unable to load productivity data</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  )
}

export default function ProductivityPage() {
  const { data, isLoading, error } = useProductivity()

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error || !data) {
    return (
      <ErrorFallback
        message={error instanceof Error ? error.message : "Something went wrong"}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-2">
        <div className="flex items-center gap-3">
          <BarChart3 className="size-7 text-matcha" strokeWidth={1.5} />
          <h1 className="text-2xl font-bold text-foreground">Productivity</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground ml-10">
          Your performance at a glance
        </p>
      </div>

      {/* KPI Grid */}
      <ErrorBoundary name="Productivity KPI" fallback={<p className="text-sm text-muted-foreground p-4">KPI cards unavailable</p>}>
        <ProductivityKPIGrid today={data.today} streak={data.streak} />
      </ErrorBoundary>

      {/* Weekly Chart */}
      <ErrorBoundary name="Productivity Chart" fallback={<p className="text-sm text-muted-foreground p-4">Chart unavailable</p>}>
        <div className="rounded-3xl border border-matcha-dark/20 bg-strawberry-light/30 p-6">
          <AnalyticsChart period="week" />
        </div>
      </ErrorBoundary>

      {/* Lifetime + Peak Hours + Consistency + Comparison */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ErrorBoundary name="Productivity Lifetime" fallback={<p className="text-sm text-muted-foreground p-4">Lifetime stats unavailable</p>}>
          <ProductivityLifetime lifetime={data.lifetime} />
        </ErrorBoundary>

        <ErrorBoundary name="Productivity Peak Hours" fallback={<p className="text-sm text-muted-foreground p-4">Peak hours unavailable</p>}>
          <ProductivityPeakHours peakHours={data.peakHours} />
        </ErrorBoundary>

        <ErrorBoundary name="Productivity Consistency" fallback={<p className="text-sm text-muted-foreground p-4">Consistency unavailable</p>}>
          <ProductivityConsistency consistency={data.consistency} />
        </ErrorBoundary>

        <ErrorBoundary name="Productivity Comparison" fallback={<p className="text-sm text-muted-foreground p-4">Comparison unavailable</p>}>
          <ProductivityComparison comparison={data.comparison} />
        </ErrorBoundary>
      </div>
    </div>
  )
}
