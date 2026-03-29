"use client"

const steps = [
  {
    number: "01",
    title: "Set Your Intentions",
    description: "Start each day by adding your tasks. No pressure — just gentle intentions for what you'd like to accomplish.",
    emoji: "🌱"
  },
  {
    number: "02",
    title: "Focus in Sessions",
    description: "Use the Pomodoro timer to work in focused bursts. We'll remind you to breathe and take breaks.",
    emoji: "🍵"
  },
  {
    number: "03",
    title: "Grow Your Garden",
    description: "Watch your productivity garden bloom as you complete tasks. Celebrate your growth, no matter how small.",
    emoji: "🌸"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-linear-to-b from-cream to-strawberry-light/20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-matcha-light px-4 py-1.5 text-sm font-medium text-foreground">
            How It Works
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Simple steps to a calmer workflow
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Getting started takes just a few minutes. Here&apos;s how Zen Berry helps you focus.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute left-1/2 top-16 hidden h-0.5 w-full -translate-x-1/2 bg-linear-to-r from-matcha/30 via-strawberry/30 to-transparent md:block" />
              )}
              
              <div className="relative flex flex-col items-center text-center">
                {/* Step Number with Emoji */}
                <div className="relative mb-6">
                  <div className="flex size-20 items-center justify-center rounded-2xl bg-white shadow-lg ring-4 ring-strawberry-light/50">
                    <span className="text-4xl">{step.emoji}</span>
                  </div>
                  <span className="absolute -right-2 -top-2 flex size-8 items-center justify-center rounded-full bg-matcha text-xs font-bold text-white">
                    {step.number}
                  </span>
                </div>
                
                {/* Content */}
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
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
