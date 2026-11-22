"use client"

import { Sprout, Target, Timer } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Set Your Intentions",
    description: "Start each day by adding your tasks. No pressure — just gentle intentions for what you'd like to accomplish.",
    icon: Target,
  },
  {
    number: "02",
    title: "Focus in Sessions",
    description: "Use the Pomodoro timer to work in focused bursts. We'll remind you to breathe and take breaks.",
    icon: Timer,
  },
  {
    number: "03",
    title: "Grow Your Garden",
    description: "Watch your productivity garden bloom as you complete tasks. Celebrate your growth, no matter how small.",
    icon: Sprout,
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden bg-cream py-20 sm:py-28">
      {/* Flat Background Circles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-12 size-64 rounded-full bg-matcha-light/25" />
        <div className="absolute bottom-12 right-1/4 size-64 rounded-full bg-strawberry-light/45" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-matcha/25 bg-matcha-light/45 px-4 py-1.5 text-sm font-medium text-matcha-dark shadow-[0_2px_10px_rgba(62,89,64,0.08)]">
            How It Works
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-matcha-dark sm:text-4xl">
            Simple steps to a calmer workflow
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-matcha-dark/75">
            Getting started takes just a few minutes. Here&apos;s how Zen Berry helps you focus.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-12 hidden h-0.5 w-full bg-matcha-light/60 md:block" />
              )}

              <div className="relative flex flex-col items-center rounded-2xl border border-matcha-light/50 bg-white/80 p-6 text-center shadow-[0_12px_28px_-12px_rgba(62,89,64,0.14),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-[0_18px_36px_-12px_rgba(62,89,64,0.2)]">
                {/* Step Number with Lucide Icon */}
                <div className="relative mb-5">
                  <div className="flex size-20 items-center justify-center rounded-2xl border border-matcha-light/70 bg-white shadow-[0_10px_20px_-6px_rgba(62,89,64,0.16),inset_0_1px_1px_rgba(255,255,255,1)] ring-4 ring-strawberry-light/60">
                    <step.icon className="size-8 text-matcha-dark" aria-hidden="true" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-matcha text-xs font-bold text-white shadow-[0_4px_10px_rgba(62,89,64,0.3)]">
                    {step.number}
                  </span>
                </div>

                {/* Content */}
                <h3 className="mb-2 text-xl font-semibold text-matcha-dark">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-matcha-dark/75">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
