const features = [
  { emoji: "⏱️", title: "Smart Timer", description: "Custom Pomodoro presets" },
  { emoji: "🎯", title: "Daily MITs", description: "Track what matters" },
  { emoji: "🧠", title: "Brain Dump", description: "Clear your mind" },
  { emoji: "🍵", title: "Cute UI", description: "Enjoy the experience" },
]

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {features.map((feature, idx) => (
        <div
          key={idx}
          className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur"
        >
          <div className="mb-2 text-2xl">{feature.emoji}</div>
          <h3 className="font-semibold text-foreground">{feature.title}</h3>
          <p className="text-xs text-muted-foreground">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}