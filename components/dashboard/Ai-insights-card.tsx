"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Sparkles, Loader2, Clock, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AIReviewResponse {
  insight: string
  suggestion: string
  stats: {
    pomodoros: number
    tasks: number
    peakHours: string | null
    restAnalysis: string | null
  }
}

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
}

const fetchSummary = async (): Promise<SummaryResponse> => {
  const res = await fetch("/api/analytics/summary")
  if (!res.ok) throw new Error("Failed to fetch summary")
  return res.json()
}

const generateAIReview = async (): Promise<AIReviewResponse> => {
  const res = await fetch("/api/ai/review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date: new Date().toISOString().slice(0, 10) }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "Failed to generate review")
  }
  return res.json()
}

function formatHours(hours: number): string {
  if (hours < 1) return `${Math.floor(hours * 60)}m`
  return `${Math.floor(hours)}h ${Math.floor((hours % 1) * 60)}m`
}

function formatPeakHours(peak: { start: number; end: number }): string {
  const formatHour = (h: number) => {
    const suffix = h >= 12 ? "PM" : "AM"
    const hour12 = h % 12 || 12
    return `${hour12}${suffix}`
  }
  return `${formatHour(peak.start)}-${formatHour(peak.end)}`
}

export function AIInsightsCard() {
  const [reviewData, setReviewData] = useState<AIReviewResponse | null>(null)

  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
    staleTime: 5 * 60 * 1000,
  })

  const reviewMutation = useMutation({
    mutationFn: generateAIReview,
    onSuccess: (data) => setReviewData(data),
    onError: (error) => {
      console.error("AI review error:", error)
    },
  })

  const handleGenerateReview = () => {
    reviewMutation.mutate()
  }

  const displayInsight = reviewData?.insight || "Start a focus session to unlock your daily insights!"
  const displaySuggestion = reviewData?.suggestion || "Complete your first Pomodoro to see personalized tips."

  return (
    <div className="flex h-full flex-col rounded-3xl bg-strawberry-light/30 p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-matcha" />
        <h3 className="text-lg font-semibold text-foreground">AI Insights</h3>
        <span className="text-base">✨</span>
      </div>

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
            <p className="font-medium text-foreground leading-relaxed">
              {displayInsight}
            </p>
            {displaySuggestion && (
              <p className="mt-2 text-sm text-muted-foreground">
                💡 {displaySuggestion}
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto flex flex-wrap gap-3 border-t border-border/30 pt-3">
          {summary?.peakHours && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5 text-matcha" />
              <span>Peak: {formatPeakHours(summary.peakHours)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>🍅</span>
            <span>{summary?.today?.pomodorosCompleted || 0} sessions</span>
          </div>
          {summary?.today?.streak ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>🔥</span>
              <span>{summary.today.streak}-day streak</span>
            </div>
          ) : null}
          {summary?.hoursSinceBreak != null && summary.hoursSinceBreak > 2 && (
            <div className="flex items-center gap-1.5 text-xs text-strawberry font-medium">
              <Clock className="size-3.5" />
              <span>No break in {formatHours(summary?.hoursSinceBreak ?? 0)}</span>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleGenerateReview}
        disabled={reviewMutation.isPending}
        className="mt-4 w-full bg-matcha hover:bg-matcha/90 text-white font-medium"
        size="sm"
      >
        {reviewMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 size-4" />
            Review My Day
          </>
        )}
      </Button>
    </div>
  )
}