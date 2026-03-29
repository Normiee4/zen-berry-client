import { LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimerCard } from "@/components/dashboard/Timer-card"
import { MITCard } from "@/components/dashboard/Mit-card"
import { BrainDumpCard } from "@/components/dashboard/Brain-dump-card"
import { AIInsightsCard } from "@/components/dashboard/Ai-insights-card"
import { MatchaCupCard } from "@/components/dashboard/Matcha-progress-card"

export const metadata = {
  title: "Dashboard — Zen Berry",
  description: "Your productivity hub with smart timer and daily goals",
}

export default function DashboardPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-cream via-strawberry-light/10 to-matcha-light/10">
      {/* Background Blobs */}
      <svg
        className="absolute -right-40 -top-20 h-150 w-150 opacity-20 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#B8D4B8"
          d="M44.3,-76.5C57.9,-69.5,69.8,-58.4,77.5,-44.8C85.2,-31.2,88.7,-15.6,87.7,-0.6C86.7,14.5,81.1,28.9,73.1,42.1C65.1,55.2,54.6,67,41.5,74.4C28.4,81.7,12.7,84.6,-2.5,88.9C-17.8,93.2,-35.5,98.9,-49.4,92.1C-63.3,85.3,-73.3,66,-79.3,46.7C-85.3,27.5,-87.3,8.3,-83.8,-9.3C-80.3,-26.9,-71.4,-43,-59.1,-55.2C-46.9,-67.4,-31.4,-75.7,-15.3,-79.5C0.8,-83.3,30.7,-83.5,44.3,-76.5Z"
          transform="translate(100 100)"
        />
      </svg>

      <svg
        className="absolute bottom-0 -left-32 h-125 w-125 opacity-15 pointer-events-none"
        viewBox="0 0 200 200"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#FFE2E2"
          d="M39.5,-65.8C52.9,-59.5,66.8,-52.5,74.8,-41.2C82.8,-29.9,84.9,-14.9,83.8,-0.6C82.7,13.7,78.5,27.4,71.3,39.8C64.1,52.2,54,63.3,41.4,70.8C28.8,78.3,13.7,82.1,-1.4,84.5C-16.5,87,-33,88,-46.4,81.4C-59.8,74.9,-70.1,60.8,-77.3,45.5C-84.5,30.1,-88.6,13.6,-87.1,0.9C-85.6,-11.8,-78.5,-21.1,-70.4,-29.7C-62.2,-38.2,-53.1,-46,-42.6,-54.2C-32.1,-62.4,-20.3,-71,-6.3,-71.3C7.6,-71.6,26.1,-72.1,39.5,-65.8Z"
          transform="translate(100 100)"
        />
      </svg>

      {/* Header */}
      <header className="relative z-20 border-b border-border/30 bg-white/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-matcha text-cream font-bold">
              ZB
            </div>
            <h1 className="text-xl font-bold text-foreground">Zen Berry</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
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
      <main className="relative z-10">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground">Your Focus Space</h2>
            <p className="mt-2 text-muted-foreground">
              Today is {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 auto-rows-[minmax(250px,auto)]">
            {/* Timer Card - 2 columns, 2 rows */}
            <div className="md:col-span-2 md:row-span-2">
              <TimerCard />
            </div>

            {/* MIT Card - 1 column, 2 rows */}
            <div className="md:row-span-2">
              <MITCard />
            </div>

            {/* AI Insights Card - 1 column, 1 row */}
            <div>
              <AIInsightsCard />
            </div>

            {/* Matcha Cup Card - 2 columns, 2 rows */}
            <div className="md:col-span-2 md:row-span-2">
              <MatchaCupCard />
            </div>

            {/* Brain Dump Card - 2 columns, 2 rows */}
            <div className="md:col-span-2 md:row-span-2">
              <BrainDumpCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
