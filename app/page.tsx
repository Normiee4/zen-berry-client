import type { Metadata } from "next"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase-server"
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

export default async function Home() {
  const cookieStore = await cookies()
  const betaCookie = cookieStore.get("beta_bypass")

  if (betaCookie?.value === "true") {
    redirect("/dashboard")
  }

  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (session) {
    redirect("/dashboard")
  }

  return <LandingContent />
}
