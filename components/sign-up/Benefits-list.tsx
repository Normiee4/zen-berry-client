import { CheckCircle2 } from "lucide-react"

const benefits = [
  "Pomodoro timer with custom presets",
  "Track your daily MIT goals",
  "Brain dump journal",
]

export function BenefitsList() {
  return (
    <div className="space-y-3 rounded-lg bg-strawberry-light/30 p-4">
      {benefits.map((benefit, idx) => (
        <div key={idx} className="flex gap-3 text-sm">
          <CheckCircle2 className="size-5 shrink-0 text-matcha" />
          <span className="text-foreground">{benefit}</span>
        </div>
      ))}
    </div>
  )
}