import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star } from 'lucide-react'

export function FeedbackSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-matcha-light/20 via-cream to-strawberry-light/30 py-20 sm:py-28">
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <svg
          className="absolute -left-20 -top-20 h-100 w-100 opacity-20"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#86A788"
            d="M44.3,-76.5C57.9,-69.5,69.8,-58.4,77.5,-44.8C85.2,-31.2,88.7,-15.6,87.7,-0.6C86.7,14.5,81.1,28.9,73.1,42.1C65.1,55.2,54.6,67,41.5,74.4C28.4,81.7,12.7,84.6,-2.5,88.9C-17.8,93.2,-35.5,98.9,-49.4,92.1C-63.3,85.3,-73.3,66,-79.3,46.7C-85.3,27.5,-87.3,8.3,-83.8,-9.3C-80.3,-26.9,-71.4,-43,-59.1,-55.2C-46.9,-67.4,-31.4,-75.7,-15.3,-79.5C0.8,-83.3,30.7,-83.5,44.3,-76.5Z"
            transform="translate(100 100)"
          />
        </svg>
        <svg
          className="absolute -bottom-16 -right-16 h-100 w-100 opacity-20"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#FFCFCF"
            d="M39.5,-65.8C52.9,-59.5,66.8,-52.5,74.8,-41.2C82.8,-29.9,84.9,-14.9,83.8,-0.6C82.7,13.7,78.5,27.4,71.3,39.8C64.1,52.2,54,63.3,41.4,70.8C28.8,78.3,13.7,82.1,-1.4,84.5C-16.5,87,-33,88,-46.4,81.4C-59.8,74.9,-70.1,60.8,-77.3,45.5C-84.5,30.1,-88.6,13.6,-87.1,0.9C-85.6,-11.8,-78.5,-21.1,-70.4,-29.7C-62.2,-38.2,-53.1,-46,-42.6,-54.2C-32.1,-62.4,-20.3,-71,-6.3,-71.3C7.6,-71.6,26.1,-72.1,39.5,-65.8Z"
            transform="translate(100 100)"
          />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Section Header */}
        <span className="mb-4 inline-block rounded-full bg-matcha px-4 py-1.5 text-sm font-medium text-white">
          Reviews
        </span>
        <h2 className="mb-4 text-balance text-3xl font-bold text-foreground sm:text-4xl">
          What Our Users Say
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
          See how Zen Berry has helped others stay focused and productive.
        </p>

        <Button
          asChild
          size="lg"
          className="bg-matcha px-8 text-white hover:bg-matcha/90"
        >
          <Link href="/reviews" className="inline-flex items-center gap-2">
            <Star className="size-4" />
            See all reviews
          </Link>
        </Button>
      </div>
    </section>
  )
}
