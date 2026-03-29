"use client"

import { CheckCircle2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MITCard() {
  const mits = [
    { id: 1, title: "Complete project proposal", completed: false },
    { id: 2, title: "Review team feedback", completed: true },
    { id: 3, title: "Update documentation", completed: false },
  ]

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-linear-to-br from-white/80 to-strawberry-light/30 p-6 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Today&apos;s MITs</h3>
        <span className="rounded-full bg-strawberry/20 px-3 py-1 text-xs font-medium text-foreground">
          2 of 3
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3">
        {mits.map((mit) => (
          <div
            key={mit.id}
            className="flex items-center gap-3 rounded-lg bg-white/50 p-3 hover:bg-white/70 transition-colors"
          >
            <button
              className={`shrink-0 rounded-full ${
                mit.completed
                  ? "bg-matcha text-white"
                  : "border-2 border-matcha"
              } w-5 h-5 flex items-center justify-center`}
            >
              {mit.completed && <CheckCircle2 className="size-4" />}
            </button>
            <span
              className={`flex-1 text-sm ${
                mit.completed
                  ? "line-through text-muted-foreground"
                  : "text-foreground"
              }`}
            >
              {mit.title}
            </span>
          </div>
        ))}
      </div>

      <Button
        variant="outline"
        className="mt-4 w-full border-matcha text-matcha hover:bg-matcha/10"
        size="sm"
      >
        <Plus className="mr-2 size-4" />
        Add task
      </Button>
    </div>
  )
}
