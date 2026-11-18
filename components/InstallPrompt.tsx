'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { usePathname } from 'next/navigation'
import { Download, Share, X } from 'lucide-react'
import { COOKIE_CONSENT_SAVED_EVENT, getCookieConsent } from '@/lib/cookie-consent'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

declare global {
  interface Window {
    /** Captured by an inline script in the root layout so the event is never missed before hydration. */
    __zbInstallEvent?: BeforeInstallPromptEvent
  }
}

const INSTALL_READY_EVENT = 'zb-install-ready'
const DISMISS_KEY = 'zenberry_install_dismissed_at'
const DISMISS_DAYS = 7

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

function wasRecentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY)
    if (!raw) return false
    return Date.now() - Number(raw) < DISMISS_DAYS * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

interface InstallPromptProps {
  initialHasConsent?: boolean
}

export function InstallPrompt({ initialHasConsent = false }: InstallPromptProps) {
  const pathname = usePathname()
  const isStandalone = useSyncExternalStore(emptySubscribe, checkIsStandalone, () => false)
  const isIOS = useSyncExternalStore(emptySubscribe, checkIsIOS, () => false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isDismissed, setIsDismissed] = useState(true)
  const [hasConsentChoice, setHasConsentChoice] = useState(initialHasConsent)

  useEffect(() => {
    setIsDismissed(wasRecentlyDismissed())
    setHasConsentChoice(initialHasConsent || getCookieConsent() !== null)

    // Pick up an event that fired before React hydrated.
    if (window.__zbInstallEvent) setDeferredPrompt(window.__zbInstallEvent)

    const handleReady = () => setDeferredPrompt(window.__zbInstallEvent ?? null)
    const handleConsent = () => setHasConsentChoice(true)
    const handleInstalled = () => {
      window.__zbInstallEvent = undefined
      setDeferredPrompt(null)
    }

    window.addEventListener(INSTALL_READY_EVENT, handleReady)
    window.addEventListener(COOKIE_CONSENT_SAVED_EVENT, handleConsent)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener(INSTALL_READY_EVENT, handleReady)
      window.removeEventListener(COOKIE_CONSENT_SAVED_EVENT, handleConsent)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [initialHasConsent])

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      // ignore storage errors
    }
    setIsDismissed(true)
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    window.__zbInstallEvent = undefined
    setDeferredPrompt(null)
    if (choice.outcome === 'dismissed') dismiss()
  }

  // Wait for the cookie choice so the two bottom sheets never overlap.
  if (isStandalone || isDismissed || !hasConsentChoice) return null

  // Sit above the dashboard's bottom tab bar on small screens.
  const positionClass = pathname.startsWith('/dashboard')
    ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))] md:bottom-6'
    : 'bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-6'

  const shellClass = `fixed inset-x-4 ${positionClass} z-50 mx-auto max-w-md rounded-2xl border border-[#D1E2D3] bg-[#FEFCF3] p-4 text-[#2D3B2D] shadow-xl dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100`

  if (isIOS) {
    return (
      <aside aria-label="Install Zen Berry" className={shellClass}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#86A788]/20 text-[#557A57] dark:bg-emerald-950 dark:text-emerald-400">
            <Share className="h-5 w-5" />
          </div>
          <div className="flex-1 text-sm leading-relaxed">
            <p className="font-medium">Install Zen Berry</p>
            <p className="mt-1 text-xs text-stone-600 dark:text-stone-300">
              Tap the Share button in Safari, then choose Add to Home Screen.
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss installation prompt"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </aside>
    )
  }

  if (deferredPrompt) {
    return (
      <aside aria-label="Install Zen Berry" className={shellClass}>
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
            className="min-h-10 rounded-xl bg-[#86A788] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#6e8f70] active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            Install
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss installation prompt"
            className="flex size-10 shrink-0 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-stone-800"
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
