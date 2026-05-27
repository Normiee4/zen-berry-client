"use client"

import { useEffect } from "react"
import { useTimerStore } from "@/store/timer-store"

const STREAK_STORAGE_KEY = "zenberry_timer_streak"

const loadFromStorage = () => {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STREAK_STORAGE_KEY)
    if (!stored) return null
    const parsed = JSON.parse(stored)
    const today = new Date().toISOString().slice(0, 10)
    if (parsed.date === today) {
      return {
        currentStreak: parsed.pomodorosToday > 0 ? Math.max(1, parsed.currentStreak ?? 0) : (parsed.currentStreak ?? 0),
        pomodorosToday: parsed.pomodorosToday ?? 0,
        lastPomodoroDate: today,
      }
    }
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
    if (parsed.date === yesterday) {
      return {
        currentStreak: parsed.currentStreak ?? 0,
        pomodorosToday: 0,
        lastPomodoroDate: yesterday,
      }
    }
  } catch { /* ignore */ }
  return null
}

export function StreakCard() {
  const currentStreak = useTimerStore((s) => s.currentStreak)
  const pomodorosToday = useTimerStore((s) => s.pomodorosToday)
  const loadStats = useTimerStore((s) => s.loadStats)

  useEffect(() => {
    const stored = loadFromStorage()
    if (stored) {
      loadStats(stored)
    }
  }, [loadStats])

  return (
    <div className="flex flex-col gap-2 rounded-3xl bg-strawberry-light/30 p-4 border border-matcha-dark/20">
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
