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
      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-matcha"
      title="Start product tour"
    >
      <HelpCircle className="size-4" strokeWidth={1.5} />
      Help
    </button>
  )
}
