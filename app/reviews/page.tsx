import Link from 'next/link'
import type { Metadata } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ReviewsList } from '@/components/feedback/reviews-list'
import { formatReview, type ReviewRow } from '@/app/api/feedback/review/service'
import { ArrowLeft, MessageSquareText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Reviews | Zen Berry',
  description: 'See what our users are saying about Zen Berry.',
}

export default async function ReviewsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  const formattedReviews = (reviews as ReviewRow[] | null)?.map(formatReview) ?? []

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="border-b border-strawberry-light/50 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-matcha">
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <Link
            href="/feedback"
            className="inline-flex items-center gap-2 rounded-xl bg-matcha px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-matcha/90"
          >
            <MessageSquareText className="size-4" />
            Share your experience
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground sm:text-4xl">
            What Our Users Say
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Real stories from people who have made Zen Berry part of their daily routine.
          </p>
        </div>

        <ReviewsList reviews={formattedReviews} />
      </div>
    </div>
  )
}
