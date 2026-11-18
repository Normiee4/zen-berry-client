import { PinBoard } from "@/components/pins/pin-board"

export default function PinsPage() {
  return (
    <div className="mx-auto max-w-8xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl font-bold text-foreground">Pins</h1>
        <p className="text-sm text-muted-foreground">Save links and resources for later</p>
      </div>
      <PinBoard />
    </div>
  )
}
