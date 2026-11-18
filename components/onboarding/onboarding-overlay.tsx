"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowRight, X } from "lucide-react"
import { toast } from "sonner"
import { useMITApi } from "@/hooks/useTasksApi"
import { applyTheme } from "@/lib/theme"
import { useTimerStore } from "@/store/timer-store"
import {
  FirstTasksStep,
  FirstTimerStep,
  HookStep,
  PainStep,
  SetupStep,
  SolutionStep,
} from "./onboarding-steps"
import {
  MAX_FIRST_TASKS,
  ONBOARDING_PRESET_IDS,
  PHASES,
  type PainId,
  type ThemeOption,
} from "./onboarding-content"

interface OnboardingOverlayProps {
  onComplete: () => void
}

const STEP_HOOK = 0
const STEP_PAIN = 1
const STEP_SOLUTION = 2
const STEP_SETUP = 3
const STEP_TASKS = 4
const STEP_TIMER = 5
const LAST_STEP = STEP_TIMER
const THEME_IDS: ThemeOption["id"][] = ["light-zen", "warm-earth", "cozy-dark"]

const NEXT_LABELS: Record<number, string> = {
  [STEP_HOOK]: "Let's find out",
  [STEP_PAIN]: "Continue",
  [STEP_SOLUTION]: "Set up my space",
  [STEP_SETUP]: "Save and continue",
  [STEP_TASKS]: "Create my tasks",
  [STEP_TIMER]: "Open my dashboard",
}

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [step, setStep] = useState(STEP_HOOK)
  const [isExiting, setIsExiting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [pains, setPains] = useState<PainId[]>([])
  const [name, setName] = useState("")
  const [theme, setTheme] = useState<ThemeOption["id"]>("light-zen")
  const [taskTitles, setTaskTitles] = useState<string[]>([""])
  const [createdTitles, setCreatedTitles] = useState<string[]>([])

  const { addMIT } = useMITApi()
  const presets = useTimerStore((s) => s.presets)
  const activePresetId = useTimerStore((s) => s.activePresetId)
  const setPreset = useTimerStore((s) => s.setPreset)

  const onboardingPresets = ONBOARDING_PRESET_IDS
    .map((id) => presets.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p !== undefined)

  useEffect(() => {
    fetch("/api/auth-service/me")
      .then((res) => res.json())
      .then((data: { user?: { name?: string; theme_preference?: string } }) => {
        if (data.user?.name) setName(data.user.name)
        const savedTheme = THEME_IDS.find((id) => id === data.user?.theme_preference)
        if (savedTheme) setTheme(savedTheme)
      })
      .catch(() => {})
  }, [])

  const handleComplete = () => {
    setIsExiting(true)
    setTimeout(onComplete, 400)
  }

  const togglePain = (id: PainId) => {
    setPains((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const handleThemeChange = (next: ThemeOption["id"]) => {
    setTheme(next)
    applyTheme(next)
  }

  const saveAccountSetup = async (): Promise<boolean> => {
    const res = await fetch("/api/auth-service/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name.trim(), theme_preference: theme }),
    })
    if (!res.ok) {
      toast.error("We couldn't save your setup. Please try again.")
      return false
    }
    return true
  }

  const createFirstTasks = async (): Promise<boolean> => {
    const pending = taskTitles
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && !createdTitles.includes(t))
      .slice(0, MAX_FIRST_TASKS)

    const created: string[] = []
    for (const title of pending) {
      const result = await addMIT(title)
      if (!result.success) break
      created.push(title)
    }
    const allCreated = [...createdTitles, ...created]
    setCreatedTitles(allCreated)
    return allCreated.length > 0 && created.length === pending.length
  }

  const canContinue = (() => {
    if (isSaving) return false
    if (step === STEP_PAIN) return pains.length > 0
    if (step === STEP_SETUP) return name.trim().length > 0
    if (step === STEP_TASKS) return taskTitles.some((t) => t.trim().length > 0) || createdTitles.length > 0
    return true
  })()

  const handleNext = async () => {
    if (step === LAST_STEP) {
      handleComplete()
      return
    }
    if (step === STEP_SETUP || step === STEP_TASKS) {
      setIsSaving(true)
      const ok = step === STEP_SETUP ? await saveAccountSetup() : await createFirstTasks()
      setIsSaving(false)
      if (!ok) return
    }
    setStep((prev) => prev + 1)
  }

  const handleBack = () => setStep((prev) => Math.max(STEP_HOOK, prev - 1))

  const progressPercent = ((step + 1) / PHASES.length) * 100
  const firstTask = createdTitles[0] ?? taskTitles.find((t) => t.trim().length > 0)?.trim() ?? ""

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background/95 backdrop-blur-sm transition-opacity duration-400 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      <button
        onClick={handleComplete}
        className="absolute right-6 top-6 flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry/10 hover:text-foreground"
      >
        Skip for now
        <X className="size-4" />
      </button>

      <div className="mx-4 my-10 w-full max-w-lg">
        <div className="rounded-3xl border border-matcha-dark/15 bg-card p-8 shadow-xl sm:p-10">
          {/* Progress */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="uppercase tracking-widest text-matcha-dark">{PHASES[step].label}</span>
              <span className="text-muted-foreground">
                {step + 1} of {PHASES.length}
              </span>
            </div>
            <div
              className="h-2 w-full overflow-hidden rounded-full bg-strawberry-light"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={PHASES.length}
              aria-valuenow={step + 1}
            >
              <div
                className="h-full rounded-full bg-matcha transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div key={step} className="animate-fadeIn min-h-[320px]">
            {step === STEP_HOOK && <HookStep name={name} />}
            {step === STEP_PAIN && <PainStep selected={pains} onToggle={togglePain} />}
            {step === STEP_SOLUTION && <SolutionStep selected={pains} />}
            {step === STEP_SETUP && (
              <SetupStep name={name} theme={theme} onNameChange={setName} onThemeChange={handleThemeChange} />
            )}
            {step === STEP_TASKS && (
              <FirstTasksStep
                titles={taskTitles}
                lockedTitles={createdTitles}
                onChange={(i, value) => setTaskTitles((prev) => prev.map((t, idx) => (idx === i ? value : t)))}
                onAddRow={() => setTaskTitles((prev) => [...prev, ""])}
                onRemoveRow={(i) => setTaskTitles((prev) => prev.filter((_, idx) => idx !== i))}
              />
            )}
            {step === STEP_TIMER && (
              <FirstTimerStep
                presets={onboardingPresets}
                activePresetId={activePresetId}
                firstTask={firstTask}
                onSelect={setPreset}
              />
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === STEP_HOOK || isSaving}
              className="flex min-h-11 items-center gap-1 rounded-xl px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry/10 hover:text-foreground disabled:pointer-events-none disabled:opacity-0"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canContinue}
              className={`flex min-h-11 items-center gap-1.5 rounded-xl px-6 text-sm font-semibold transition-all active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 ${
                step === LAST_STEP
                  ? "bg-matcha text-white shadow-lg shadow-matcha/25 hover:bg-matcha-dark"
                  : "bg-strawberry text-foreground shadow-lg shadow-strawberry/25 hover:brightness-95"
              }`}
            >
              {isSaving ? "Saving..." : NEXT_LABELS[step]}
              {!isSaving && step !== LAST_STEP && <ArrowRight className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
