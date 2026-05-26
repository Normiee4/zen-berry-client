"use client"

import { useQuery } from "@tanstack/react-query"
import { AnimatedMatchaCup } from "./Animated-matcha"

interface SummaryResponse {
  today: {
    pomodorosCompleted: number
    tasksCompleted: number
    mitsCompleted: number
    streak: number
    totalFocusMinutes: number
    breakCount: number
  }
  peakHours: { start: number; end: number; avgPomodoros: number } | null
  hoursSinceBreak: number | null
}

const fetchSummary = async (): Promise<SummaryResponse> => {
  const res = await fetch("/api/analytics/summary")
  if (!res.ok) throw new Error("Failed to fetch summary")
  return res.json()
}

export function MatchaProgressCard() {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
    staleTime: 5 * 60 * 1000,
  })

  const tasksCompleted = summary?.today?.tasksCompleted ?? 0
  const pomodoros = summary?.today?.pomodorosCompleted ?? 0
  const totalMinutes = summary?.today?.totalFocusMinutes ?? 0

  const points = tasksCompleted + pomodoros
  const target = 50
  const fillPercentage = Math.min((points / target) * 100, 100)

  const getMessage = () => {
    if (fillPercentage >= 90) {
      return "Amazing progress! Time to reward yourself with a matcha break."
    } else if (fillPercentage >= 50) {
      return "Great work! Keep the momentum going."
    } else if (points > 0) {
      return "You've started strong! Let's keep going."
    }
    return "Ready to start your productivity journey?"
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl bg-strawberry-light/30 p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="h-32 w-24 animate-pulse bg-matcha-light/30 rounded-lg" />
          <div className="h-4 w-24 bg-matcha-light/30 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl bg-strawberry-light/30 p-6">
        <AnimatedMatchaCup fillPercentage={0} message="Let's start fresh!" />
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center rounded-3xl bg-strawberry-light/30 p-4">
      <div className="w-full">
        <AnimatedMatchaCup fillPercentage={fillPercentage} message={getMessage()} />
        
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground">
          <div>
            <span className="font-semibold text-matcha">{pomodoros}</span>
            <span className="ml-1">pomodoros</span>
          </div>
          <div>
            <span className="font-semibold text-matcha">{Math.floor(totalMinutes / 60)}h</span>
            <span className="ml-1">focus</span>
          </div>
          <div>
            <span className="font-semibold text-matcha">{tasksCompleted}</span>
            <span className="ml-1">tasks</span>
          </div>
        </div>
      </div>
    </div>
  )
}