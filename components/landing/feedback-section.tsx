import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export function FeedbackSection() {
  return (
    <section className="relative overflow-hidden bg-cream py-20 sm:py-28">
      {/* Flat Background Circles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-24 size-80 rounded-full bg-matcha-light/30" />
        <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-strawberry-light/45" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/80 bg-white/85 p-8 text-center shadow-[0_20px_44px_-16px_rgba(62,89,64,0.16),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-md sm:p-12">
          {/* Section Header */}
          <span className="mb-4 inline-block rounded-full bg-matcha px-4 py-1.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(62,89,64,0.22)]">
            Reviews
          </span>
          <h2 className="mb-4 text-balance text-3xl font-bold text-matcha-dark sm:text-4xl">
            What Our Users Say
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-matcha-dark/75">
            See how Zen Berry has helped others stay focused and productive.
          </p>

          <Button
            asChild
            size="lg"
            className="bg-matcha px-8 text-white shadow-[0_10px_24px_-6px_rgba(62,89,64,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] transition-all hover:-translate-y-0.5 hover:bg-matcha-dark"
          >
            <Link href="/reviews" className="inline-flex items-center gap-2">
              <Star className="size-4" />
              See all reviews
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
