"use client"

import { Sparkles } from "lucide-react"

export function AIInsightsCard() {
  return (
    <div className="flex h-full flex-col rounded-3xl bg-strawberry-light/30 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-matcha" />
        <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
        <span className="text-base">&#x2728;</span>
      </div>

      {/* Insight Message */}
      <div className="flex flex-1 flex-col rounded-2xl bg-white/70 p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-matcha-light/50">
            <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="12" width="24" height="20" rx="4" fill="#B8D4B8" />
              <rect x="10" y="14" width="20" height="16" rx="3" fill="#86A788" />
              <circle cx="15" cy="22" r="1.5" fill="#2D3A2D" />
              <circle cx="25" cy="22" r="1.5" fill="#2D3A2D" />
              <path d="M18 26 Q20 28 22 26" stroke="#2D3A2D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-foreground">
              Great progress today!
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              You completed 3 focus sessions. Time to treat yourself with some matcha!
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-auto flex gap-4 border-t border-border/30 pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>&#x1F4CA;</span>
            <span>Peak focus: 10-12am</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>&#x1F525;</span>
            <span>5-day streak</span>
          </div>
        </div>
      </div>
    </div>
  )
}
