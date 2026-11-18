"use client"

import { HelpCircle } from "lucide-react"

interface TourHelpButtonProps {
  onClick: () => void
}

export function TourHelpButton({ onClick }: TourHelpButtonProps) {
  return (
    <button
      onClick={onClick}
      data-tour="step-help"
      className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-matcha sm:px-3"
      title="Start product tour"
      aria-label="Start product tour"
    >
      <HelpCircle className="size-5 sm:size-4" strokeWidth={1.5} />
      <span className="hidden sm:inline">Help</span>
    </button>
  )
}
