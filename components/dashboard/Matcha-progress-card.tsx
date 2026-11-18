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
  lifetimeTasks: number
  lifetimeCycles: number
}

const fetchSummary = async (): Promise<SummaryResponse> => {
  const res = await fetch("/api/analytics/summary")
  if (!res.ok) throw new Error("Failed to fetch summary")
  return res.json()
}

const MILESTONE_TARGET = 10

export function MatchaProgressCard() {
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
    staleTime: 5 * 60 * 1000,
  })

  const combinedTotal = (summary?.lifetimeTasks ?? 0) + (summary?.lifetimeCycles ?? 0)
  const progressWithinMilestone = combinedTotal % MILESTONE_TARGET
  const fillPercentage = (progressWithinMilestone / MILESTONE_TARGET) * 100

  const totalMinutes = summary?.today?.totalFocusMinutes ?? 0
  const streak = summary?.today?.streak ?? 0

  const getMessage = () => {
    if (streak >= 7) return `🔥 ${streak}-day streak! Zensei says: Your consistency is inspiring. Keep showing up!`
    if (streak >= 3) return `✨ ${streak}-day streak! Zensei says: You're building momentum. Stay with it!`
    if (combinedTotal > 0 && combinedTotal % MILESTONE_TARGET === 0) {
      return `🎉 Milestone! Zensei says: Reward yourself with a matcha! ${combinedTotal} tasks done!`
    }
    if (fillPercentage >= 90) {
      return "Almost there! Zensei says: Finish strong for your matcha reward."
    } else if (fillPercentage >= 50) {
      return "More than halfway! Zensei says: Keep the momentum going."
    } else if (combinedTotal > 0) {
      return `${MILESTONE_TARGET - progressWithinMilestone} tasks until your next matcha. Zensei believes in you!`
    }
    return "Complete tasks to earn a matcha reward. Zensei is rooting for you!"
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl bg-strawberry-light/30 p-6 border border-matcha-dark/20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-32 w-24 animate-pulse bg-matcha-light/30 rounded-lg" />
          <div className="h-4 w-24 bg-matcha-light/30 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl bg-strawberry-light/30 p-6 border border-matcha-dark/20">
        <AnimatedMatchaCup fillPercentage={0} combinedTotal={0} message="Let's start fresh!" />
      </div>
    )
  }

  return (
    <div className="flex h-full items-center justify-center rounded-3xl bg-strawberry-light/30 p-4 sm:p-6 border border-matcha-dark/20">
      <div className="w-full">
        <AnimatedMatchaCup
          fillPercentage={fillPercentage}
          combinedTotal={combinedTotal}
          message={getMessage()}
        />
        
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <span className="text-sm font-semibold text-matcha">{combinedTotal}</span>
            <span className="ml-1 text-xs font-medium text-muted-foreground">total</span>
          </div>
          <div>
            {totalMinutes > 0 ? (
              <>
                <span className="text-sm font-semibold text-matcha">{Math.floor(totalMinutes / 60)}h</span>
                <span className="ml-1 text-xs font-medium text-muted-foreground">focus</span>
              </>
            ) : (
              <span className="text-xs font-medium text-muted-foreground">--</span>
            )}
          </div>
          <div>
            <span className="text-sm font-semibold text-matcha">{MILESTONE_TARGET - progressWithinMilestone}</span>
            <span className="ml-1 text-xs font-medium text-muted-foreground">to reward</span>
          </div>
        </div>
      </div>
    </div>
  )
}