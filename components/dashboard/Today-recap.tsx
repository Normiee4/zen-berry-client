"use client"

import { useQuery } from "@tanstack/react-query"
import { CalendarCheck, Timer, Coffee, Sparkles } from "lucide-react"

const fetchSummary = async () => {
  const res = await fetch("/api/analytics/summary")
  if (!res.ok) throw new Error("Failed to fetch summary")
  return res.json()
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function TodayRecap() {
  const { data: summary } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })

  const items = [
    {
      icon: CalendarCheck,
      label: "Tasks done",
      value: summary?.today?.tasksCompleted ?? 0,
      color: "text-matcha",
    },
    {
      icon: Timer,
      label: "Pomodoros",
      value: summary?.today?.pomodorosCompleted ?? 0,
      color: "text-strawberry",
    },
    {
      icon: Coffee,
      label: "Breaks",
      value: summary?.today?.breakCount ?? 0,
      color: "text-matcha",
    },
    {
      icon: Sparkles,
      label: "Focus",
      value: formatMinutes(summary?.today?.totalFocusMinutes ?? 0),
      color: "text-matcha",
    },
  ]

  return (
    <div className="flex h-full flex-col rounded-3xl border border-matcha-dark/20 bg-strawberry-light/30 p-6">
      <h3 className="mb-4 text-base font-semibold text-foreground">Today&apos;s Recap</h3>
      <div className="flex flex-1 items-center justify-center">
        <div className="grid w-full grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className={`size-4 shrink-0 ${item.color}`} />
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                <span className="text-sm font-semibold text-foreground">{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
