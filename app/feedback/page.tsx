"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { ReviewForm } from '@/components/feedback/review-form'
import { ReportForm } from '@/components/feedback/report-form'
import { MySubmissions } from '@/components/feedback/my-submissions'
import { MessageSquareText, Flag, Inbox, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tab = 'review' | 'report' | 'submissions'

export default function FeedbackPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('review')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('tab') as Tab | null
    if (tab === 'report' || tab === 'submissions') {
      setActiveTab(tab)
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setIsAuthenticated(!!data.user)
    }
    checkAuth()
  }, [])

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-4 border-matcha border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-foreground">Authentication Required</h1>
          <p className="mb-6 text-muted-foreground">Please log in to submit feedback.</p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 rounded-xl bg-matcha px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-matcha/90"
          >
            Go to Login
          </Link>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-strawberry-light/50 bg-card/60 backdrop-blur-sm">
        <nav aria-label="Feedback navigation" className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 py-1 text-sm text-muted-foreground transition-colors hover:text-matcha"
          >
            <ArrowLeft className="size-4" />
            Back
          </button>
          <Link
            href="/reviews"
            className="py-1 text-sm text-muted-foreground transition-colors hover:text-matcha"
          >
            Read Reviews
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Tab Switcher */}
        <div role="tablist" aria-label="Feedback options" className="mb-8 flex flex-col gap-1 rounded-2xl border border-strawberry-light/50 bg-card/60 p-1 backdrop-blur-sm sm:flex-row sm:gap-0">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'review'}
            onClick={() => setActiveTab('review')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:px-4',
              activeTab === 'review'
                ? 'bg-matcha text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <MessageSquareText className="size-4" />
            Send a Review
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'report'}
            onClick={() => setActiveTab('report')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:px-4',
              activeTab === 'report'
                ? 'bg-matcha text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Flag className="size-4" />
            Report an Issue
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'submissions'}
            onClick={() => setActiveTab('submissions')}
            className={cn(
              'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all sm:px-4',
              activeTab === 'submissions'
                ? 'bg-matcha text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Inbox className="size-4" />
            My Submissions
          </button>
        </div>

        {/* Content */}
        <div className="rounded-3xl border border-strawberry-light/50 bg-card/80 p-6 backdrop-blur-sm sm:p-8">
          {activeTab === 'review' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Share Your Experience</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tell us how Zen Berry has helped you. Your review will be shown publicly.
                </p>
              </div>
              <ReviewForm />
            </>
          )}
          {activeTab === 'report' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Report an Issue</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Help us improve by reporting bugs or suggesting improvements.
                </p>
              </div>
              <ReportForm />
            </>
          )}
          {activeTab === 'submissions' && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">My Submissions</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your reports and their current status.
                </p>
              </div>
              <MySubmissions />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
