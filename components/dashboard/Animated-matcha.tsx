"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedMatchaCupProps {
  fillPercentage: number
  message?: string
  combinedTotal?: number
}

function Sparkle({ index }: { index: number }) {
  const seed = index * 137.5
  const left = 10 + (seed % 80)
  const delay = seed % 2
  const duration = 1.5 + (seed % 10) * 0.1

  return (
    <div
      className="absolute animate-sparkle text-base opacity-0 select-none"
      style={{
        left: `${left}%`,
        bottom: "0%",
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }}
    >
      ✦
    </div>
  )
}

export function AnimatedMatchaCup({
  fillPercentage,
  message = "Great job! Time to treat yourself with matcha.",
  combinedTotal = 0,
}: AnimatedMatchaCupProps) {
  const [displayFill, setDisplayFill] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  useEffect(() => {
    if (!(combinedTotal > 0 && combinedTotal % 50 === 0)) return
    const showId = setTimeout(() => setShowCelebration(true), 0)
    const hideId = setTimeout(() => setShowCelebration(false), 5000)
    return () => {
      clearTimeout(showId)
      clearTimeout(hideId)
    }
  }, [combinedTotal])

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayFill((prev) => {
        const target = fillPercentage
        const diff = target - prev
        if (Math.abs(diff) < 1) {
          clearInterval(interval)
          return target
        }
        return prev + diff * 0.1
      })
    }, 50)

    return () => clearInterval(interval)
  }, [fillPercentage])

  const isComplete = displayFill >= 90
  const progressRatio = Math.max(0, Math.min(100, displayFill)) / 100

  // Liquid vertical fill math inside the cup cavity (y: 46 to 108)
  const innerTop = 46
  const innerBottom = 108
  const maxLiquidHeight = innerBottom - innerTop
  const currentLiquidHeight = maxLiquidHeight * progressRatio
  const currentLiquidY = innerBottom - currentLiquidHeight

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Kawaii Glass Matcha Cup SVG */}
      <div className="relative h-44 w-36 select-none">
        <svg
          viewBox="0 0 120 130"
          className={`h-full w-full overflow-visible transition-transform duration-500 ${
            showCelebration ? "scale-110" : ""
          }`}
          role="img"
          aria-label={`Matcha cup ${Math.round(displayFill)}% full`}
        >
          <defs>
            {/* Clip path matching the inner glass cavity */}
            <clipPath id="animated-matcha-cavity">
              <path d="M 33 44 L 87 44 L 80 104 C 79.5 108, 40.5 108, 40 104 Z" />
            </clipPath>
          </defs>

          {/* Steam Wisps (fade in and sway as cup fills) */}
          <motion.g
            stroke="#C8C0B4"
            strokeWidth="3.2"
            strokeLinecap="round"
            fill="none"
            initial={false}
            animate={{
              opacity: displayFill > 0 ? 0.9 : 0.2,
              y: displayFill > 0 ? [0, -5, 0] : 0,
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
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
            strokeWidth="3.8"
            strokeLinejoin="round"
          />

          {/* Animated Matcha Liquid Fill */}
          <g clipPath="url(#animated-matcha-cavity)">
            <motion.rect
              x="28"
              width="64"
              fill="#A3BE98"
              initial={false}
              animate={{
                y: currentLiquidY,
                height: currentLiquidHeight,
              }}
              transition={{ type: "spring", stiffness: 70, damping: 14 }}
            />
            {/* Foam Surface Line */}
            {displayFill > 0 && (
              <motion.ellipse
                cx="60"
                rx="26"
                ry="3"
                fill="#DCE7D5"
                initial={false}
                animate={{ cy: currentLiquidY }}
                transition={{ type: "spring", stiffness: 70, damping: 14 }}
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
            strokeWidth="3.8"
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
            strokeWidth="3.6"
          />

          {/* Cute Kawaii Face */}
          <g>
            {/* Soft Blush Circles */}
            <circle cx="45" cy="79" r="5" fill="#E8B4AE" opacity="0.85" />
            <circle cx="75" cy="79" r="5" fill="#E8B4AE" opacity="0.85" />
            {/* Eyes */}
            <circle cx="51" cy="74" r="2.8" fill="#5A3E31" />
            <circle cx="69" cy="74" r="2.8" fill="#5A3E31" />
            {/* Eye Shine */}
            <circle cx="50" cy="73" r="0.9" fill="#FFFFFF" />
            <circle cx="68" cy="73" r="0.9" fill="#FFFFFF" />
            {/* Gentle Smile */}
            <path
              d="M 56 78 Q 60 83 64 78"
              fill="none"
              stroke="#5A3E31"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        </svg>

        {/* Celebration sparkles */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <Sparkle key={i} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="text-center">
        <div className="text-3xl font-bold text-matcha">{Math.round(displayFill)}%</div>
        <p className="mt-1 text-sm text-muted-foreground">Towards your matcha reward</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 w-full overflow-hidden rounded-full bg-card/50">
          <div
            className="h-full rounded-full bg-matcha transition-all duration-500 ease-out"
            style={{ width: `${displayFill}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      {showCelebration && (
        <div className="animate-fadeIn rounded-xl bg-matcha/15 px-5 py-3 text-center border border-matcha/20">
          <p className="text-sm font-semibold text-matcha">
            Reward yourself with a matcha! You finished {combinedTotal} tasks and cycles!
          </p>
        </div>
      )}
      {isComplete && !showCelebration && (
        <div className="rounded-xl bg-card/70 px-4 py-2 text-center">
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      )}
    </div>
  )
}
