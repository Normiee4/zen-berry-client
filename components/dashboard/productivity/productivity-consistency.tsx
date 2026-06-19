interface ConsistencyData {
  activeDays: number
  totalDays: number
  rate: number
}

interface ProductivityConsistencyProps {
  consistency: ConsistencyData
}

export function ProductivityConsistency({ consistency }: ProductivityConsistencyProps) {
  const getColor = (rate: number): string => {
    if (rate >= 80) return "text-green-600"
    if (rate >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const getBarColor = (rate: number): string => {
    if (rate >= 80) return "bg-green-500"
    if (rate >= 50) return "bg-yellow-500"
    return "bg-red-500"
  }

  const colorClass = getColor(consistency.rate)
  const barColorClass = getBarColor(consistency.rate)

  return (
    <div className="rounded-3xl border border-matcha-dark/20 bg-strawberry-light/30 p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Consistency Rate</h3>
      <div className="rounded-xl bg-white/60 p-4">
        <div className="mb-3 flex items-baseline gap-2">
          <span className={`text-4xl font-bold ${colorClass}`}>
            {consistency.rate}%
          </span>
          <span className="text-sm text-muted-foreground">
            ({consistency.activeDays} of {consistency.totalDays} days)
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2.5 w-full rounded-full bg-gray-200">
          <div
            className={`h-full rounded-full ${barColorClass} transition-all duration-500`}
            style={{ width: `${Math.min(consistency.rate, 100)}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          {consistency.rate >= 80
            ? "Excellent consistency! Keep it up!"
            : consistency.rate >= 50
              ? "Good progress, try to be more consistent."
              : "Keep showing up — every day counts!"}
        </p>
      </div>
    </div>
  )
}
