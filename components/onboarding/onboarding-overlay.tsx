"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, ListChecks, StickyNote, Sparkles, X } from "lucide-react"

interface Slide {
  title: string
  subtitle: string
  body: string
}

const slides: Slide[] = [
  {
    title: "Welcome to Zen Berry",
    subtitle: "Your cozy focus companion",
    body: "A sweet space to plan your day, focus in sprints, and celebrate progress — all without the noise.",
  },
  {
    title: "Pick Your Top 3",
    subtitle: "Most Important Tasks",
    body: "Each day, choose up to 3 MITs. These are your non-negotiable priorities. Everything else comes second.",
  },
  {
    title: "Brain Dump Everything",
    subtitle: "Clear your mind",
    body: "Got random thoughts? Dump them here. Quick-capture any task so nothing slips away — promote to MIT when ready.",
  },
  {
    title: "Focus in Sprints",
    subtitle: "Pomodoro timer",
    body: "Work in focused bursts with built-in break reminders. Every completed session builds your streak and fills your matcha cup.",
  },
  {
    title: "Grow with Insights",
    subtitle: "AI-powered review",
    body: "End your day with a gentle AI insight from Zensei. Track streaks, unlock milestones, and reward yourself with matcha.",
  },
]

interface OnboardingOverlayProps {
  onComplete: () => void
}

export function OnboardingOverlay({ onComplete }: OnboardingOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const totalSlides = slides.length
  const isLast = currentSlide === totalSlides - 1

  const handleNext = () => {
    if (isLast) {
      handleComplete()
    } else {
      setCurrentSlide((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1))
  }

  const handleComplete = () => {
    setIsExiting(true)
    setTimeout(onComplete, 400)
  }

  const slide = slides[currentSlide]

  const renderIllustration = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex justify-center">
            <img
              src="/Zen-berry Logo.png"
              alt="Zen Berry"
              className="h-28 w-28 object-contain"
            />
          </div>
        )
      case 1:
        return (
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center rounded-2xl bg-strawberry/20 p-5">
              <ListChecks className="size-16 text-strawberry" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex h-10 w-32 items-center justify-center rounded-xl border-2 text-sm font-semibold ${
                    i === currentSlide + 1
                      ? "border-matcha bg-matcha/10 text-matcha"
                      : "border-strawberry/30 bg-white/50 text-strawberry/60"
                  }`}
                >
                  MIT #{i}
                </div>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="flex justify-center">
            <div className="flex items-center justify-center rounded-2xl bg-strawberry/20 p-5">
              <StickyNote className="size-16 text-strawberry" strokeWidth={1.5} />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="flex justify-center">
            <img
              src="/matcha_illustration.png"
              alt="Matcha cup"
              className="h-36 w-36 object-contain"
            />
          </div>
        )
      case 4:
        return (
          <div className="flex justify-center">
            <div className="rounded-full bg-matcha/15 p-6">
              <Sparkles className="size-16 text-matcha" strokeWidth={1.5} />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-cream/95 backdrop-blur-sm transition-opacity duration-400 ${
        isExiting ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Skip button */}
      <button
        onClick={handleComplete}
        className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry/10 hover:text-foreground"
      >
        Skip
        <X className="size-4" />
      </button>

      {/* Card */}
      <div className="mx-4 w-full max-w-lg">
        <div className="rounded-3xl border border-matcha-dark/15 bg-white p-10 shadow-xl">
          {/* Illustration */}
          <div className="mb-8 min-h-[140px]">{renderIllustration(currentSlide)}</div>

          {/* Content */}
          <div className="space-y-3 text-center" key={currentSlide}>
            <p className="text-sm font-semibold uppercase tracking-widest text-matcha">
              {slide.subtitle}
            </p>
            <h2 className="text-2xl font-bold text-foreground">{slide.title}</h2>
            <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
              {slide.body}
            </p>
          </div>

          {/* Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {slides.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentSlide
                    ? "w-8 bg-matcha"
                    : "w-2 bg-strawberry/30"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              className="flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry/10 hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <ChevronLeft className="size-4" />
              Back
            </button>

            <button
              onClick={handleNext}
              className={`rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all ${
                isLast
                  ? "bg-matcha shadow-lg shadow-matcha/25 hover:bg-matcha-dark"
                  : "bg-strawberry shadow-lg shadow-strawberry/25 hover:bg-strawberry/90"
              }`}
            >
              {isLast ? "Start Focusing" : "Next"}
              {!isLast && <ChevronRight className="ml-1.5 inline size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}