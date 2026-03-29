"use client"

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BrainDumpCard() {
  const notes = [
    "Call dentist tomorrow",
    "Buy groceries - milk, eggs, strawberries",
    "Check latest project updates",
  ]

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border bg-linear-to-br from-white/80 to-matcha-light/20 p-6 backdrop-blur">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Brain Dump</h3>

      <div className="mb-4 flex flex-1 flex-col gap-2 overflow-y-auto">
        {notes.map((note, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-lg bg-white/50 p-3 hover:bg-white/70 transition-colors group"
          >
            <div className="mt-1 shrink-0">💭</div>
            <p className="flex-1 text-sm text-foreground">{note}</p>
            <button className=" shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="size-4 text-muted-foreground hover:text-red-500" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-auto">
        <textarea
          placeholder="What's on your mind?"
          className="w-full rounded-lg border border-border bg-white/50 p-3 text-sm placeholder-muted-foreground focus:border-matcha focus:outline-none resize-none"
          rows={2}
        />
        <Button className="mt-2 w-full bg-matcha text-cream hover:bg-matcha-light" size="sm">
          Add note
        </Button>
      </div>
    </div>
  )
}
