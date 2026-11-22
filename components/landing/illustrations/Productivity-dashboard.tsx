"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useResponsive } from "@/hooks/useResponsive"
import { ArrowRight, CheckCircle2, Coffee, Pause, Play, RotateCcw, Settings, Sparkles, Sprout } from "lucide-react"
import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts"

interface TimerPreset {
  id: string
  name: string
  focusMinutes: number
  breakMinutes: number
}

interface TrialUsage {
  focusCompleted: number
  breakCompleted: number
  promptDismissed: boolean
}

const TRIAL_USAGE_KEY = "zenberry_landing_trial_usage"
const authEnabled =
  process.env.NEXT_PUBLIC_ENABLE_LOGIN === "true" ||
  process.env.NEXT_PUBLIC_ENABLE_SIGNUP === "true"

const defaultPresets: TimerPreset[] = [
  { id: "1", name: "Classic Pomodoro", focusMinutes: 25, breakMinutes: 5 },
  { id: "2", name: "Deep Work", focusMinutes: 50, breakMinutes: 10 },
  { id: "3", name: "Quick Sprint", focusMinutes: 15, breakMinutes: 3 },
]

function loadTrialUsage(): TrialUsage {
  if (typeof window === "undefined") {
    return { focusCompleted: 0, breakCompleted: 0, promptDismissed: false }
  }
  try {
    const raw = localStorage.getItem(TRIAL_USAGE_KEY)
    if (!raw) return { focusCompleted: 0, breakCompleted: 0, promptDismissed: false }
    const parsed = JSON.parse(raw) as Partial<TrialUsage>
    return {
      focusCompleted: typeof parsed.focusCompleted === "number" ? parsed.focusCompleted : 0,
      breakCompleted: typeof parsed.breakCompleted === "number" ? parsed.breakCompleted : 0,
      promptDismissed: Boolean(parsed.promptDismissed),
    }
  } catch {
    return { focusCompleted: 0, breakCompleted: 0, promptDismissed: false }
  }
}

function saveTrialUsage(usage: TrialUsage) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(TRIAL_USAGE_KEY, JSON.stringify(usage))
  } catch {
    // ignore storage errors
  }
}

export function ProductivityDashboard() {
  const [activePreset, setActivePreset] = useState<TimerPreset>(defaultPresets[0])
  const [totalSeconds, setTotalSeconds] = useState(defaultPresets[0].focusMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loginInviteOpen, setLoginInviteOpen] = useState(false)
  const [trialUsage, setTrialUsage] = useState<TrialUsage>(() => loadTrialUsage())

  const { isMobile, isTablet } = useResponsive()
  const chartSize = isMobile ? 150 : isTablet ? 170 : 190
  const chartCenter = chartSize / 2
  const chartInnerRadius = chartSize * 0.35
  const chartOuterRadius = chartSize * 0.44
  const chartBarSize = isMobile ? 10 : 12

  const maxSeconds = Math.max(
    1,
    isBreak ? activePreset.breakMinutes * 60 : activePreset.focusMinutes * 60
  )
  const progress = Math.min(100, Math.max(0, ((maxSeconds - totalSeconds) / maxSeconds) * 100))

  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`

  const chartData = [
    {
      name: "progress",
      value: progress,
      fill: isBreak ? "#E88D8D" : "#86A788",
    },
  ]

  const recordSessionCompletion = useCallback((completedBreak: boolean) => {
    setTrialUsage((prev) => {
      const next: TrialUsage = {
        focusCompleted: completedBreak ? prev.focusCompleted : prev.focusCompleted + 1,
        breakCompleted: completedBreak ? prev.breakCompleted + 1 : prev.breakCompleted,
        promptDismissed: prev.promptDismissed,
      }
      saveTrialUsage(next)
      if (next.focusCompleted >= 2 && next.breakCompleted >= 2 && !next.promptDismissed) {
        setLoginInviteOpen(true)
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          recordSessionCompletion(isBreak)
          if (!isBreak) {
            setIsBreak(true)
            return activePreset.breakMinutes * 60
          } else {
            setIsBreak(false)
            return activePreset.focusMinutes * 60
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isBreak, activePreset, recordSessionCompletion])

  const handlePlayPause = useCallback(() => {
    if (trialUsage.focusCompleted >= 2 && trialUsage.breakCompleted >= 2 && !trialUsage.promptDismissed) {
      setLoginInviteOpen(true)
      return
    }
    setIsRunning((prev) => !prev)
  }, [trialUsage])

  const handleReset = useCallback(() => {
    setIsRunning(false)
    setTotalSeconds(isBreak ? activePreset.breakMinutes * 60 : activePreset.focusMinutes * 60)
  }, [activePreset, isBreak])

  const handleModeSwitch = useCallback(
    (nextIsBreak: boolean) => {
      setIsRunning(false)
      setIsBreak(nextIsBreak)
      setTotalSeconds(
        nextIsBreak ? activePreset.breakMinutes * 60 : activePreset.focusMinutes * 60
      )
    },
    [activePreset]
  )

  const handlePresetSelect = useCallback((preset: TimerPreset) => {
    setActivePreset(preset)
    setIsRunning(false)
    setIsBreak(false)
    setTotalSeconds(preset.focusMinutes * 60)
    setSettingsOpen(false)
  }, [])

  const handleDismissInvite = useCallback(() => {
    setLoginInviteOpen(false)
    setTrialUsage((prev) => {
      const next = { ...prev, promptDismissed: true }
      saveTrialUsage(next)
      return next
    })
  }, [])

  return (
    <div
      id="try-timer"
      className="rounded-3xl border border-white/85 bg-white/90 p-6 shadow-[0_24px_50px_-14px_rgba(62,89,64,0.22),0_8px_18px_-6px_rgba(62,89,64,0.1),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-md"
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-matcha-light/40 px-2.5 py-0.5 text-xs font-medium text-matcha-dark">
            Free Pomodoro Trial
          </span>
          <h2 className="mt-1 text-lg font-semibold text-matcha-dark">
            {activePreset.name}
          </h2>
        </div>

        {/* Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full border border-matcha-light/60 text-matcha-dark transition-colors hover:bg-matcha-light/30"
              aria-label="Choose timer preset"
            >
              <Settings className="size-4" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto bg-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-matcha-dark">Timer Presets</DialogTitle>
              <DialogDescription className="text-matcha-dark/70">
                Choose a focus and break rhythm for your session.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <Label className="text-sm font-medium text-matcha-dark">Presets</Label>
              <div className="space-y-2">
                {defaultPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={`flex w-full flex-col items-start rounded-xl border p-3 text-left transition-colors ${
                      activePreset.id === preset.id
                        ? "border-matcha bg-matcha-light/25"
                        : "border-matcha-light/50 hover:border-matcha/60"
                    }`}
                  >
                    <span className="font-medium text-matcha-dark">{preset.name}</span>
                    <span className="text-xs text-matcha-dark/70">
                      {preset.focusMinutes}min focus / {preset.breakMinutes}min break
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mode Toggle */}
      <div className="mb-4 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => handleModeSwitch(false)}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            !isBreak
              ? "bg-matcha text-white"
              : "bg-cream text-matcha-dark hover:bg-matcha-light/30"
          }`}
        >
          <Sprout className="size-4" aria-hidden="true" />
          Focus ({activePreset.focusMinutes}m)
        </button>
        <button
          type="button"
          onClick={() => handleModeSwitch(true)}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            isBreak
              ? "bg-strawberry text-white"
              : "bg-cream text-matcha-dark hover:bg-strawberry-light"
          }`}
        >
          <Coffee className="size-4" aria-hidden="true" />
          Break ({activePreset.breakMinutes}m)
        </button>
      </div>

      {/* Timer Circle with Recharts */}
      <div className="mb-4 flex justify-center">
        <div className="relative flex w-full max-w-[210px] items-center justify-center">
          <RadialBarChart
            width={chartSize}
            height={chartSize}
            cx={chartCenter}
            cy={chartCenter}
            innerRadius={chartInnerRadius}
            outerRadius={chartOuterRadius}
            barSize={chartBarSize}
            data={chartData}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "#FDE4E4" }}
              dataKey="value"
              cornerRadius={10}
              angleAxisId={0}
            />
          </RadialBarChart>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-bold text-matcha-dark">
              {formattedTime}
            </span>
            <span className="text-xs font-medium text-matcha-dark/70">
              {isBreak ? "break time" : "focus time"}
            </span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="mb-5 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleReset}
          className="flex size-10 items-center justify-center rounded-full border border-matcha-light/70 bg-cream text-matcha-dark transition-colors hover:border-matcha hover:bg-matcha-light/30"
          aria-label="Reset timer"
        >
          <RotateCcw className="size-4" />
        </button>

        <button
          type="button"
          onClick={handlePlayPause}
          className="flex size-14 items-center justify-center rounded-full bg-matcha text-white shadow-md transition-all hover:bg-matcha-dark hover:shadow-lg"
          aria-label={isRunning ? "Pause timer" : "Start timer"}
        >
          {isRunning ? (
            <Pause className="size-6 fill-current" />
          ) : (
            <Play className="size-6 translate-x-0.5 fill-current" />
          )}
        </button>
      </div>

      {/* Quick Preset Pills */}
      <div className="mb-4 flex flex-wrap justify-center gap-1.5">
        {defaultPresets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetSelect(preset)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              activePreset.id === preset.id
                ? "bg-matcha-light/50 text-matcha-dark"
                : "bg-cream text-matcha-dark/70 hover:bg-matcha-light/25"
            }`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Tasks Preview & Trial Progress */}
      <div className="space-y-2.5 border-t border-matcha-light/40 pt-4">
        <div className="flex items-center justify-between text-xs text-matcha-dark/70">
          <span className="font-medium">Trial sessions</span>
          <span>
            {Math.min(trialUsage.focusCompleted, 2)}/2 focus · {Math.min(trialUsage.breakCompleted, 2)}/2 breaks
          </span>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-strawberry-light/60 p-3">
          <CheckCircle2 className="size-4 shrink-0 text-matcha-dark" aria-hidden="true" />
          <span className="text-sm font-medium text-matcha-dark">Review design mockups</span>
          <span className="ml-auto rounded-md bg-strawberry px-2 py-0.5 text-xs font-semibold text-white">
            {activePreset.focusMinutes}m
          </span>
        </div>
      </div>

      {/* 2 Focus + 2 Breaks Login Invitation Dialog */}
      <Dialog open={loginInviteOpen} onOpenChange={(open) => !open && handleDismissInvite()}>
        <DialogContent className="bg-white sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-3 inline-flex size-12 items-center justify-center rounded-2xl bg-strawberry-light">
              <Sparkles className="size-6 text-strawberry-dark" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-matcha-dark">
              Nice rhythm! Save your focus streak
            </DialogTitle>
            <DialogDescription className="text-center text-matcha-dark/75">
              You&apos;ve completed 2 focus sessions and 2 breaks. Log in to save your
              custom timers, track daily streaks, and unlock gentle productivity insights.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-3">
            <Button asChild size="lg" className="w-full bg-matcha text-white hover:bg-matcha-dark">
              <Link href={authEnabled ? "/auth/login" : "/auth/waitlist"} className="inline-flex items-center justify-center gap-2">
                {authEnabled ? "Log in to Continue" : "Join Waitlist"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            {authEnabled && (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="w-full border-matcha/40 text-matcha-dark hover:bg-matcha-light/25"
              >
                <Link href="/auth/signup">Create Free Account</Link>
              </Button>
            )}

            <button
              type="button"
              onClick={handleDismissInvite}
              className="mt-1 text-center text-xs font-medium text-matcha-dark/60 transition-colors hover:text-matcha-dark"
            >
              Maybe later
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
