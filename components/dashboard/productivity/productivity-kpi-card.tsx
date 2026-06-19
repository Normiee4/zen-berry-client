import type { ReactNode } from "react"

interface ProductivityKPICardProps {
  label: string
  value: string | number
  icon: ReactNode
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  } | null
}

export function ProductivityKPICard({
  label,
  value,
  icon,
  color = "bg-strawberry-light/30",
  trend,
}: ProductivityKPICardProps) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-3xl p-5 border border-matcha-dark/20 ${color}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-sm font-medium">{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {trend && (
          <span
            className={`text-sm font-semibold ${
              trend.isPositive ? "text-green-600" : "text-red-500"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
    </div>
  )
}
