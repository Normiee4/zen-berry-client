"use client"

import { Timer, ListTodo, BarChart3, Sparkles, Heart, Zap } from "lucide-react"

const features = [
  {
    icon: Timer,
    title: "Gentle Pomodoro Timer",
    description: "A sustainable focus timer that respects your energy levels and reminds you to take mindful breaks.",
  },
  {
    icon: ListTodo,
    title: "Soft Task Lists",
    description: "Organize your tasks without the overwhelm. Gentle nudges, not aggressive deadlines.",
  },
  {
    icon: BarChart3,
    title: "Kind Tracking",
    description: "See your progress with compassionate analytics that celebrate small wins.",
  },
  {
    icon: Sparkles,
    title: "Focus Modes",
    description: "Deep work, creative flow, or gentle tasks — pick the mode that matches your energy.",
  },
  {
    icon: Heart,
    title: "Self-Care Reminders",
    description: "Hydration, stretching, and breathing exercises woven into your workflow.",
  },
  {
    icon: Zap,
    title: "Quick Actions",
    description: "Keyboard shortcuts and quick add features for when you're in the zone.",
  }
]

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden border-y border-matcha-light/50 bg-matcha-light/25 py-20 sm:py-28">
      {/* Flat Background Circles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-32 top-16 size-[26rem] rounded-full bg-matcha-light/30" />
        <div className="absolute -left-28 bottom-16 size-[24rem] rounded-full bg-strawberry-light/55" />
        <div className="absolute left-1/2 top-8 size-64 -translate-x-1/2 rounded-full border border-matcha/15 bg-white/30" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full border border-strawberry/40 bg-white/80 px-4 py-1.5 text-sm font-medium text-strawberry-dark shadow-[0_2px_10px_rgba(184,74,74,0.08)]">
            Features
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-matcha-dark sm:text-4xl">
            Everything you need to stay{" "}
            <span className="text-matcha">zen</span> &amp;{" "}
            <span className="text-strawberry-dark">productive</span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-matcha-dark/75">
            Thoughtfully designed tools that help you focus without the burnout.
            Because productivity should feel good.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-matcha-light/60 bg-white/85 p-6 shadow-[0_10px_30px_-12px_rgba(62,89,64,0.14),0_2px_6px_-1px_rgba(62,89,64,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-matcha/50 hover:bg-white hover:shadow-[0_20px_40px_-14px_rgba(62,89,64,0.22),0_4px_12px_-2px_rgba(62,89,64,0.08)]"
            >
              {/* Icon - Matcha Green Lucide React with tactile plinth */}
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-matcha/20 bg-matcha-light/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.85),0_4px_10px_rgba(62,89,64,0.12)] transition-transform duration-200 group-hover:scale-105">
                <feature.icon className="size-6 text-matcha-dark" aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-matcha-dark">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-matcha-dark/75">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
