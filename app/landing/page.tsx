import type { Metadata } from "next"
import { LandingContent } from "@/components/landing/landing-content"

export const metadata: Metadata = {
  title: "Zen Berry — Free Pomodoro Timer & Mindful Productivity Tool",
  description:
    "Stay focused without burnout using Zen Berry, a free online Pomodoro timer and mindful productivity tool with task management, focus streaks, and gentle analytics.",
  keywords: [
    "pomodoro timer",
    "free pomodoro timer",
    "online pomodoro timer",
    "productivity tool",
    "mindful productivity app",
    "focus timer",
    "task manager",
    "study timer",
    "Zen Berry",
  ],
  alternates: {
    canonical: "/landing",
  },
}

export default function LandingPage() {
  return <LandingContent />
}
