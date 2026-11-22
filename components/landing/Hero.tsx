"use client"

import { ProductivityDashboard } from "@/components/landing/illustrations/Productivity-dashboard"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Timer } from "lucide-react"
import Link from "next/link"

const authEnabled =
  process.env.NEXT_PUBLIC_ENABLE_LOGIN === "true" ||
  process.env.NEXT_PUBLIC_ENABLE_SIGNUP === "true"

export function Hero() {
  const handleScrollToTimer = () => {
    const el = document.getElementById("try-timer")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <section className="relative overflow-hidden bg-cream">
      {/* Layered Flat Circles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-28 -top-28 size-[28rem] rounded-full bg-matcha-light/30" />
        <div className="absolute right-12 top-16 size-56 rounded-full border border-matcha/20 bg-white/25" />
        <div className="absolute -bottom-28 -left-24 size-[26rem] rounded-full bg-strawberry-light/55" />
        <div className="absolute bottom-24 left-12 size-24 rounded-full border border-strawberry/25 bg-strawberry-light/40 shadow-sm" />
        <div className="absolute left-1/3 top-1/4 size-44 rounded-full bg-strawberry-light/35" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="flex flex-col items-start">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-strawberry/40 bg-white/85 px-4 py-1.5 text-sm font-medium text-strawberry-dark shadow-[0_2px_10px_rgba(184,74,74,0.1)]">
              <Sparkles className="size-4" aria-hidden="true" />
              <span>Your mindful productivity companion</span>
            </div>

            {/* Headline */}
            <h1 className="mb-6 text-balance text-4xl font-bold leading-tight tracking-tight text-matcha-dark sm:text-5xl lg:text-6xl">
              Focus sweetly,{" "}
              <span className="relative inline-block text-strawberry-dark">
                <span className="relative z-10">grow daily</span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-1.5 left-0 z-0 h-3 w-full rounded-full bg-strawberry/30"
                />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-8 max-w-lg text-pretty text-lg text-matcha-dark/80">
              A strawberry-matcha productivity app with a customizable Pomodoro timer.
              Build steady focus habits and gentle breaks — designed to keep you calm and grounded.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="bg-matcha px-8 text-white shadow-[0_10px_24px_-6px_rgba(62,89,64,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:-translate-y-0.5 hover:bg-matcha-dark active:translate-y-0"
              >
                <Link
                  href={authEnabled ? "/auth/signup" : "/auth/waitlist"}
                  className="inline-flex items-center gap-2"
                >
                  Get Started — It&apos;s Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleScrollToTimer}
                className="border-matcha/35 bg-white/85 text-matcha-dark shadow-[0_6px_18px_-6px_rgba(62,89,64,0.18)] transition-all hover:-translate-y-0.5 hover:bg-matcha-light/30 hover:text-matcha-dark active:translate-y-0"
              >
                <Timer className="mr-2 size-4" aria-hidden="true" />
                Try Free Timer
              </Button>
            </div>
          </div>

          {/* Right Content - Interactive Pomodoro Trial */}
          <div className="relative flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute -right-6 -top-6 size-48 rounded-full bg-matcha-light/40"
            />
            <div
              aria-hidden="true"
              className="absolute -bottom-6 -left-6 size-44 rounded-full bg-strawberry-light/65"
            />

            <div className="relative z-10 w-full max-w-md">
              <ProductivityDashboard />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
