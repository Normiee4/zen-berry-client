"use client"

import { Check, Plus, X } from "lucide-react"
import type { TimerPreset } from "@/store/timer-store"
import {
  MAX_FIRST_TASKS,
  PAIN_OPTIONS,
  PRESET_BLURBS,
  THEME_OPTIONS,
  type PainId,
  type ThemeOption,
} from "./onboarding-content"

interface StepHeadingProps {
  eyebrow: string
  title: string
  body?: string
}

function StepHeading({ eyebrow, title, body }: StepHeadingProps) {
  return (
    <div className="space-y-3 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-matcha-dark">{eyebrow}</p>
      <h2 className="text-balance text-2xl font-bold leading-tight text-foreground">{title}</h2>
      {body && <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>}
    </div>
  )
}

/* ── 1. Hook ─────────────────────────────────────────────── */

export function HookStep({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <img src="/strawberry_illustration.png" alt="Strawberry" className="animate-idle h-28 w-28 object-contain" />
      </div>
      <StepHeading
        eyebrow={name ? `Welcome, ${name}` : "Welcome"}
        title="What would you finish today if nothing got in the way?"
        body="Zen Berry helps you choose the few things that matter and protects the time to do them. Setup takes about two minutes, and you will finish with your first task and timer ready."
      />
    </div>
  )
}

/* ── 2. Pain ─────────────────────────────────────────────── */

interface PainStepProps {
  selected: PainId[]
  onToggle: (id: PainId) => void
}

export function PainStep({ selected, onToggle }: PainStepProps) {
  return (
    <div className="space-y-6">
      <StepHeading
        eyebrow="Your day"
        title="What gets in your way most?"
        body="Pick everything that sounds familiar."
      />
      <div className="space-y-2.5">
        {PAIN_OPTIONS.map((option) => {
          const isOn = selected.includes(option.id)
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => onToggle(option.id)}
              className={`flex min-h-14 w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.98] ${
                isOn
                  ? "border-strawberry bg-strawberry-light/60"
                  : "border-border bg-card hover:border-strawberry/60"
              }`}
            >
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isOn ? "border-matcha bg-matcha text-white" : "border-border"
                }`}
              >
                {isOn && <Check className="size-3.5" strokeWidth={3} />}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{option.label}</span>
                <span className="text-xs text-muted-foreground">{option.detail}</span>
              </span>
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className="animate-fadeIn text-center text-sm text-matcha-dark">
          That is really common, and it is very fixable.
        </p>
      )}
    </div>
  )
}

/* ── 3. Solution ─────────────────────────────────────────── */

export function SolutionStep({ selected }: { selected: PainId[] }) {
  const matched = PAIN_OPTIONS.filter((option) => selected.includes(option.id))
  return (
    <div className="space-y-6">
      <StepHeading
        eyebrow="The fix"
        title="Here is how Zen Berry helps"
        body="Each piece answers something you just told us."
      />
      <div className="space-y-2.5">
        {matched.map((option) => (
          <div key={option.id} className="animate-fadeIn rounded-2xl border border-matcha/30 bg-matcha-light/25 p-4">
            <p className="text-xs text-muted-foreground">You said: {option.label.toLowerCase()}</p>
            <p className="mt-1 text-base font-bold text-foreground">{option.solutionTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{option.solutionBody}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 4. Account setup ────────────────────────────────────── */

interface SetupStepProps {
  name: string
  theme: ThemeOption["id"]
  onNameChange: (name: string) => void
  onThemeChange: (theme: ThemeOption["id"]) => void
}

export function SetupStep({ name, theme, onNameChange, onThemeChange }: SetupStepProps) {
  return (
    <div className="space-y-6">
      <StepHeading
        eyebrow="Make it yours"
        title="Set up your space"
        body="This is your account. Change any of it later in settings."
      />
      <div className="space-y-2">
        <label htmlFor="onboarding-name" className="text-sm font-medium text-foreground">
          What should we call you?
        </label>
        <input
          id="onboarding-name"
          value={name}
          maxLength={60}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Your first name"
          className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-matcha/50"
        />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Pick a look</legend>
        <div className="grid grid-cols-3 gap-2.5">
          {THEME_OPTIONS.map((option) => {
            const isOn = theme === option.id
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isOn}
                onClick={() => onThemeChange(option.id)}
                className={`rounded-2xl border-2 p-3 text-left transition-all active:scale-[0.98] ${
                  isOn ? "border-matcha bg-matcha-light/25" : "border-border bg-card hover:border-matcha/50"
                }`}
              >
                <span className="mb-2 flex gap-1">
                  {option.swatches.map((color) => (
                    <span
                      key={color}
                      className="size-5 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </span>
                <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                <span className="block text-xs text-muted-foreground">{option.description}</span>
              </button>
            )
          })}
        </div>
      </fieldset>
    </div>
  )
}

/* ── 5. First tasks ──────────────────────────────────────── */

interface FirstTasksStepProps {
  titles: string[]
  lockedTitles: string[]
  onChange: (index: number, value: string) => void
  onAddRow: () => void
  onRemoveRow: (index: number) => void
}

export function FirstTasksStep({ titles, lockedTitles, onChange, onAddRow, onRemoveRow }: FirstTasksStepProps) {
  return (
    <div className="space-y-6">
      <StepHeading
        eyebrow="First tasks"
        title="What matters most today?"
        body="Add one to three Most Important Tasks. One is enough to begin."
      />
      <div className="space-y-2.5">
        {titles.map((title, index) => {
          const isLocked = lockedTitles.includes(title.trim()) && title.trim().length > 0
          return (
            <div key={index} className="flex items-center gap-2">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-strawberry-light text-sm font-bold text-foreground">
                {isLocked ? <Check className="size-4 text-matcha-dark" strokeWidth={3} /> : index + 1}
              </span>
              <input
                value={title}
                disabled={isLocked}
                maxLength={500}
                onChange={(e) => onChange(index, e.target.value)}
                placeholder={index === 0 ? "e.g. Finish the project outline" : "Optional"}
                aria-label={`Task ${index + 1}`}
                className="h-11 min-w-0 flex-1 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-matcha/50 disabled:opacity-70"
              />
              {titles.length > 1 && !isLocked && (
                <button
                  type="button"
                  onClick={() => onRemoveRow(index)}
                  aria-label={`Remove task ${index + 1}`}
                  className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-strawberry-light/60"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
      {titles.length < MAX_FIRST_TASKS && (
        <button
          type="button"
          onClick={onAddRow}
          className="mx-auto flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-matcha-dark hover:bg-matcha-light/30"
        >
          <Plus className="size-4" />
          Add another
        </button>
      )}
    </div>
  )
}

/* ── 6. First timer ──────────────────────────────────────── */

interface FirstTimerStepProps {
  presets: TimerPreset[]
  activePresetId: string
  firstTask: string
  onSelect: (presetId: string) => void
}

export function FirstTimerStep({ presets, activePresetId, firstTask, onSelect }: FirstTimerStepProps) {
  return (
    <div className="space-y-6">
      <StepHeading
        eyebrow="First timer"
        title="Choose your first focus session"
        body={firstTask ? `Your timer will be ready for: ${firstTask}` : "Your timer will be ready on the dashboard."}
      />
      <div className="space-y-2.5">
        {presets.map((preset) => {
          const isOn = activePresetId === preset.id
          return (
            <button
              key={preset.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => onSelect(preset.id)}
              className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 px-4 py-3 text-left transition-all active:scale-[0.98] ${
                isOn ? "border-matcha bg-matcha-light/25" : "border-border bg-card hover:border-matcha/50"
              }`}
            >
              <span className="w-16 shrink-0 text-center">
                <span className="block text-2xl font-bold leading-none text-foreground">{preset.focusMinutes}</span>
                <span className="block text-xs text-muted-foreground">min focus</span>
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  {preset.name} · {preset.breakMinutes} min break
                </span>
                <span className="text-xs text-muted-foreground">{PRESET_BLURBS[preset.id] ?? ""}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
