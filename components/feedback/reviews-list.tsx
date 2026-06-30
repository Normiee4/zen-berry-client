import { ReviewCard } from '@/components/feedback/review-card'
import type { FormattedReview } from '@/app/api/feedback/review/service'

interface ReviewsListProps {
  reviews: FormattedReview[]
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  if (reviews.length === 0) {
    return (
      <div className="rounded-3xl border border-strawberry-light/50 bg-strawberry-light/30 p-12 text-center">
        <p className="text-lg text-muted-foreground">
          No reviews yet. Be the first!
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  )
}
