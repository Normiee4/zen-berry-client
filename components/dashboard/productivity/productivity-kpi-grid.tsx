import { Timer, CheckCircle2, Clock, Flame } from "lucide-react"
import { ProductivityKPICard } from "@/components/dashboard/productivity/productivity-kpi-card"

interface TodayStats {
  pomodorosCompleted: number
  tasksCompleted: number
  focusMinutes: number
  breakCount: number
}

interface ProductivityKPIGridProps {
  today: TodayStats
  streak: number
}

export function ProductivityKPIGrid({ today, streak }: ProductivityKPIGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <ProductivityKPICard
        label="Pomodoros Today"
        value={today.pomodorosCompleted}
        icon={<Timer className="size-5 text-matcha" strokeWidth={1.5} />}
        color="bg-strawberry-light/30"
      />
      <ProductivityKPICard
        label="Tasks Done"
        value={today.tasksCompleted}
        icon={<CheckCircle2 className="size-5 text-matcha" strokeWidth={1.5} />}
        color="bg-matcha-light/20"
      />
      <ProductivityKPICard
        label="Focus Minutes"
        value={today.focusMinutes}
        icon={<Clock className="size-5 text-strawberry" strokeWidth={1.5} />}
        color="bg-cream/60"
      />
      <ProductivityKPICard
        label="Current Streak"
        value={streak}
        icon={<Flame className="size-5 text-orange-400" strokeWidth={1.5} />}
        color="bg-orange-50"
      />
    </div>
  )
}
