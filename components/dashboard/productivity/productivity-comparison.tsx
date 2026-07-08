import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ComparisonData {
  pomodorosChange: number
  tasksChange: number
  focusChange: number
}

interface ProductivityComparisonProps {
  comparison: ComparisonData | null
}

function ComparisonRow({
  label,
  change,
}: {
  label: string
  change: number
}) {
  const isPositive = change > 0
  const isNeutral = change === 0

  return (
    <div className="flex items-center justify-between rounded-xl bg-card/60 px-4 py-3">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-1.5">
        {isNeutral ? (
          <Minus className="size-4 text-muted-foreground" strokeWidth={1.5} />
        ) : isPositive ? (
          <TrendingUp className="size-4 text-green-600" strokeWidth={1.5} />
        ) : (
          <TrendingDown className="size-4 text-red-500" strokeWidth={1.5} />
        )}
        <span
          className={`text-sm font-semibold ${
            isNeutral
              ? "text-muted-foreground"
              : isPositive
                ? "text-green-600"
                : "text-red-500"
          }`}
        >
          {isNeutral ? "0%" : `${isPositive ? "+" : ""}${change}%`}
        </span>
      </div>
    </div>
  )
}

export function ProductivityComparison({ comparison }: ProductivityComparisonProps) {
  if (!comparison) {
    return null
  }

  return (
    <div className="rounded-3xl border border-matcha-dark/20 bg-strawberry-light/30 p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Week-over-Week Change
      </h3>
      <div className="flex flex-col gap-2">
        <ComparisonRow label="Pomodoros" change={comparison.pomodorosChange} />
        <ComparisonRow label="Tasks" change={comparison.tasksChange} />
        <ComparisonRow label="Focus Time" change={comparison.focusChange} />
      </div>
    </div>
  )
}
