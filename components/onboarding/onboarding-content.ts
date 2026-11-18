export type PainId = "overwhelm" | "unfinished" | "burnout" | "unclear"

export interface PainOption {
  id: PainId
  label: string
  detail: string
  solutionTitle: string
  solutionBody: string
}

export const PAIN_OPTIONS: PainOption[] = [
  {
    id: "overwhelm",
    label: "My head is full of tasks",
    detail: "Everything feels urgent, so nothing gets started.",
    solutionTitle: "Brain Dump",
    solutionBody: "Get every thought out of your head in seconds. Sort it later, not while you are trying to focus.",
  },
  {
    id: "unclear",
    label: "I don't know what matters most",
    detail: "My to-do list is long and flat.",
    solutionTitle: "Top 3 MITs",
    solutionBody: "Pick up to three Most Important Tasks each day. Everything else can wait.",
  },
  {
    id: "unfinished",
    label: "I start things but rarely finish",
    detail: "Distractions pull me away mid-task.",
    solutionTitle: "Focus Timer",
    solutionBody: "Work in short, protected sprints with a clear finish line. One sprint at a time.",
  },
  {
    id: "burnout",
    label: "I push too hard, then crash",
    detail: "I forget to rest until I'm drained.",
    solutionTitle: "Streaks & gentle breaks",
    solutionBody: "Built-in break reminders and a kind streak that rewards showing up, not grinding.",
  },
]

export interface ThemeOption {
  id: "light-zen" | "warm-earth" | "cozy-dark"
  label: string
  description: string
  swatches: [string, string, string]
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "light-zen",
    label: "Light Zen",
    description: "Cream, strawberry, matcha",
    swatches: ["#FFFDEC", "#FFCFCF", "#86A788"],
  },
  {
    id: "warm-earth",
    label: "Warm Earth",
    description: "Soft beige and earth tones",
    swatches: ["#F5F0E8", "#E8E0D0", "#2D2820"],
  },
  {
    id: "cozy-dark",
    label: "Cozy Dark",
    description: "Forest green for evenings",
    swatches: ["#2A3D2C", "#3A523C", "#EDE9E0"],
  },
]

export const ONBOARDING_PRESET_IDS = ["sprint", "classic", "deep"] as const

export const PRESET_BLURBS: Record<string, string> = {
  sprint: "Easy start. Great if focus feels hard today.",
  classic: "The proven rhythm. Our suggestion for a first session.",
  deep: "For big, absorbing work once you are warmed up.",
}

export interface OnboardingPhase {
  id: string
  label: string
}

export const PHASES: OnboardingPhase[] = [
  { id: "hook", label: "Hello" },
  { id: "pain", label: "Your day" },
  { id: "solution", label: "The fix" },
  { id: "setup", label: "Make it yours" },
  { id: "tasks", label: "First tasks" },
  { id: "timer", label: "First timer" },
]

export const MAX_FIRST_TASKS = 3
