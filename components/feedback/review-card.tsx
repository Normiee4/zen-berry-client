import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FormattedReview } from '@/app/api/feedback/review/service'

interface ReviewCardProps {
  review: FormattedReview
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const questionLabels: Record<string, string> = {
  strugglesSolved: 'Struggles solved',
  routineImprovement: 'Routine improvement',
  completedMore: 'Completed more',
  partOfRoutine: 'Part of daily routine',
  recommendToOthers: 'Would recommend to others',
}

export function ReviewCard({ review }: ReviewCardProps) {
  const qaPairs = [
    { key: 'strugglesSolved', value: review.strugglesSolved },
    { key: 'routineImprovement', value: review.routineImprovement },
    { key: 'completedMore', value: review.completedMore },
    { key: 'partOfRoutine', value: review.partOfRoutine },
    { key: 'recommendToOthers', value: review.recommendToOthers },
  ] as const

  return (
    <div className="rounded-3xl border border-strawberry-light/50 bg-strawberry-light/30 p-6 backdrop-blur-sm transition-all hover:border-matcha/30 hover:shadow-lg">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-matcha text-sm font-semibold text-white">
            {review.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{review.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatRelativeTime(review.createdAt)}
            </p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'size-4',
                star <= review.rating
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          ))}
        </div>
      </div>

      {/* Q&A Answers */}
      <div className="space-y-3">
        {qaPairs.map(({ key, value }) => (
          <div key={key}>
            <p className="text-xs font-medium text-matcha">{questionLabels[key]}</p>
            <p className="text-sm text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {/* Additional Feedback */}
      {review.additionalFeedback && (
        <div className="mt-4 border-t border-strawberry-light/50 pt-3">
          <p className="text-xs font-medium text-matcha">Additional feedback</p>
          <p className="text-sm italic text-muted-foreground">{review.additionalFeedback}</p>
        </div>
      )}
    </div>
  )
}
