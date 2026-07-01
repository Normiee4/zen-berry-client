"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { X, Star, ArrowRight } from 'lucide-react'

const LS_KEY = 'zb_review_modal'
const VISIT_THRESHOLD = 3
const DISMISS_DAYS = 3

interface ModalState {
  visitCount: number
  dismissedAt: number | null
}

function readState(): ModalState {
  if (typeof window === 'undefined') return { visitCount: 0, dismissedAt: null }
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { visitCount: 0, dismissedAt: null }
}

function writeState(state: ModalState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

export function ReviewModal() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setChecking(false)
        return
      }

      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (count && count > 0) {
        setChecking(false)
        return
      }

      const state = readState()
      state.visitCount += 1
      writeState(state)

      if (state.visitCount >= VISIT_THRESHOLD) {
        if (!state.dismissedAt) {
          setVisible(true)
        } else {
          const daysSinceDismiss = (Date.now() - state.dismissedAt) / (1000 * 60 * 60 * 24)
          if (daysSinceDismiss >= DISMISS_DAYS) {
            setVisible(true)
          }
        }
      }

      setChecking(false)
    }

    check()
  }, [])

  const dismiss = () => {
    const state = readState()
    state.dismissedAt = Date.now()
    writeState(state)
    setVisible(false)
  }

  const goToReview = () => {
    setVisible(false)
    router.push('/feedback?tab=review')
  }

  if (checking || !visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-3xl border border-strawberry-light/50 bg-white p-8 shadow-xl">
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-foreground"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} className="size-8 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        <h2 className="mb-2 text-center text-xl font-bold text-foreground">
          Love Zen Berry?
        </h2>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          Your review helps others discover mindful productivity. Share your experience!
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={goToReview}
            className="flex items-center justify-center gap-2 rounded-xl bg-matcha px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-matcha/90"
          >
            Write a Review
            <ArrowRight className="size-4" />
          </button>
          <button
            onClick={dismiss}
            className="rounded-xl px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-foreground"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
