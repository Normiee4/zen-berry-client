"use client"

import { useQuery } from "@tanstack/react-query"

const fetchSummary = async () => {
  const res = await fetch("/api/analytics/summary")
  if (!res.ok) throw new Error("Failed to fetch summary")
  return res.json()
}

export function StreakCard() {
  const { data: summary } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })

  const currentStreak = summary?.today?.streak ?? 0
  const pomodorosToday = summary?.today?.pomodorosCompleted ?? 0

  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-strawberry-light/30 p-6 border border-matcha-dark/20">
      <div className="flex items-center gap-4">
        <div className="flex size-10 items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="12" width="24" height="20" rx="4" fill="#B8D4B8" />
            <rect x="10" y="14" width="20" height="16" rx="3" fill="#86A788" />
            <circle cx="15" cy="22" r="1.5" fill="#2D3A2D" />
            <circle cx="25" cy="22" r="1.5" fill="#2D3A2D" />
            <path d="M18 26 Q20 28 22 26" stroke="#2D3A2D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <ellipse cx="20" cy="12" rx="10" ry="2" fill="#B8D4B8" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{currentStreak}</span>
            <span className="text-sm font-medium text-muted-foreground">day streak</span>
            <span className="ml-1 text-base">&#x1F331;</span>
          </div>
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <span>{pomodorosToday} pomodoros today</span>
            <span className="text-base">&#x1F353;</span>
          </div>
        </div>
      </div>
    </div>
  )
}
