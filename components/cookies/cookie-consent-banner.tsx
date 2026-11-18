"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Cookie, ShieldCheck, SlidersHorizontal, X } from "lucide-react"
import {
  OPEN_COOKIE_SETTINGS_EVENT,
  getCookieConsent,
  saveCookieConsent,
  syncAnalyticsConsent,
} from "@/lib/cookie-consent"

/**
 * Visitor cookie authorization banner and preferences panel.
 * Appears on first visit until a choice is saved, and can be reopened
 * via the "Cookie Settings" button in the footer or Cookie Policy page.
 */
export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const [showCustomize, setShowCustomize] = useState(false)
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [hasSavedChoice, setHasSavedChoice] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = getCookieConsent()
      if (saved) {
        setHasSavedChoice(true)
        setAnalyticsEnabled(saved.analytics)
        syncAnalyticsConsent(saved.analytics)
      } else {
        syncAnalyticsConsent(false)
        setIsOpen(true)
      }
    }, 0)

    const handleOpen = () => {
      const current = getCookieConsent()
      if (current) {
        setHasSavedChoice(true)
        setAnalyticsEnabled(current.analytics)
      }
      setShowCustomize(true)
      setIsOpen(true)
    }

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpen)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpen)
    }
  }, [])

  if (!isOpen) return null

  const handleAcceptAll = () => {
    saveCookieConsent(true)
    setHasSavedChoice(true)
    setAnalyticsEnabled(true)
    setIsOpen(false)
    setShowCustomize(false)
  }

  const handleEssentialOnly = () => {
    saveCookieConsent(false)
    setHasSavedChoice(true)
    setAnalyticsEnabled(false)
    setIsOpen(false)
    setShowCustomize(false)
  }

  const handleSavePreferences = () => {
    saveCookieConsent(analyticsEnabled)
    setHasSavedChoice(true)
    setIsOpen(false)
    setShowCustomize(false)
  }

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-label="Cookie authorization panel"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-2xl border border-strawberry-light/70 bg-card/95 p-5 shadow-xl backdrop-blur-md sm:inset-x-auto sm:right-6 sm:bottom-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-matcha/15 text-matcha">
            <Cookie className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Your Cookie Preferences
            </h2>
            <p className="text-xs text-muted-foreground">
              Zen Berry respects your privacy
            </p>
          </div>
        </div>
        {hasSavedChoice && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close cookie preferences"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        We use essential cookies to keep your session and theme working, and
        optional Google Analytics cookies to understand how visitors use Zen
        Berry. Read our{" "}
        <Link
          href="/cookies"
          className="font-medium text-matcha underline underline-offset-2 hover:text-matcha-dark"
        >
          Cookie Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="font-medium text-matcha underline underline-offset-2 hover:text-matcha-dark"
        >
          Privacy Policy
        </Link>
        .
      </p>

      {showCustomize && (
        <div className="mt-4 space-y-2.5 rounded-xl border border-border/70 bg-background/70 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="size-3.5 text-matcha" />
                Strictly Necessary
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Required for authentication, security, theme, and cookie consent
                preferences. Always active.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-matcha/15 px-2 py-0.5 text-[11px] font-medium text-matcha">
              Always on
            </span>
          </div>

          <div className="border-t border-border/60 pt-2.5">
            <label
              htmlFor="cookie-analytics-toggle"
              className="flex cursor-pointer items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Analytics (Google Analytics 4)
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Helps us measure traffic and improve Zen Berry using aggregated
                  usage insights.
                </p>
              </div>
              <input
                id="cookie-analytics-toggle"
                type="checkbox"
                checked={analyticsEnabled}
                onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 cursor-pointer accent-matcha"
              />
            </label>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setShowCustomize((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <SlidersHorizontal className="size-3.5" />
          {showCustomize ? "Hide options" : "Customize"}
        </button>

        <button
          type="button"
          onClick={handleEssentialOnly}
          className="rounded-xl border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Essential only
        </button>

        {showCustomize ? (
          <button
            type="button"
            onClick={handleSavePreferences}
            className="rounded-xl bg-matcha px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-matcha-dark"
          >
            Save preferences
          </button>
        ) : (
          <button
            type="button"
            onClick={handleAcceptAll}
            className="rounded-xl bg-matcha px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-matcha-dark"
          >
            Accept all
          </button>
        )}
      </div>
    </aside>
  )
}
