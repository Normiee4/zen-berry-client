import { CheckCircle2, Timer, Clock, Activity } from "lucide-react"

interface LifetimeStats {
  totalTasks: number
  totalPomodoros: number
  totalFocusMinutes: number
  totalSessions: number
}

interface ProductivityLifetimeProps {
  lifetime: LifetimeStats
}

export function ProductivityLifetime({ lifetime }: ProductivityLifetimeProps) {
  const focusHours = Math.floor(lifetime.totalFocusMinutes / 60)
  const focusRemainderMinutes = lifetime.totalFocusMinutes % 60

  const stats = [
    {
      label: "Total Tasks",
      value: lifetime.totalTasks,
      icon: <CheckCircle2 className="size-5 text-matcha" strokeWidth={1.5} />,
    },
    {
      label: "Total Pomodoros",
      value: lifetime.totalPomodoros,
      icon: <Timer className="size-5 text-strawberry" strokeWidth={1.5} />,
    },
    {
      label: "Focus Hours",
      value: `${focusHours}h ${focusRemainderMinutes}m`,
      icon: <Clock className="size-5 text-matcha" strokeWidth={1.5} />,
    },
    {
      label: "Sessions",
      value: lifetime.totalSessions,
      icon: <Activity className="size-5 text-strawberry" strokeWidth={1.5} />,
    },
  ]

  return (
    <div className="rounded-3xl border border-matcha-dark/20 bg-strawberry-light/30 p-6">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Lifetime Totals</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 rounded-xl bg-white/60 p-4"
          >
            <div className="flex size-10 items-center justify-center rounded-full bg-white/80">
              {stat.icon}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
