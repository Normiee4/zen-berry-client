export const COOKIE_CONSENT_KEY = "zenberry_cookie_consent"
export const OPEN_COOKIE_SETTINGS_EVENT = "zenberry:open-cookie-settings"
export const COOKIE_CONSENT_SAVED_EVENT = "zenberry:cookie-consent-saved"

export interface CookieConsentPreferences {
  necessary: true
  analytics: boolean
  updatedAt: string
}

type GtagFn = (
  command: "consent",
  action: "default" | "update",
  params: Record<string, string>
) => void

declare global {
  interface Window {
    gtag?: GtagFn
    [key: `ga-disable-${string}`]: boolean | undefined
  }
}

function readConsentCookie(): CookieConsentPreferences | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${COOKIE_CONSENT_KEY}=`))
  if (!match) return null

  const value = match.slice(COOKIE_CONSENT_KEY.length + 1)
  if (value !== "all" && value !== "essential") return null

  return {
    necessary: true,
    analytics: value === "all",
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Reads saved cookie consent preferences from localStorage, falling back to the
 * first-party cookie (survives cleared storage, private tabs and installed PWAs).
 * Returns null if the visitor has not made a choice yet.
 */
export function getCookieConsent(): CookieConsentPreferences | null {
  if (typeof window === "undefined") return null

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_KEY)
    if (raw) {
      const parsed: unknown = JSON.parse(raw)
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "analytics" in parsed &&
        typeof (parsed as { analytics: unknown }).analytics === "boolean"
      ) {
        const record = parsed as { analytics: boolean; updatedAt?: unknown }
        return {
          necessary: true,
          analytics: record.analytics,
          updatedAt:
            typeof record.updatedAt === "string"
              ? record.updatedAt
              : new Date().toISOString(),
        }
      }
    }
  } catch {
    // fall through to the cookie
  }

  try {
    const fromCookie = readConsentCookie()
    if (fromCookie) {
      // Heal localStorage so later reads are fast.
      try {
        window.localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(fromCookie))
      } catch {
        // storage unavailable; the cookie alone is enough
      }
      return fromCookie
    }
  } catch {
    // ignore
  }
  return null
}

/**
 * Applies analytics consent state to Google Analytics (gtag consent + ga-disable flag).
 */
export function syncAnalyticsConsent(analyticsGranted: boolean): void {
  if (typeof window === "undefined") return

  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (gaId) {
    window[`ga-disable-${gaId}`] = !analyticsGranted
  }

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: analyticsGranted ? "granted" : "denied",
    })
  }
}

/**
 * Persists cookie consent preferences to localStorage and a first-party cookie,
 * then syncs analytics consent state.
 */
export function saveCookieConsent(
  analyticsGranted: boolean
): CookieConsentPreferences {
  const preferences: CookieConsentPreferences = {
    necessary: true,
    analytics: analyticsGranted,
    updatedAt: new Date().toISOString(),
  }

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(
        COOKIE_CONSENT_KEY,
        JSON.stringify(preferences)
      )
    } catch {
      // Ignore storage quota / private mode errors
    }

    const maxAgeSeconds = 60 * 60 * 24 * 365
    const value = analyticsGranted ? "all" : "essential"
    const secure = window.location.protocol === "https:" ? "; Secure" : ""
    document.cookie = `${COOKIE_CONSENT_KEY}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`

    syncAnalyticsConsent(analyticsGranted)
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_SAVED_EVENT))
  }

  return preferences
}

/**
 * Dispatches an event to open the cookie authorization panel from anywhere in the app.
 */
export function openCookieSettings(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(OPEN_COOKIE_SETTINGS_EVENT))
}
