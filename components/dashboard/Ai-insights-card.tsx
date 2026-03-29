"use client"

import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export function AIInsightsCard() {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-linear-to-br from-white/80 to-strawberry-light/20 p-6 backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="text-5xl">🤖</div>
        <div className="text-center">
          <p className="font-medium text-foreground">
            You&apos;re on a 5-day focus streak!
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Keep it up! You&apos;re more productive in the morning.
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        className="mt-4 w-full border-amber-500/30 text-amber-700 hover:bg-amber-50"
        size="sm"
      >
        <Sparkles className="mr-2 size-4" />
        Get personalized tips
      </Button>
    </div>
  )
}
