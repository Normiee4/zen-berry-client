"use client"

import { useMemo } from "react"
import type { DriveStep } from "driver.js"
import { useProductTourStore } from "@/store/product-tour-store"
import { useResponsive } from "@/hooks/useResponsive"

const STEP_CONTENT = [
  {
    selector: '[data-tour="step-2"]',
    popover: {
      title: "Pomodoro Timer",
      description:
        "Customize your focus sessions — set durations, save presets, and pick alarm sounds from the bell icon. Start, pause, and reset anytime.",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-3"]',
    popover: {
      title: "Top 3 MITs",
      description:
        "Your Most Important Tasks. Pick up to 3 high-leverage tasks each day. They persist until you mark them done.",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-4"]',
    popover: {
      title: "Brain Dump",
      description:
        "Quick-capture every thought here. Drag tasks up to your MIT list when they become priorities.",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-5"]',
    popover: {
      title: "Matcha Progress",
      description:
        "Complete an MIT and watch your Matcha cup fill up! Every task done, a sip taken.",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-6"]',
    popover: {
      title: "Streak Card",
      description:
        "Every completed session and finished MIT keeps your streak alive. Stay consistent!",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-7"]',
    popover: {
      title: "Daily Sip",
      description:
        "A mindful tip to refresh your focus between sessions. Small pauses, big gains.",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-8"]',
    popover: {
      title: "Today Recap",
      description:
        "Your daily accomplishments at a glance — pomodoros, tasks completed, and more.",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-9"]',
    popover: {
      title: "Zensei Insights",
      description:
        "AI-powered analysis of your productivity patterns. More features coming soon!",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-sidebar"]',
    popover: {
      title: "Explore More",
      description:
        "Open the sidebar to check out Pins for quick notes and Productivity for detailed analytics.",
      align: "start",
    },
  },
  {
    selector: '[data-tour="step-help"]',
    popover: {
      title: "Need a Refresher?",
      description:
        "Click this Help button anytime to restart this tour. Zen Berry is here whenever you need guidance.",
      align: "start",
    },
  },
] as const

const desktopSides = ["right", "right", "right", "right", "right", "left", "left", "left", "bottom", "bottom"] as const

export function useProductTour() {
  const tourTriggered = useProductTourStore((s) => s.tourTriggered)
  const clearTourTrigger = useProductTourStore((s) => s.clearTourTrigger)
  const triggerTour = useProductTourStore((s) => s.triggerTour)
  const { isMobile } = useResponsive()

  const steps = useMemo<DriveStep[]>(
    () =>
      STEP_CONTENT.map((content, i) => ({
        element: content.selector,
        popover: {
          ...content.popover,
          side: isMobile ? "bottom" : desktopSides[i],
        },
      })),
    [isMobile],
  )

  return {
    startTour: triggerTour,
    isActive: tourTriggered,
    steps,
    onClose: clearTourTrigger,
  }
}
