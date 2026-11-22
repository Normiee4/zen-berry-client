"use client"

import { Heart, Leaf, Sparkles, Sprout } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Compassionate Design",
    description: "We believe productivity should nurture your well-being, not drain your energy. Every feature is designed with kindness in mind.",
    color: "bg-strawberry-light",
    iconColor: "text-strawberry-dark",
  },
  {
    icon: Leaf,
    title: "Sustainable Growth",
    description: "Like a garden, personal growth takes time and care. We help you cultivate habits that last, not force quick wins.",
    color: "bg-matcha-light/45",
    iconColor: "text-matcha-dark",
  },
  {
    icon: Sparkles,
    title: "Mindful Innovation",
    description: "Technology should enhance your focus, not distract from it. We blend thoughtful design with gentle functionality.",
    color: "bg-strawberry-light",
    iconColor: "text-strawberry-dark",
  },
]

export function About() {
  return (
    <section id="about-zenberry" className="relative overflow-hidden border-y border-strawberry/25 bg-strawberry-light/35 py-20 sm:py-28">
      {/* Flat Background Circles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-[28rem] rounded-full bg-matcha-light/30" />
        <div className="absolute -bottom-24 -right-24 size-[26rem] rounded-full bg-strawberry-light/55" />
        <div className="absolute right-1/4 top-1/3 size-56 rounded-full border border-strawberry/20 bg-white/25" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-matcha px-4 py-1.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(62,89,64,0.25)]">
            About Zen Berry
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-matcha-dark sm:text-4xl">
            Born from a simple{" "}
            <span className="text-matcha">realization</span>
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg text-matcha-dark/75">
            In a world of aggressive productivity tools and endless notifications, we wondered:
            what if focus could feel gentle? What if growth could be sustainable?
            Zen Berry was born from this question — a mindful productivity companion that
            nurtures your well-being while helping you accomplish your goals.
          </p>
        </div>

        {/* Story Section */}
        <div className="mb-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-matcha-dark">
              The Strawberry-Matcha Philosophy
            </h3>
            <p className="leading-relaxed text-matcha-dark/80">
              We combined the sweet, energizing essence of strawberries with the calming,
              focused energy of matcha. Just as matcha provides steady, sustainable energy
              without the jitters, and strawberries bring natural sweetness without artificial
              additives, Zen Berry offers productivity tools that are both effective and kind.
            </p>
            <p className="leading-relaxed text-matcha-dark/80">
              Our approach is simple: celebrate small wins, respect your natural rhythms,
              and create space for genuine focus. Because when productivity feels good,
              it becomes sustainable.
            </p>
          </div>

          <div className="relative">
            <div aria-hidden="true" className="absolute -left-4 -top-4 size-24 rounded-full bg-strawberry-light/70" />
            <div aria-hidden="true" className="absolute -bottom-4 -right-4 size-28 rounded-full bg-matcha-light/45" />

            <div className="relative rounded-3xl border border-white/80 bg-white/85 p-8 shadow-[0_18px_40px_-14px_rgba(62,89,64,0.18),0_4px_12px_-2px_rgba(62,89,64,0.08),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-md">
              <div className="text-center">
                <div className="mx-auto mb-4 inline-flex size-16 items-center justify-center rounded-2xl border border-matcha/20 bg-matcha-light/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_6px_14px_rgba(62,89,64,0.15)]">
                  <Sprout className="size-8 text-matcha-dark" aria-hidden="true" />
                </div>
                <h4 className="mb-2 text-lg font-semibold text-matcha-dark">
                  Grow at Your Own Pace
                </h4>
                <p className="text-sm text-matcha-dark/75">
                  Every seed needs time to sprout. We provide the gentle conditions
                  for your productivity to flourish naturally.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="group rounded-2xl border border-white/80 bg-white/85 p-6 shadow-[0_12px_30px_-12px_rgba(62,89,64,0.14),0_2px_6px_-1px_rgba(62,89,64,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-md transition-all duration-200 hover:-translate-y-1 hover:border-matcha/40 hover:bg-white hover:shadow-[0_20px_40px_-14px_rgba(62,89,64,0.2)]"
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_4px_10px_rgba(62,89,64,0.1)] ${value.color}`}>
                <value.icon className={`size-6 ${value.iconColor}`} aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-matcha-dark">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-matcha-dark/75">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Closing Message */}
        <div className="mt-16 text-center">
          <p className="mx-auto max-w-2xl text-pretty text-matcha-dark/75">
            Join mindful professionals who have discovered that productivity
            doesn&apos;t have to be a battle. It can be a gentle, rewarding journey.
          </p>
        </div>
      </div>
    </section>
  )
}
