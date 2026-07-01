"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const reviewQuestions = [
  { key: 'struggles_solved', label: 'What struggles did Zen Berry help you solve?', required: true },
  { key: 'routine_improvement', label: 'How has your routine improved?', required: true },
  { key: 'completed_more', label: 'What have you been able to complete more of?', required: true },
  { key: 'part_of_routine', label: 'Has Zen Berry become part of your daily routine?', required: true },
  { key: 'recommend_to_others', label: 'Would you recommend Zen Berry to others?', required: true },
]

export function ReviewForm() {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoveredStar, setHoveredStar] = useState(0)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          ...formData,
          additional_feedback: formData.additional_feedback || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to submit review')
        setIsSubmitting(false)
        return
      }

      toast.success('Review submitted!')
      router.push('/reviews')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  const updateField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Star Rating */}
      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Your Rating <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="cursor-pointer transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'size-8 transition-colors',
                  star <= (hoveredStar || rating)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-gray-200 text-gray-200'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Question Textareas */}
      {reviewQuestions.map((question) => (
        <div key={question.key}>
          <label
            htmlFor={`review-${question.key}`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {question.label} <span className="text-red-400">*</span>
          </label>
          <textarea
            id={`review-${question.key}`}
            value={formData[question.key] || ''}
            onChange={(e) => updateField(question.key, e.target.value)}
            required={question.required}
            rows={3}
            className="w-full rounded-xl border border-strawberry-light/50 bg-white/60 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-matcha/50 focus:outline-none focus:ring-2 focus:ring-matcha/20"
            placeholder="Share your thoughts..."
          />
        </div>
      ))}

      {/* Optional Additional Feedback */}
      <div>
        <label
          htmlFor="review-additional_feedback"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Anything else you&apos;d like to share? <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          id="review-additional_feedback"
          value={formData.additional_feedback || ''}
          onChange={(e) => updateField('additional_feedback', e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-strawberry-light/50 bg-white/60 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-matcha/50 focus:outline-none focus:ring-2 focus:ring-matcha/20"
          placeholder="Any additional feedback..."
        />
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-matcha text-white hover:bg-matcha/90 disabled:opacity-50"
        size="lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Review'
        )}
      </Button>
    </form>
  )
}
