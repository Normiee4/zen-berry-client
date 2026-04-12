"use client"

import { AnimatedMatchaCup } from "./Animated-matcha"
export function MatchaProgressCard() {
  // Calculate fill based on completed tasks (mock data: 2 out of 3 tasks)
  const fillPercentage = (2 / 3) * 100

  return (
    <div className="flex h-full items-center justify-center rounded-3xl bg-strawberry-light/30 p-6">
      <AnimatedMatchaCup
        fillPercentage={fillPercentage}
        message="Amazing progress! Time to reward yourself with a matcha break."
      />
    </div>
  )
}
