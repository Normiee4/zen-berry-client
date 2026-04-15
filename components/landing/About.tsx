

"use client"

import { Heart, Leaf, Sparkles } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Compassionate Design",
    description: "We believe productivity should nurture your well-being, not drain your energy. Every feature is designed with kindness in mind.",
    color: "bg-strawberry",
    iconColor: "text-red-400"
  },
  {
    icon: Leaf,
    title: "Sustainable Growth",
    description: "Like a garden, personal growth takes time and care. We help you cultivate habits that last, not force quick wins.",
    color: "bg-matcha-light",
    iconColor: "text-matcha"
  },
  {
    icon: Sparkles,
    title: "Mindful Innovation",
    description: "Technology should enhance your focus, not distract from it. We blend thoughtful design with gentle functionality.",
    color: "bg-strawberry-light",
    iconColor: "text-pink-400"
  }
]

export function About() {
  return (
    <section id="about-zenberry" className="relative overflow-hidden bg-linear-to-br from-strawberry-light/20 via-cream to-matcha-light/30 py-20 sm:py-28">
      {/* Morphed Wavy Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large matcha blob - top left */}
        <svg
          className="absolute -left-32 -top-32 h-150 w-150 opacity-30"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#B8D4B8"
            d="M44.3,-76.5C57.9,-69.5,69.8,-58.4,77.5,-44.8C85.2,-31.2,88.7,-15.6,87.7,-0.6C86.7,14.5,81.1,28.9,73.1,42.1C65.1,55.2,54.6,67,41.5,74.4C28.4,81.7,12.7,84.6,-2.5,88.9C-17.8,93.2,-35.5,98.9,-49.4,92.1C-63.3,85.3,-73.3,66,-79.3,46.7C-85.3,27.5,-87.3,8.3,-83.8,-9.3C-80.3,-26.9,-71.4,-43,-59.1,-55.2C-46.9,-67.4,-31.4,-75.7,-15.3,-79.5C0.8,-83.3,30.7,-83.5,44.3,-76.5Z"
            transform="translate(100 100)"
          />
        </svg>

        {/* Medium strawberry blob - bottom right */}
        <svg
          className="absolute -bottom-20 -right-20 h-125 w-125 opacity-40"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFE2E2"
            d="M39.5,-65.8C52.9,-59.5,66.8,-52.5,74.8,-41.2C82.8,-29.9,84.9,-14.9,83.8,-0.6C82.7,13.7,78.5,27.4,71.3,39.8C64.1,52.2,54,63.3,41.4,70.8C28.8,78.3,13.7,82.1,-1.4,84.5C-16.5,87,-33,88,-46.4,81.4C-59.8,74.9,-70.1,60.8,-77.3,45.5C-84.5,30.1,-88.6,13.6,-87.1,0.9C-85.6,-11.8,-78.5,-21.1,-70.4,-29.7C-62.2,-38.2,-53.1,-46,-42.6,-54.2C-32.1,-62.4,-20.3,-71,-6.3,-71.3C7.6,-71.6,26.1,-72.1,39.5,-65.8Z"
            transform="translate(100 100)"
          />
        </svg>

        {/* Small accent blob - center right */}
        <svg
          className="absolute right-1/4 top-1/3 h-75 w-75 opacity-25"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFCFCF"
            d="M47.7,-79.1C62.3,-72.5,75,-61.1,82.8,-46.8C90.6,-32.5,93.5,-15.3,91.1,-0.1C88.7,15.1,81.1,28.3,72.4,40.6C63.7,52.9,53.9,64.2,41.5,71.7C29.1,79.2,14.6,82.8,-0.8,84.2C-16.2,85.6,-32.3,84.8,-45.9,78.4C-59.4,72,-70.3,60,-77.2,46C-84.1,32,-87,16,-86.3,0.4C-85.6,-15.2,-81.3,-30.4,-73.3,-43.2C-65.4,-56,-53.7,-66.3,-40.4,-73.7C-27.1,-81.2,-12.2,-85.7,2.4,-89.9C17.1,-94.2,33.1,-85.8,47.7,-79.1Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-matcha px-4 py-1.5 text-sm font-medium text-white">
            About Zen Berry
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Born from a simple{" "}
            <span className="text-matcha">realization</span>
          </h2>
          <p className="mx-auto max-w-3xl text-pretty text-lg text-muted-foreground">
            In a world of aggressive productivity tools and endless notifications, we wondered:
            what if focus could feel gentle? What if growth could be sustainable?
            Zen Berry was born from this question — a mindful productivity companion that
            nurtures your well-being while helping you accomplish your goals.
          </p>
        </div>

        {/* Story Section */}
        <div className="mb-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-foreground">
              The Strawberry-Matcha Philosophy 🍓🍵
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              We combined the sweet, energizing essence of strawberries with the calming,
              focused energy of matcha. Just as matcha provides steady, sustainable energy
              without the jitters, and strawberries bring natural sweetness without artificial
              additives, Zen Berry offers productivity tools that are both effective and kind.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our approach is simple: celebrate small wins, respect your natural rhythms,
              and create space for genuine focus. Because when productivity feels good,
              it becomes sustainable.
            </p>
          </div>

          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -left-4 -top-4 size-24 rounded-full bg-strawberry/20 blur-xl" />
            <div className="absolute -right-4 -bottom-4 size-32 rounded-full bg-matcha-light/20 blur-xl" />

            <div className="relative rounded-2xl border border-strawberry-light/50 bg-white/60 p-8 backdrop-blur-sm">
              <div className="text-center">
                <div className="mb-4 text-6xl">🌱</div>
                <h4 className="mb-2 text-lg font-semibold text-foreground">
                  Grow at Your Own Pace
                </h4>
                <p className="text-sm text-muted-foreground">
                  Every seed needs time to sprout. We provide the gentle conditions
                  for your productivity to flourish naturally.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-matcha-light/50 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-matcha/30 hover:bg-white hover:shadow-lg"
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${value.color}`}>
                <value.icon className={`size-6 ${value.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {value.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>

        {/* Closing Message */}
        <div className="mt-16 text-center">
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Join thousands of mindful professionals who have discovered that productivity
            doesn&apos;t have to be a battle. It can be a gentle, rewarding journey.
          </p>
        </div>
      </div>
    </section>
  )
}