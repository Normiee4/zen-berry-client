import { Clock } from "lucide-react"

interface PeakHoursData {
  start: number
  end: number
  avgPomodoros: number
}

interface ProductivityPeakHoursProps {
  peakHours: PeakHoursData | null
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM"
  if (hour < 12) return `${hour} AM`
  if (hour === 12) return "12 PM"
  return `${hour - 12} PM`
}

export function ProductivityPeakHours({ peakHours }: ProductivityPeakHoursProps) {
  if (!peakHours) {
    return (
      <div className="rounded-3xl border border-matcha-dark/20 bg-strawberry-light/30 p-6">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Peak Productivity Hours</h3>
        <div className="flex items-center justify-center rounded-xl bg-card/60 p-6">
          <p className="text-sm text-muted-foreground">No data yet</p>
        </div>
      </div>
    )
  }

  const startFormatted = formatHour(peakHours.start)
  const endFormatted = formatHour(peakHours.end)

  // Calculate a bar width percentage (max out at 24 hours)
  const barWidth = Math.min(((peakHours.end - peakHours.start) / 24) * 100, 100)
  const barLeft = (peakHours.start / 24) * 100

  return (
    <div className="rounded-3xl border border-matcha-dark/20 bg-strawberry-light/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-5 text-matcha" strokeWidth={1.5} />
        <h3 className="text-sm font-semibold text-foreground">Peak Productivity Hours</h3>
      </div>

      <div className="rounded-xl bg-card/60 p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <div>
            <p className="text-lg font-bold text-foreground">
              {startFormatted} – {endFormatted}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              ~{peakHours.avgPomodoros} pomodoros avg
            </p>
          </div>
        </div>

        {/* Timeline bar */}
        <div className="relative h-3 w-full rounded-full bg-gray-200">
          <div
            className="absolute top-0 h-full rounded-full bg-matcha"
            style={{
              left: `${barLeft}%`,
              width: `${barWidth}%`,
            }}
          />
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>00:00</span>
          <span>12:00</span>
          <span>23:00</span>
        </div>
      </div>
    </div>
  )
}
