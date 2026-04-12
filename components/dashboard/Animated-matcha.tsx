"use client"

import { useEffect, useState } from "react"

interface AnimatedMatchaCupProps {
  fillPercentage: number
  message?: string
}

export function AnimatedMatchaCup({
  fillPercentage,
  message = "Great job! Time to treat yourself with matcha.",
}: AnimatedMatchaCupProps) {
  const [displayFill, setDisplayFill] = useState(0)

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
      <div className="relative h-40 w-32">
        <svg
          viewBox="0 0 200 280"
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cup Body */}
          <g>
            <path
              d="M 60 80 L 50 240 Q 50 260 70 260 L 130 260 Q 150 260 150 240 L 140 80 Z"
              fill="#B8D4B8"
              stroke="#86A788"
              strokeWidth="2"
            />

            <defs>
              <clipPath id="cupClip">
                <path d="M 60 80 L 50 240 Q 50 260 70 260 L 130 260 Q 150 260 150 240 L 140 80 Z" />
              </clipPath>
              <linearGradient id="matchaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#86A788" />
                <stop offset="100%" stopColor="#5A7A5C" />
              </linearGradient>
            </defs>

            <g clipPath="url(#cupClip)">
              <rect
                x="50"
                y={260 - (displayFill / 100) * 180}
                width="100"
                height={(displayFill / 100) * 180}
                fill="url(#matchaGradient)"
                className="transition-all duration-300"
              />
            </g>
          </g>

          {/* Cute face */}
          <g>
            <circle cx="80" cy="150" r="5" fill="#2D3A2D" />
            <circle cx="120" cy="150" r="5" fill="#2D3A2D" />
            <path
              d="M 90 175 Q 100 185 110 175"
              stroke="#2D3A2D"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            <ellipse cx="65" cy="165" rx="8" ry="5" fill="#FFCFCF" opacity="0.5" />
            <ellipse cx="135" cy="165" rx="8" ry="5" fill="#FFCFCF" opacity="0.5" />
          </g>

          {/* Cup rim */}
          <ellipse cx="100" cy="80" rx="40" ry="8" fill="#B8D4B8" stroke="#86A788" strokeWidth="2" />
        </svg>

        {/* Sparkles */}
        {isComplete && (
          <>
            <div className="absolute -right-2 top-4 animate-bounce text-lg">&#x2728;</div>
            <div className="absolute -left-2 top-8 animate-bounce delay-150 text-lg">&#x2728;</div>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="text-center">
        <div className="text-3xl font-bold text-matcha">{Math.round(displayFill)}%</div>
        <p className="mt-1 text-sm text-muted-foreground">Tasks completed</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-xs">
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/50">
          <div
            className="h-full rounded-full bg-matcha transition-all duration-500"
            style={{ width: `${displayFill}%` }}
          />
        </div>
      </div>

      {/* Message */}
      {isComplete && (
        <div className="rounded-xl bg-white/70 px-4 py-2 text-center">
          <p className="text-sm font-medium text-foreground">{message}</p>
        </div>
      )}
    </div>
  )
}
