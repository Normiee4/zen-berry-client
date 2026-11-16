'use client'

import { ZenseiMascot } from '@/components/ZenseiMascot'
import { Coffee, Clock } from 'lucide-react'

export interface BreakReminderBannerProps {
  onTakeBreak: () => void
  onSnooze: () => void
  className?: string
}

export function BreakReminderBanner({
  onTakeBreak,
  onSnooze,
  className = '',
}: BreakReminderBannerProps) {
  return (
    <div
      role="region"
      aria-label="Break reminder"
      className={`rounded-2xl border border-[#C9645B]/40 bg-[#FAF7F0] p-4 text-[#5A3E31] shadow-md transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Worried Zensei Companion */}
        <ZenseiMascot pose="worried" className="w-14 h-14 shrink-0 select-none" />

        {/* Content */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <h4 className="font-semibold text-sm sm:text-base text-[#5A3E31]">
            Gentle check-in from Zensei
          </h4>
          <p className="text-xs sm:text-sm leading-relaxed text-[#6B4E3D]">
            You&apos;ve been focusing for 90 minutes straight. Rest is productive too—ready for a quick breather?
          </p>

          {/* Guilt-free Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <button
              type="button"
              onClick={onTakeBreak}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#A3BE98] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#8ea884] active:scale-95"
            >
              <Coffee className="h-3.5 w-3.5" />
              Take a Break
            </button>
            <button
              type="button"
              onClick={onSnooze}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#9E473F]/30 bg-white/70 px-3 py-1.5 text-xs font-medium text-[#6B4E3D] transition hover:bg-white active:scale-95"
            >
              <Clock className="h-3.5 w-3.5" />
              Keep Going (+15m)
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreakReminderBanner
