import { Heart } from "lucide-react"

export function Hero() {
  return (
    <div className="text-center">
      <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-strawberry to-strawberry-light">
        <Heart className="size-8 text-white fill-white" />
      </div>
      <h1 className="text-4xl font-bold text-foreground md:text-5xl">
        Focus sweetly,
        <br />
        grow daily
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Join the Zen Berry community. A productivity app designed to help you focus without burnout.
      </p>
    </div>
  )
}