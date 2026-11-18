"use client"

import { openCookieSettings } from "@/lib/cookie-consent"

interface CookieSettingsButtonProps {
  className?: string
  label?: string
}

/**
 * Trigger button that reopens the visitor cookie authorization panel.
 */
export function CookieSettingsButton({
  className,
  label = "Cookie Settings",
}: CookieSettingsButtonProps) {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className={className}
    >
      {label}
    </button>
  )
}
