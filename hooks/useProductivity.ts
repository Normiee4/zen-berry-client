"use client"

import { useQuery } from "@tanstack/react-query"

export interface ProductivityResponse {
  today: {
    pomodorosCompleted: number
    tasksCompleted: number
    mitsCompleted: number
    focusMinutes: number
    breakCount: number
  }
  streak: number
  lifetime: {
    totalTasks: number
    totalPomodoros: number
    totalFocusMinutes: number
    totalSessions: number
  }
  weeklyHistory: Array<{
    date: string
    day: string
    pomodoros: number
    tasks: number
    focusMinutes: number
  }>
  weeklyTotals: {
    pomodoros: number
    tasks: number
    focusMinutes: number
  }
  peakHours: {
    start: number
    end: number
    avgPomodoros: number
  } | null
  consistency: {
    activeDays: number
    totalDays: number
    rate: number
  }
  comparison: {
    pomodorosChange: number
    tasksChange: number
    focusChange: number
  } | null
}

async function fetchProductivity(): Promise<ProductivityResponse> {
  const res = await fetch("/api/productivity")
  if (!res.ok) throw new Error("Failed to fetch productivity data")
  return res.json()
}

export function useProductivity() {
  return useQuery({
    queryKey: ["productivity"],
    queryFn: fetchProductivity,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
  })
}
