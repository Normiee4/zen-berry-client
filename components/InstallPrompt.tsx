'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { Download, Share, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

const emptySubscribe = () => () => {}

function checkIsStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

function checkIsIOS(): boolean {
  if (typeof window === 'undefined') return false
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIOSDevice =
    /iphone|ipad|ipod/.test(userAgent) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  const isSafariBrowser =
    /safari/.test(userAgent) && !/crios|fxios|opios|chrome|edg|chromium/i.test(userAgent)

  return isIOSDevice && isSafariBrowser
}

export function InstallPrompt() {
  const isStandalone = useSyncExternalStore(emptySubscribe, checkIsStandalone, () => false)
  const isIOS = useSyncExternalStore(emptySubscribe, checkIsIOS, () => false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Android / Chromium beforeinstallprompt handler
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

  if (isStandalone || isDismissed) {
    return null
  }

  // iOS Safari Tooltip
  if (isIOS) {
    return (
      <aside
        aria-label="Install Zen Berry"
        className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-[#D1E2D3] bg-[#FEFCF3] p-4 text-[#2D3B2D] shadow-xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#86A788]/20 text-[#557A57] dark:bg-emerald-950 dark:text-emerald-400">
            <Share className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-medium">Install Zen Berry</p>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              Tap the Share button below and select Add to Home Screen to install Zen Berry.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss installation prompt"
            className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </aside>
    )
  }

  // Android / Chromium Install Banner
  if (deferredPrompt) {
    return (
      <aside
        aria-label="Install Zen Berry"
        className="fixed bottom-6 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-[#D1E2D3] bg-[#FEFCF3] p-4 text-[#2D3B2D] shadow-xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#86A788]/20 text-[#557A57] dark:bg-emerald-950 dark:text-emerald-400">
            <Download className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Install Zen Berry</p>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Add to your home screen for quick access and offline use
            </p>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="rounded-xl bg-[#86A788] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6e8f70] active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            Install
          </button>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss installation prompt"
            className="rounded-lg p-1 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </aside>
    )
  }

  return null
}

export default InstallPrompt
