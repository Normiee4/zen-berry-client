"use client"

import { useEffect, useState } from "react"

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
      className="absolute animate-sparkle text-base opacity-0"
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

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Matcha Cup SVG */}
      <div className="relative h-44 w-36">
        <svg
          viewBox="0 0 200 300"
          className={`h-full w-full transition-transform duration-500 ${showCelebration ? "scale-110" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ceramic gradient for cup body */}
            <linearGradient id="ceramicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E8F0E8" />
              <stop offset="50%" stopColor="#D0E0D0" />
              <stop offset="100%" stopColor="#B8D4B8" />
            </linearGradient>
            {/* Matcha liquid gradient */}
            <linearGradient id="matchaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#86A788" />
              <stop offset="50%" stopColor="#6B8D6D" />
              <stop offset="100%" stopColor="#5A7A5C" />
            </linearGradient>
            {/* Matcha surface gradient */}
            <radialGradient id="surfaceGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#A8C8A8" />
              <stop offset="100%" stopColor="#86A788" />
            </radialGradient>
            {/* Shadow gradient */}
            <linearGradient id="shadowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.08)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </linearGradient>
            <clipPath id="cupClip">
              <path d="M 55 85 L 45 255 Q 45 280 70 280 L 130 280 Q 155 280 155 255 L 145 85 Z" />
            </clipPath>
          </defs>

          {/* Shadow under saucer */}
          <ellipse cx="100" cy="290" rx="65" ry="8" fill="url(#shadowGrad)" />

          {/* Saucer */}
          <ellipse cx="100" cy="275" rx="60" ry="10" fill="#D0E0D0" stroke="#86A788" strokeWidth="1.5" />
          <ellipse cx="100" cy="273" rx="48" ry="7" fill="#E8F0E8" />

          {/* Cup handle */}
          <path
            d="M 150 140 Q 185 140 185 180 Q 185 220 150 220"
            fill="none"
            stroke="#B8D4B8"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M 150 145 Q 178 145 178 180 Q 178 215 150 215"
            fill="none"
            stroke="#D0E0D0"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Cup body */}
          <path
            d="M 55 85 L 45 255 Q 45 280 70 280 L 130 280 Q 155 280 155 255 L 145 85 Z"
            fill="url(#ceramicGrad)"
            stroke="#86A788"
            strokeWidth="2"
          />

          {/* Cup highlight */}
          <path
            d="M 55 85 L 48 240 Q 48 260 62 268"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.25"
          />

          {/* Matcha fill */}
          <g clipPath="url(#cupClip)">
            <rect
              x="45"
              y={280 - (displayFill / 100) * 195}
              width="110"
              height={(displayFill / 100) * 195}
              fill="url(#matchaGrad)"
              className="transition-all duration-300 ease-out"
            />
            {/* Surface shimmer */}
            {displayFill > 0 && (
              <ellipse
                cx="100"
                cy={280 - (displayFill / 100) * 195 + 4}
                rx="38"
                ry="5"
                fill="url(#surfaceGrad)"
                opacity="0.6"
                className="transition-all duration-300"
              />
            )}
          </g>

          {/* Cute face on cup */}
          <g>
            {/* Eyes */}
            <circle cx="80" cy="160" r="5" fill="#2D3A2D" />
            <circle cx="120" cy="160" r="5" fill="#2D3A2D" />
            {/* Eye shine */}
            <circle cx="78" cy="158" r="1.8" fill="white" opacity="0.7" />
            <circle cx="118" cy="158" r="1.8" fill="white" opacity="0.7" />
            {/* Smile */}
            <path
              d="M 90 180 Q 100 190 110 180"
              stroke="#2D3A2D"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Blush */}
            <ellipse cx="65" cy="175" rx="9" ry="5.5" fill="#FFCFCF" opacity="0.5" />
            <ellipse cx="135" cy="175" rx="9" ry="5.5" fill="#FFCFCF" opacity="0.5" />
          </g>

          {/* Cup rim */}
          <ellipse cx="100" cy="85" rx="47" ry="9" fill="#E8F0E8" stroke="#86A788" strokeWidth="2" />
          <ellipse cx="100" cy="83" rx="37" ry="6" fill="#B8D4B8" />

          {/* Steam wisps */}
          {displayFill > 0 && (
            <>
              <path
                d="M 80 75 Q 75 55 82 40 Q 89 25 84 10"
                fill="none"
                stroke="#B8D4B8"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.4"
                className="animate-steam origin-bottom"
              />
              <path
                d="M 100 70 Q 95 50 102 35 Q 109 20 104 5"
                fill="none"
                stroke="#B8D4B8"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.3"
                className="animate-steam origin-bottom"
                style={{ animationDelay: "0.4s" }}
              />
              <path
                d="M 120 75 Q 115 55 122 40 Q 129 25 124 10"
                fill="none"
                stroke="#B8D4B8"
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.35"
                className="animate-steam origin-bottom"
                style={{ animationDelay: "0.8s" }}
              />
            </>
          )}
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
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
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
        <div className="rounded-xl bg-white/70 px-4 py-2 text-center">
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      )}
    </div>
  )
}
