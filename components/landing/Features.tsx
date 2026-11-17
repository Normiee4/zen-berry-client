"use client"

import { Timer, ListTodo, BarChart3, Sparkles, Heart, Zap } from "lucide-react"

const features = [
  {
    icon: Timer,
    title: "Gentle Pomodoro Timer",
    description: "A sustainable focus timer that respects your energy levels and reminds you to take mindful breaks.",
    color: "bg-strawberry",
    iconColor: "text-red-400"
  },
  {
    icon: ListTodo,
    title: "Soft Task Lists",
    description: "Organize your tasks without the overwhelm. Gentle nudges, not aggressive deadlines.",
    color: "bg-matcha-light",
    iconColor: "text-matcha"
  },
  {
    icon: BarChart3,
    title: "Kind Tracking",
    description: "See your progress with compassionate analytics that celebrate small wins.",
    color: "bg-strawberry-light",
    iconColor: "text-pink-400"
  },
  {
    icon: Sparkles,
    title: "Focus Modes",
    description: "Deep work, creative flow, or gentle tasks — pick the mode that matches your energy.",
    color: "bg-amber-100",
    iconColor: "text-amber-500"
  },
  {
    icon: Heart,
    title: "Self-Care Reminders",
    description: "Hydration, stretching, and breathing exercises woven into your workflow.",
    color: "bg-rose-100",
    iconColor: "text-rose-400"
  },
  {
    icon: Zap,
    title: "Quick Actions",
    description: "Keyboard shortcuts and quick add features for when you're in the zone.",
    color: "bg-matcha-light",
    iconColor: "text-matcha"
  }
]

export function Features() {
  return (
    <section id="features" className="relative overflow-hidden bg-cream py-20 sm:py-28">
      {/* Morphed Wavy Background Blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Large soft matcha blob - right side */}
        <svg
          className="absolute -right-40 top-20 h-125 w-125 opacity-25"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#86A788"
            d="M45.3,-77.8C58.4,-70.6,68.9,-58.4,76.2,-44.4C83.5,-30.4,87.6,-14.6,86.5,-0.6C85.5,13.3,79.3,25.8,71.6,37.5C63.9,49.1,54.6,60,42.9,67.9C31.1,75.9,16.9,80.9,1.6,78.4C-13.7,75.9,-27.4,65.8,-40.5,56.7C-53.6,47.5,-66,39.2,-73.8,27.4C-81.6,15.6,-84.7,0.3,-82.4,-14C-80,-28.2,-72.2,-41.3,-61.5,-51.7C-50.8,-62.2,-37.2,-70,-23,-74.6C-8.7,-79.2,6.2,-80.5,20.6,-78.6C34.9,-76.7,32.2,-85,45.3,-77.8Z"
            transform="translate(100 100)"
          />
        </svg>
        
        {/* Medium strawberry blob - left side */}
        <svg
          className="absolute -left-32 bottom-20 h-112.5 w-112.5 opacity-30"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFCFCF"
            d="M42.8,-73.2C55.9,-66.4,67.1,-55.5,74.8,-42.3C82.5,-29.1,86.7,-13.6,85.6,-0.7C84.4,12.2,77.9,23.7,70.2,34.4C62.5,45.1,53.6,55.1,42.3,62.4C31,69.7,17.3,74.3,2.4,70.8C-12.6,67.3,-28.5,55.8,-41.5,44.3C-54.5,32.8,-64.5,21.4,-70.8,7.1C-77.1,-7.2,-79.7,-24.4,-74.2,-38.5C-68.7,-52.7,-55.1,-63.9,-40.5,-70C-25.9,-76.1,-10.3,-77.2,3.2,-82.6C16.7,-88,29.7,-80,42.8,-73.2Z"
            transform="translate(100 100)"
          />
        </svg>
        
        {/* Small accent blob - top center */}
        <svg
          className="absolute left-1/2 top-0 h-62.5 w-62.5 -translate-x-1/2 opacity-20"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFE2E2"
            d="M44.8,-76.8C58.2,-69.2,69.4,-57.1,77.1,-43C84.8,-28.9,89,-12.9,87.9,2.6C86.8,18.1,80.4,33.1,71.3,46.1C62.1,59.1,50.2,70.1,36.3,76.5C22.4,82.8,6.5,84.5,-9.1,82.6C-24.6,80.7,-39.9,75.2,-52.4,66C-64.9,56.7,-74.7,43.7,-80.3,28.8C-86,13.9,-87.6,-2.8,-83.9,-18C-80.2,-33.2,-71.3,-46.9,-59.3,-55.6C-47.3,-64.4,-32.2,-68.2,-17.7,-72.1C-3.2,-76.1,10.7,-80.2,24.2,-80.4C37.7,-80.6,31.5,-84.4,44.8,-76.8Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>
      
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="mb-4 inline-block rounded-full bg-strawberry px-4 py-1.5 text-sm font-medium text-foreground">
            Features
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl">
            Everything you need to stay{" "}
            <span className="text-matcha">zen</span> &{" "}
            <span className="text-pink-400">productive</span>
          </h2>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Thoughtfully designed tools that help you focus without the burnout. 
            Because productivity should feel good.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group rounded-2xl border border-strawberry-light/50 bg-white/60 p-6 backdrop-blur-sm transition-all hover:border-matcha/30 hover:bg-white hover:shadow-lg"
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${feature.color}`}>
                <feature.icon className={`size-6 ${feature.iconColor}`} />
              </div>
              
              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
