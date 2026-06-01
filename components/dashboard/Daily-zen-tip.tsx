"use client"

import { useMemo } from "react"

const tips = [
  "Rest is productive, too. Step away and come back clearer.",
  "Three deep breaths reset the mind. Try it before your next session.",
  "Progress over perfection. A done task beats a perfect plan.",
  "Your brain is not a storage drive. Dump it, then focus.",
  "The best time to start was 10 minutes ago. The second best is now.",
  "A short break every 25 minutes keeps burnout away.",
  "Matcha tastes better when you've earned it. Finish one task first.",
  "Small wins compound. One Pomodoro at a time.",
  "You don't need motivation. You need a routine.",
  "If a task feels huge, break it until it feels small.",
  "Your peak hours are precious. Protect them.",
  "Celebrate the done, not just the done list.",
  "A clear space helps a clear mind. Tidy your desk, tidy your thoughts.",
  "Done is better than perfect. Perfect never ships.",
  "You are not a machine. Rest is how you sustain focus.",
  "What's the one thing that matters most right now? Start there.",
  "A wandering mind is not a failing mind. Just guide it back gently.",
  "The Pomodoro you skip is the one you needed most.",
]

export function DailyZenTip() {
  const todayTip = useMemo(() => {
    const dayIndex = new Date().getDate() % tips.length
    return tips[dayIndex]
  }, [])

  return (
    <div className="rounded-3xl border border-matcha-dark/20 bg-white/60 p-5 backdrop-blur-sm">
      <div className="flex items-start gap-4">
        <div className="relative size-16 shrink-0">
          <img
            src="/matcha_illustration.png"
            alt=""
            className="size-full object-contain opacity-80"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-matcha">Zensei&apos;s Daily Sip</span>
            <span className="text-base">🍵</span>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-foreground/80 italic">
            &ldquo;{todayTip}&rdquo;
          </p>
        </div>
        <div className="relative mt-1 size-10 shrink-0 self-start">
          <img
            src="/strawberry_illustration.png"
            alt=""
            className="size-full object-contain opacity-60"
          />
        </div>
      </div>
    </div>
  )
}
