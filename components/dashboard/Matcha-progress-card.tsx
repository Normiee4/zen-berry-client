"use client"

import { AnimatedMatchaCup } from "@/components/dashboard/Animated-matcha"

export function MatchaCupCard() {
  // Calculate fill based on completed tasks (mock data: 2 out of 3 tasks)
  const fillPercentage = (2 / 3) * 100

  return (
    <div className="flex h-full items-center justify-center rounded-2xl border border-border bg-linear-to-br from-white/80 to-matcha-light/30 p-6 backdrop-blur md:col-span-2">
      <AnimatedMatchaCup
        fillPercentage={fillPercentage}
        message="Amazing progress! Time to reward yourself with a matcha break ☕✨"
      />
    </div>
  )
}
