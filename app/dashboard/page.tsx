import { AIInsightsCard } from "@/components/dashboard/Ai-insights-card"
import { BrainDumpCard } from "@/components/dashboard/Brain-dump-card"
import { MatchaProgressCard } from "@/components/dashboard/Matcha-progress-card"
import { MITCard } from "@/components/dashboard/Mit-card"
import { StreakCard } from "@/components/dashboard/Streak-card"
import { TimerCard } from "@/components/dashboard/Timer-card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export const metadata = {
  title: "Dashboard — Zen Berry",
  description: "Your productivity hub with smart timer and daily goals",
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-border/30 bg-white/50">
        <div className="mx-auto flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-matcha text-cream font-bold">
              ZB
            </div>
            <h1 className="text-xl font-bold text-foreground">Zen Berry</h1>
          </div>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div className="text-right sm:text-left">
              <p className="text-sm font-medium text-foreground">Welcome back!</p>
              <p className="text-xs text-muted-foreground">Jane Doe</p>
            </div>
            <Button size="sm" variant="outline" className="border-border">
              <LogOut className="mr-2 size-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Bento Grid - 2 columns on desktop */}
        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-3">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            <TimerCard />
            <StreakCard />
            <MatchaProgressCard />
          </div>

          {/* Middle Column */}
          <div className="flex flex-col gap-6">
            <MITCard />
            <BrainDumpCard />  
          </div>

          {/* Left Column */}
          <div className="flex">
             <AIInsightsCard />
          </div>
        </div>
      </main>
    </div>
  )
}
