import { PinBoard } from "@/components/pins/pin-board"

export default function PinsPage() {
  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Pins</h1>
        <p className="text-sm text-muted-foreground">Save links and resources for later</p>
      </div>
      <PinBoard />
    </div>
  )
}
