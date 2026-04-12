import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimerCard } from "@/components/dashboard/Timer-card"
import { StreakCard } from "@/components/dashboard/Streak-card"
import { MITCard } from "@/components/dashboard/Mit-card"
import { BrainDumpCard } from "@/components/dashboard/Brain-dump-card"
import { AIInsightsCard } from "@/components/dashboard/Ai-insights-card"
import { MatchaProgressCard } from "@/components/dashboard/Matcha-progress-card"

export const metadata = {
  title: "Dashboard — Zen Berry",
  description: "Your productivity hub with smart timer and daily goals",
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="border-b border-border/30 bg-white/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-matcha text-cream font-bold">
              ZB
            </div>
            <h1 className="text-xl font-bold text-foreground">Zen Berry</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Bento Grid - 2 columns on desktop */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="flex flex-col gap-6">
            {/* Timer Card */}
            <TimerCard />
            
            {/* Streak Card */}
            <StreakCard />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            {/* MIT Card */}
            <MITCard />
            
            {/* Brain Dump Card */}
            <BrainDumpCard />
          </div>
        </div>

        {/* Bottom Row - Full Width */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* AI Insights Card */}
          <AIInsightsCard />
          
          {/* Matcha Cup Reward Card */}
          <MatchaProgressCard />
        </div>
      </main>
    </div>
  )
}
