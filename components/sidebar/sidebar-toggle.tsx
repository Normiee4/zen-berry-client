"use client"

import { Menu } from "lucide-react"

interface SidebarToggleProps {
  onClick: () => void
}

export function SidebarToggle({ onClick }: SidebarToggleProps) {
  return (
    <button
      onClick={onClick}
      data-tour="step-sidebar"
      className="flex items-center justify-center rounded-xl p-2 text-muted-foreground transition-colors hover:bg-strawberry/10 hover:text-foreground"
      aria-label="Toggle sidebar"
    >
      <Menu className="size-6" strokeWidth={1.5} />
    </button>
  )
}
