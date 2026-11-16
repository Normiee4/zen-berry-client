'use client'

import { motion } from 'framer-motion'
import { ZenseiMascot, type ZenseiPose } from '@/components/ZenseiMascot'

export interface MatchaProgressWidgetProps {
  completedCount: number
  totalCount?: number
  needsBreak?: boolean
  className?: string
}

export function MatchaProgressWidget({
  completedCount,
  totalCount = 3,
  needsBreak = false,
  className = '',
}: MatchaProgressWidgetProps) {
  // Clamp progress between 0 and totalCount
  const safeCompleted = Math.max(0, Math.min(completedCount, totalCount))
  const progressRatio = totalCount > 0 ? safeCompleted / totalCount : 0

  // Determine Zensei's pose based on MIT progress and break state
  const getZenseiPose = (): ZenseiPose => {
    if (needsBreak) return 'worried'
    if (safeCompleted === 0) return 'thinking'
    if (safeCompleted < totalCount) return 'cheerful'
    return 'celebration'
  }

  // Empathetic, anti-burnout micro-copy
  const getStatusMessage = () => {
    if (needsBreak) {
      return "You've been focusing hard. Pause and take a gentle breather."
    }
    if (safeCompleted === 0) {
      return 'Pick just one MIT to start brewing your daily matcha.'
    }
    if (safeCompleted < totalCount) {
      return `${safeCompleted} of ${totalCount} MITs done—your cup is filling up nicely!`
    }
    return 'Full cup! All 3 MITs complete. Time to rest without guilt.'
  }

  // Liquid vertical fill math inside the cup's inner bounds (y: 46 to 108)
  const innerTop = 46
  const innerBottom = 108
  const maxLiquidHeight = innerBottom - innerTop
  const currentLiquidHeight = maxLiquidHeight * progressRatio
  const currentLiquidY = innerBottom - currentLiquidHeight

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-2xl border border-[#7D9B72]/30 bg-[#FAF7F0] p-4 shadow-sm transition-all ${className}`}
    >
      {/* Left: Animated Matcha Cup Illustration & Micro-copy */}
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 shrink-0 select-none">
          <svg
            viewBox="0 0 120 130"
            className="h-full w-full overflow-visible"
            role="img"
            aria-label={`Matcha cup ${Math.round(progressRatio * 100)}% full`}
          >
            <defs>
              {/* Clip path matching the inner glass cavity of the cup */}
              <clipPath id="matcha-cup-cavity">
                <path d="M 33 44 L 87 44 L 80 104 C 79.5 108, 40.5 108, 40 104 Z" />
              </clipPath>
            </defs>

            {/* Steam Wisps (fade in as tasks are completed) */}
            <motion.g
              stroke="#C8C0B4"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
              initial={{ opacity: 0 }}
              animate={{
                opacity: safeCompleted > 0 ? 0.9 : 0.2,
                y: safeCompleted > 0 ? [0, -4, 0] : 0,
              }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 46 30 Q 43 21 47 13" />
              <path d="M 60 28 Q 57 18 61 10" />
              <path d="M 74 30 Q 71 21 75 13" />
            </motion.g>

            {/* Outer Glass Wall Background */}
            <path
              d="M 28 42 L 92 42 L 84 108 C 83 114, 37 114, 36 108 Z"
              fill="#F5EFE6"
              stroke="#829A7B"
              strokeWidth="4"
              strokeLinejoin="round"
            />

            {/* Animated Matcha Liquid Fill */}
            <g clipPath="url(#matcha-cup-cavity)">
              <motion.rect
                x="28"
                width="64"
                fill="#A3BE98"
                initial={false}
                animate={{
                  y: currentLiquidY,
                  height: currentLiquidHeight,
                }}
                transition={{ type: 'spring', stiffness: 70, damping: 14 }}
              />
              {/* Subtle Foam Surface Line */}
              {safeCompleted > 0 && (
                <motion.ellipse
                  cx="60"
                  rx="26"
                  ry="3"
                  fill="#DCE7D5"
                  initial={false}
                  animate={{ cy: currentLiquidY }}
                  transition={{ type: 'spring', stiffness: 70, damping: 14 }}
                />
              )}
            </g>

            {/* Glass Highlight Reflection (Left Side) */}
            <path
              d="M 35 49 L 41 102"
              stroke="#FFFFFF"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.65"
            />

            {/* Thick Glass Base */}
            <path
              d="M 36 107 C 37 113, 83 113, 84 107"
              fill="none"
              stroke="#829A7B"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Top Cream Rim */}
            <ellipse
              cx="60"
              cy="42"
              rx="32"
              ry="6"
              fill="#FAF7F0"
              stroke="#829A7B"
              strokeWidth="3.8"
            />

            {/* Kawaii Cup Face */}
            <g>
              {/* Soft Blush */}
              <circle cx="45" cy="79" r="5" fill="#E8B4AE" opacity="0.85" />
              <circle cx="75" cy="79" r="5" fill="#E8B4AE" opacity="0.85" />
              {/* Eyes */}
              <circle cx="51" cy="74" r="2.8" fill="#5A3E31" />
              <circle cx="69" cy="74" r="2.8" fill="#5A3E31" />
              {/* Gentle Smile */}
              <path
                d="M 56 78 Q 60 83 64 78"
                fill="none"
                stroke="#5A3E31"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </g>
          </svg>
        </div>

        {/* Progress Text & Indicators */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#5A3E31]">
              Daily Matcha Goal
            </span>
            <span className="rounded-full bg-[#A3BE98]/25 px-2 py-0.5 text-xs font-medium text-[#5A3E31]">
              {safeCompleted}/{totalCount}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-[#6B4E3D]">
            {getStatusMessage()}
          </p>
        </div>
      </div>

      {/* Right: Responsive Zensei Companion */}
      <div className="shrink-0">
        <ZenseiMascot
          pose={getZenseiPose()}
          className="h-16 w-16 md:h-20 md:w-20"
        />
      </div>
    </div>
  )
}

export default MatchaProgressWidget
