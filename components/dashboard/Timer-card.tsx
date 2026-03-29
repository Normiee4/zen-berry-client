"use client"

import { Play, Pause, RotateCcw, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TimerCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-linear-to-br from-white/80 to-cream/50 p-8 backdrop-blur md:col-span-2">
      {/* Timer Display */}
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Focus Session</h2>
        <div className="mt-4 text-6xl font-bold text-matcha font-mono">25:00</div>
        <p className="mt-2 text-sm text-muted-foreground">Classic Pomodoro</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button size="lg" className="bg-matcha text-cream hover:bg-matcha-light rounded-full">
          <Play className="size-5" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-border rounded-full"
        >
          <Pause className="size-5 text-foreground" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-border rounded-full"
        >
          <RotateCcw className="size-5 text-foreground" />
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-border rounded-full"
        >
          <Settings className="size-5 text-foreground" />
        </Button>
      </div>
    </div>
  )
}
