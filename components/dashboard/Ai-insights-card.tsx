"use client"

import { useMemo } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  AlertCircle,
  Clock,
  Flame,
  Leaf,
  Lightbulb,
  Loader2,
  Sparkles,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ZenseiMascot, type ZenseiPose } from "@/components/ZenseiMascot"

const ZENSEI_TIPS = [
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

interface AIReviewResponse {
  insight: string
  suggestion: string
  milestone?: string | null
  warning?: string | null
  stats: {
    pomodoros: number
    tasks: number
    peakHours: string | null
    restAnalysis: string | null
  }
}

interface LatestInsightResponse {
  insight: string | null
  suggestion: string | null
  milestone: string | null
  stats: {
    productivityLevel: number | null
    consistencyRate: number | null
    cyclesTotal: number
    peakHours: number
    peakDays: string[]
  }
  createdAt: string
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

const fetchLatestInsight = async (): Promise<LatestInsightResponse | null> => {
  const res = await fetch("/api/ai/insights/latest")
  if (res.status === 204) return null
  if (!res.ok) throw new Error("Failed to fetch latest insight")
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

function formatConsistency(value: number): string {
  const pct = Math.round(value * 100)
  if (pct >= 80) return "Consistent"
  if (pct >= 50) return "Building"
  return "Irregular"
}

export function AIInsightsCard() {
  const queryClient = useQueryClient()

  const todayTip = useMemo(() => {
    const dayIndex = new Date().getDate() % ZENSEI_TIPS.length
    return ZENSEI_TIPS[dayIndex]
  }, [])

  const { data: summary } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const { data: latestInsight } = useQuery({
    queryKey: ["ai-insights-latest"],
    queryFn: fetchLatestInsight,
    staleTime: 30 * 60 * 1000,
    retry: false,
  })

  const reviewMutation = useMutation({
    mutationFn: generateAIReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-insights-latest"] })
    },
    onError: (error) => {
      toast.error("AI review failed", { description: error.message })
    },
  })

  const handleGenerateReview = () => {
    reviewMutation.mutate()
  }

  const streak = summary?.today?.streak ?? 0

  const localCelebration =
    streak >= 3
      ? `${streak}-day streak! Zensei says: You're on fire! Keep showing up!`
      : null

  const displayMilestone =
    localCelebration ||
    reviewMutation.data?.milestone ||
    latestInsight?.milestone

  const displayWarning = reviewMutation.data?.warning

  const getMascotPose = (): ZenseiPose => {
    if (reviewMutation.isPending) return "thinking"
    if (displayWarning || (summary?.hoursSinceBreak != null && summary.hoursSinceBreak > 3)) {
      return "worried"
    }
    if (displayMilestone || streak >= 3) {
      return "celebration"
    }
    return "cheerful"
  }

  const displayInsight =
    reviewMutation.data?.insight ||
    latestInsight?.insight ||
    "Start a focus session to unlock your daily insights!"

  const displaySuggestion =
    reviewMutation.data?.suggestion ||
    latestInsight?.suggestion ||
    "Complete your first Pomodoro to see personalized tips."

  const insightStats = latestInsight?.stats

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-matcha-dark/20 bg-strawberry-light/30 p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="size-5 text-matcha" aria-hidden="true" />
        <h3 className="text-xl font-semibold text-foreground">Zensei Insights</h3>
      </div>

      {/* Mascot + Daily Tip Chat Bubble */}
      <div className="mb-4 flex items-center gap-4" data-tour="step-7">
        <ZenseiMascot
          pose={getMascotPose()}
          className="size-24 shrink-0 select-none sm:size-28"
        />

        <div className="relative flex-1 rounded-2xl rounded-tl-sm border border-matcha/25 bg-card/90 p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-1.5">
            <Leaf className="size-3.5 text-matcha" aria-hidden="true" />
            <span className="text-xs font-semibold text-matcha">Zensei&apos;s Daily Tip</span>
          </div>
          <p className="text-sm italic leading-relaxed text-foreground/85">
            &ldquo;{todayTip}&rdquo;
          </p>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="flex flex-1 flex-col rounded-2xl bg-card/75 p-5">
        <div className="mb-3">
          <p className="text-base font-medium leading-relaxed text-foreground">
            {displayInsight}
          </p>
          {displaySuggestion && (
            <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-matcha" aria-hidden="true" />
              <span>{displaySuggestion}</span>
            </p>
          )}
        </div>

        {displayMilestone && (
          <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-matcha-light/40 px-3 py-2 text-center">
            <Trophy className="size-4 shrink-0 text-matcha" aria-hidden="true" />
            <span className="text-sm font-semibold text-matcha">
              {displayMilestone}
            </span>
          </div>
        )}

        {displayWarning && (
          <div className="mb-3 flex items-center justify-center gap-2 rounded-lg bg-strawberry/25 px-3 py-2 text-center">
            <AlertCircle className="size-4 shrink-0 text-strawberry-dark" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">
              {displayWarning}
            </span>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-3 border-t border-border/30 pt-3">
          {summary?.peakHours && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="size-3.5 text-matcha" aria-hidden="true" />
              <span>Peak: {formatPeakHours(summary.peakHours)}</span>
            </div>
          )}
          {insightStats?.consistencyRate != null && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Zap className="size-3.5 text-matcha" aria-hidden="true" />
              <span>{formatConsistency(insightStats.consistencyRate)} ({Math.round(insightStats.consistencyRate * 100)}%)</span>
            </div>
          )}
          {summary?.today?.streak ? (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Flame className="size-3.5 text-strawberry-dark" aria-hidden="true" />
              <span>{summary.today.streak}-day streak</span>
            </div>
          ) : null}
          {summary?.hoursSinceBreak != null && summary.hoursSinceBreak > 2 && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-strawberry-dark">
              <Clock className="size-3.5" aria-hidden="true" />
              <span>No break in {formatHours(summary?.hoursSinceBreak ?? 0)}</span>
            </div>
          )}
        </div>
      </div>

      <Button
        onClick={handleGenerateReview}
        disabled={reviewMutation.isPending}
        className="mt-4 w-full bg-matcha font-medium text-white hover:bg-matcha/90"
        size="sm"
      >
        {reviewMutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Zensei is reflecting...
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
