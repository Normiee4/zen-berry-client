"use client"

import { useState, useEffect } from 'react'
import { Inbox, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Submission {
  id: string
  issue: string
  explanation: string
  suggestions: string
  bugDetail: string | null
  status: 'pending' | 'received' | 'resolved'
  createdAt: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const statusStyles: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  received: 'bg-matcha/10 text-matcha',
  resolved: 'bg-gray-100 text-gray-500',
}

export function MySubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await fetch('/api/feedback/reports')
        if (res.ok) {
          const data = await res.json()
          setSubmissions(data.reports ?? [])
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchSubmissions()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="size-6 animate-spin rounded-full border-4 border-matcha border-t-transparent" />
      </div>
    )
  }

  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Inbox className="mb-4 size-12 text-muted-foreground/50" strokeWidth={1} />
        <p className="text-lg font-medium text-foreground">No submissions yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Your reports will appear here once submitted.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {submissions.map((sub) => (
        <div
          key={sub.id}
          className="overflow-hidden rounded-2xl border border-strawberry-light/50 bg-white/60"
        >
          <button
            type="button"
            onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
            className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-strawberry-light/20"
          >
            <div className="flex-1">
              <p className="font-medium text-foreground">{sub.issue}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(sub.createdAt)}
              </p>
            </div>
            <span className={`mr-3 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[sub.status] || statusStyles.pending}`}>
              {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
            </span>
            {expandedId === sub.id ? (
              <ChevronUp className="size-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground" />
            )}
          </button>
          <div
            className={cn(
              'overflow-hidden transition-all duration-200',
              expandedId === sub.id ? 'max-h-96' : 'max-h-0'
            )}
          >
            <div className="border-t border-strawberry-light/30 px-5 py-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Explanation</p>
                <p className="mt-0.5 text-sm text-foreground">{sub.explanation}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Suggestions</p>
                <p className="mt-0.5 text-sm text-foreground">{sub.suggestions}</p>
              </div>
              {sub.bugDetail && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Bug Details</p>
                  <p className="mt-0.5 text-sm text-foreground">{sub.bugDetail}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
