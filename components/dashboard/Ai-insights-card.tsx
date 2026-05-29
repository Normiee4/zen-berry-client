"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Sparkles, Loader2, Clock, TrendingUp, Target, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ZenseiMascot } from "@/components/mascot/Zensei-mascot"

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

const fetchMilestones = async () => {
  const res = await fetch("/api/analytics/milestones")
  if (!res.ok) throw new Error("Failed to fetch milestones")
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

function formatProductivity(value: number): string {
  if (value >= 0.8) return "High"
  if (value >= 0.5) return "Moderate"
  return "Needs Focus"
}

function formatConsistency(value: number): string {
  const pct = Math.round(value * 100)
  if (pct >= 80) return "Consistent"
  if (pct >= 50) return "Building"
  return "Irregular"
}

export function AIInsightsCard() {
  const queryClient = useQueryClient()

  const { data: summary } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: fetchSummary,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })

  const { data: milestones } = useQuery({
    queryKey: ["analytics-milestones"],
    queryFn: fetchMilestones,
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

  const hasInsight = !!(reviewMutation.data?.insight || latestInsight?.insight)

  const mascotState = reviewMutation.isPending
    ? "thinking"
    : hasInsight
      ? "speaking"
      : "idle" as const

  const displayInsight =
    reviewMutation.data?.insight ||
    latestInsight?.insight ||
    "Start a focus session to unlock your daily insights!"

  const displaySuggestion =
    reviewMutation.data?.suggestion ||
    latestInsight?.suggestion ||
    "Complete your first Pomodoro to see personalized tips."

  const streak = summary?.today?.streak ?? 0
  const combinedTotal = milestones?.combinedTotal ?? 0
  const hitMilestone = combinedTotal > 0 && combinedTotal % 10 === 0

  const localCelebration =
    streak >= 3 && !displayMilestone
      ? `🔥 ${streak}-day streak! Zensei says: You're on fire! Keep showing up!`
      : hitMilestone
        ? `🎉 Milestone! ${combinedTotal} tasks completed! Reward yourself with a matcha!`
        : null

  const displayMilestone =
    localCelebration ||
    reviewMutation.data?.milestone ||
    latestInsight?.milestone

  const displayWarning = reviewMutation.data?.warning

  const insightStats = latestInsight?.stats

  return (
    <div className="flex h-full flex-col rounded-3xl bg-strawberry-light/30 p-6 border border-matcha-dark/20">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles className="size-5 text-matcha" />
        <h3 className="text-lg font-semibold text-foreground">Zensei Insights</h3>
        <span className="text-base">🍓</span>
      </div>

      <div className="flex flex-1 flex-col rounded-2xl bg-white/70 p-4">
        <div className="mb-3 flex items-start gap-3">
          <ZenseiMascot state={mascotState} />
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

        {displayMilestone && (
          <div className="mb-3 rounded-lg bg-matcha-light/40 px-3 py-2 text-center">
            <span className="text-sm font-semibold text-matcha">
              🏆 {displayMilestone}
            </span>
          </div>
        )}

        {displayWarning && (
          <div className="mb-3 rounded-lg bg-strawberry/30 px-3 py-2 text-center">
            <span className="text-sm font-medium text-foreground">
              🍓 {displayWarning}
            </span>
          </div>
        )}

        {insightStats && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {insightStats.productivityLevel != null && (
              <div className="rounded-lg bg-matcha-light/20 px-2 py-1.5 text-center">
                <Target className="mx-auto mb-0.5 size-3.5 text-matcha" />
                <p className="text-xs font-semibold text-matcha">
                  {formatProductivity(insightStats.productivityLevel)}
                </p>
                <p className="text-[10px] text-muted-foreground">productivity</p>
              </div>
            )}
            {insightStats.consistencyRate != null && (
              <div className="rounded-lg bg-matcha-light/20 px-2 py-1.5 text-center">
                <Zap className="mx-auto mb-0.5 size-3.5 text-matcha" />
                <p className="text-xs font-semibold text-matcha">
                  {formatConsistency(insightStats.consistencyRate)}
                </p>
                <p className="text-[10px] text-muted-foreground">consistency</p>
              </div>
            )}
            {insightStats.cyclesTotal > 0 && (
              <div className="rounded-lg bg-matcha-light/20 px-2 py-1.5 text-center">
                <span className="mx-auto mb-0.5 block text-center text-xs">🍅</span>
                <p className="text-xs font-semibold text-matcha">
                  {insightStats.cyclesTotal}
                </p>
                <p className="text-[10px] text-muted-foreground">total</p>
              </div>
            )}
          </div>
        )}

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
