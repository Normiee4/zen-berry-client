"use client"

export function StreakCard() {
  return (
    <div className="flex items-center gap-4 rounded-3xl bg-strawberry-light/30 p-4">
      {/* Matcha Cup Icon */}
      <div className="flex size-10 items-center justify-center">
        <svg width="32" height="32" viewBox="0 0 40 40" fill="none">
          <rect x="8" y="12" width="24" height="20" rx="4" fill="#B8D4B8" />
          <rect x="10" y="14" width="20" height="16" rx="3" fill="#86A788" />
          <circle cx="15" cy="22" r="1.5" fill="#2D3A2D" />
          <circle cx="25" cy="22" r="1.5" fill="#2D3A2D" />
          <path d="M18 26 Q20 28 22 26" stroke="#2D3A2D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <ellipse cx="20" cy="12" rx="10" ry="2" fill="#B8D4B8" />
        </svg>
      </div>

      {/* Stats */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">5</span>
          <span className="text-sm text-muted-foreground">day streak</span>
          <span className="ml-1 text-base">&#x1F331;</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <span>3 pomodoros today</span>
          <span className="text-base">&#x1F353;</span>
        </div>
      </div>
    </div>
  )
}
