"use client"

import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const reportQuestions = [
  {
    key: 'issue',
    label: 'What issue did you encounter?',
    required: true,
    placeholder: 'Describe the issue briefly...',
  },
  {
    key: 'explanation',
    label: 'Explain the issue in detail',
    required: true,
    placeholder: 'Tell us more about what happened...',
  },
  {
    key: 'suggestions',
    label: 'Do you have any suggestions?',
    required: true,
    placeholder: 'How could we improve this?',
  },
]

export function ReportForm() {
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/feedback/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issue: formData.issue,
          explanation: formData.explanation,
          suggestions: formData.suggestions,
          bug_detail: formData.bug_detail || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Failed to submit report')
        setIsSubmitting(false)
        return
      }

      toast.success('Report submitted. Thank you!')
      setFormData({})
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
      {reportQuestions.map((question) => (
        <div key={question.key}>
          <label
            htmlFor={`report-${question.key}`}
            className="mb-2 block text-sm font-medium text-foreground"
          >
            {question.label} <span className="text-red-400">*</span>
          </label>
          <textarea
            id={`report-${question.key}`}
            value={formData[question.key] || ''}
            onChange={(e) => updateField(question.key, e.target.value)}
            required={question.required}
            rows={3}
            className="w-full rounded-xl border border-strawberry-light/50 bg-card/60 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-matcha/50 focus:outline-none focus:ring-2 focus:ring-matcha/20"
            placeholder={question.placeholder}
          />
        </div>
      ))}

      {/* Optional Bug Detail */}
      <div>
        <label
          htmlFor="report-bug_detail"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Additional bug details <span className="text-muted-foreground/60">(optional)</span>
        </label>
        <textarea
          id="report-bug_detail"
          value={formData.bug_detail || ''}
          onChange={(e) => updateField('bug_detail', e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-strawberry-light/50 bg-card/60 p-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-matcha/50 focus:outline-none focus:ring-2 focus:ring-matcha/20"
          placeholder="Any additional details..."
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
          'Submit Report'
        )}
      </Button>
    </form>
  )
}
