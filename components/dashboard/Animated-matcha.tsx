"use client"

import { useEffect, useState } from "react"

interface AnimatedMatchaCupProps {
  fillPercentage: number
  message?: string
  onComplete?: () => void
}

export function AnimatedMatchaCup({
  fillPercentage,
  message = "Great job! Time to treat yourself with matcha ☕",
  onComplete,
}: AnimatedMatchaCupProps) {
  const [displayFill, setDisplayFill] = useState(0)

  useEffect(() => {
    // Animate fill percentage change
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
    <div className="flex flex-col items-center justify-center gap-6">
      {/* Matcha Cup SVG */}
      <div className="relative h-64 w-48">
        <svg
          viewBox="0 0 200 280"
          className="h-full w-full drop-shadow-lg"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cup Body */}
          <g>
            {/* Cup outline */}
            <path
              d="M 60 80 L 50 240 Q 50 260 70 260 L 130 260 Q 150 260 150 240 L 140 80 Z"
              fill="none"
              stroke="#2D3A2D"
              strokeWidth="2"
            />

            {/* Liquid background */}
            <defs>
              <clipPath id="cupClip">
                <path d="M 60 80 L 50 240 Q 50 260 70 260 L 130 260 Q 150 260 150 240 L 140 80 Z" />
              </clipPath>
            </defs>

            {/* Animated liquid fill */}
            <g clipPath="url(#cupClip)">
              {/* Gradient fill */}
              <defs>
                <linearGradient id="matchaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#86A788" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#5A7A5C" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Liquid with wave effect */}
              <rect
                x="50"
                y={260 - (displayFill / 100) * 180}
                width="100"
                height={(displayFill / 100) * 180}
                fill="url(#matchaGradient)"
              />

              {/* Wave animation on surface */}
              {displayFill > 0 && (
                <g opacity="0.3">
                  <path
                    d={`M 50 ${260 - (displayFill / 100) * 180} Q 65 ${260 - (displayFill / 100) * 180 - 3} 80 ${260 - (displayFill / 100) * 180} T 110 ${260 - (displayFill / 100) * 180} T 150 ${260 - (displayFill / 100) * 180}`}
                    stroke="#FFFFFF"
                    strokeWidth="1"
                    fill="none"
                  />
                </g>
              )}
            </g>
          </g>

          {/* Cute face on cup */}
          <g>
            {/* Left eye */}
            <circle cx="75" cy="140" r="4" fill="#2D3A2D" />
            {/* Right eye */}
            <circle cx="125" cy="140" r="4" fill="#2D3A2D" />
            
            {/* Mouth - smile */}
            <path
              d="M 85 160 Q 100 170 115 160"
              stroke="#2D3A2D"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />

            {/* Blush marks */}
            <ellipse cx="65" cy="155" rx="6" ry="4" fill="#FFCFCF" opacity="0.6" />
            <ellipse cx="135" cy="155" rx="6" ry="4" fill="#FFCFCF" opacity="0.6" />
          </g>

          {/* Cup handle */}
          <path
            d="M 140 120 Q 165 140 140 160"
            stroke="#2D3A2D"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Saucer */}
          <ellipse cx="100" cy="270" rx="55" ry="8" fill="#FFE2E2" opacity="0.7" />
          <ellipse cx="100" cy="268" rx="55" ry="6" fill="none" stroke="#2D3A2D" strokeWidth="1.5" />
        </svg>

        {/* Completion sparkles */}
        {isComplete && (
          <>
            <div className="absolute -right-4 top-12 animate-bounce text-2xl">✨</div>
            <div className="absolute -left-4 top-20 animate-bounce text-2xl delay-150">✨</div>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-bounce text-2xl delay-300">
              ✨
            </div>
          </>
        )}
      </div>

      {/* Fill Percentage */}
      <div className="text-center">
        <div className="text-5xl font-bold text-matcha">{Math.round(displayFill)}%</div>
        <p className="mt-1 text-sm text-muted-foreground">Tasks completed today</p>
      </div>

      {/* Message */}
      {isComplete && (
        <div className="rounded-xl border border-strawberry bg-strawberry-light/50 p-4 text-center">
          <p className="font-medium text-foreground">{message}</p>
        </div>
      )}

      {/* Progress Bar */}
      <div className="w-full max-w-xs space-y-2">
        <div className="h-3 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-gradient-to-r from-matcha to-matcha-light transition-all duration-500"
            style={{ width: `${displayFill}%` }}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground">
          {Math.round(displayFill) < 100
            ? `${100 - Math.round(displayFill)} tasks to go!`
            : "🎉 All tasks done!"}
        </p>
      </div>
    </div>
  )
}
