import { Metadata } from 'next';
import { BackgroundBlobs } from "@/components/ui/Background-blobs"
import { Hero } from "@/components/waitlist/Hero"
import { FeaturesGrid } from "@/components/waitlist/Feature-grid"
import { WaitlistForm } from "@/components/waitlist/Waitlist-form"

export const metadata:Metadata = {
  title: "Waitlist — Zen Berry",
  description: "Join the Zen Berry waitlist and be the first to grow your focus",
}

export default function WaitlistPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-cream via-strawberry-light/30 to-matcha-light/20">
      <BackgroundBlobs />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg space-y-8">
          <Hero />
          <FeaturesGrid />
          <WaitlistForm />
        </div>
      </div>
    </div>
  )
}