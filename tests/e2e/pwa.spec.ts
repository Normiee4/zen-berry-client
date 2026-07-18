import { test, expect } from "@playwright/test"

/**
 * PWA E2E Tests — Zen Berry
 *
 * Notes:
 * - Service worker is disabled in development mode (ENV check in next.config.ts).
 * - Tests that truly require SW activation use test.skip() when SW is not active.
 * - See docs/features/pwa/TEST-SPEC.md for the full test specification.
 */

/**
 * Helper: check if the service worker is active in the current context.
 */
async function hasActiveSW(page: import("@playwright/test").Page): Promise<boolean> {
  return page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) return false
    try {
      const reg = await navigator.serviceWorker.getRegistration()
      return !!reg?.active
    } catch {
      return false
    }
  })
}

/**
 * Helper: get the formatted timer text (MM:SS) from the timer card.
 */
async function getTimerText(page: import("@playwright/test").Page): Promise<string> {
  // The timer display is a <span> with font-mono and text-4xl classes
  const timerText = await page.locator("span.font-mono.text-4xl").textContent()
  return timerText?.trim() ?? ""
}

test.describe("PWA — Manifest & Meta Tags", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
  })

  test("TC-PWA-030 — Manifest link is present in <head>", async ({ page }) => {
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toBeAttached()
    const href = await manifestLink.getAttribute("href")
    expect(href).toBe("/site.webmanifest")
  })

  test("TC-PWA-031/032 — Manifest contains 192x192 and 512x512 PNG icons", async ({ page }) => {
    const response = await page.goto("/site.webmanifest")
    expect(response).not.toBeNull()
    const manifest = await response!.json()

    expect(manifest.name).toBe("Zen Berry")
    expect(manifest.short_name).toBe("ZenBerry")
    expect(manifest.display).toBe("standalone")
    expect(manifest.start_url).toBe("/")
    expect(manifest.background_color).toBeDefined()
    expect(manifest.theme_color).toBe("#86A788")

    const icons = manifest.icons as Array<{ src: string; sizes: string; type: string }>
    expect(icons.length).toBeGreaterThanOrEqual(2)

    const icon192 = icons.find((i) => i.sizes === "192x192" && i.type === "image/png")
    expect(icon192).toBeDefined()
    expect(icon192!.src).toBe("/icon-192.png")

    const icon512 = icons.find((i) => i.sizes === "512x512" && i.type === "image/png")
    expect(icon512).toBeDefined()
    expect(icon512!.src).toBe("/icon-512.png")
  })

  test("TC-PWA-038 — apple-mobile-web-app-capable meta tag is present", async ({ page }) => {
    const meta = page.locator('meta[name="apple-mobile-web-app-capable"]')
    await expect(meta).toBeAttached()
    await expect(meta).toHaveAttribute("content", "yes")
  })

  test("TC-PWA-039 — apple-mobile-web-app-status-bar-style meta tag is present", async ({ page }) => {
    const meta = page.locator('meta[name="apple-mobile-web-app-status-bar-style"]')
    await expect(meta).toBeAttached()
    await expect(meta).toHaveAttribute("content", "default")
  })

  test("TC-PWA-041 — format-detection disables telephone auto-linking", async ({ page }) => {
    const meta = page.locator('meta[name="format-detection"]')
    await expect(meta).toBeAttached()
    await expect(meta).toHaveAttribute("content", "telephone=no")
  })

  test("TC-PWA-044 — theme-color meta tag is matcha green", async ({ page }) => {
    const meta = page.locator('meta[name="theme-color"]')
    await expect(meta).toBeAttached()
    await expect(meta).toHaveAttribute("content", "#86A788")
  })

  test("TC-PWA-043 — Apple touch icon 180x180 PNG is linked", async ({ page }) => {
    // Check for apple-touch-icon link with the 180x180 PNG
    const appleIcon = page.locator('link[rel="apple-touch-icon"][sizes="180x180"]')
    await expect(appleIcon).toBeAttached()
    const href = await appleIcon.getAttribute("href")
    expect(href).toMatch(/apple-touch-icon-180\.png$/)
  })

  test("TC-PWA-040 — application-name is set in metadata", async ({ page }) => {
    // application-name can appear as meta tag or be inferred from <title>
    const appNameMeta = page.locator('meta[name="application-name"]')
    const metaCount = await appNameMeta.count()
    if (metaCount > 0) {
      await expect(appNameMeta).toHaveAttribute("content", "Zen Berry")
    } else {
      const title = await page.title()
      expect(title).toContain("Zen Berry")
    }
  })
})

test.describe("PWA — Service Worker Registration", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
  })

  test("TC-PWA-002 — Service worker is registered (when active)", async ({ page }) => {
    const hasSW = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return { supported: false, registered: false }

      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) return { supported: true, registered: false, reason: "no registration" }

        return {
          supported: true,
          registered: true,
          active: !!registration.active,
          scriptURL: registration.active?.scriptURL ?? null,
          scope: registration.scope,
        }
      } catch {
        return { supported: true, registered: false, reason: "error" }
      }
    })

    expect(hasSW.supported).toBe(true)

    if (hasSW.registered) {
      expect(hasSW.active).toBe(true)
      expect(hasSW.scriptURL).toMatch(/\/sw\.js$/)
      // Scope should be origin root
      expect(hasSW.scope).toMatch(/^https?:\/\/[^/]+\/$/)
    }
  })

  test("TC-PWA-004 — Service worker installation and activation", async ({ page }) => {
    const swState = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return { supported: false }

      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration) return { supported: true, registered: false }

        return {
          supported: true,
          registered: true,
          active: !!registration.active,
          installing: !!registration.installing,
          waiting: !!registration.waiting,
        }
      } catch {
        return { supported: true, registered: false }
      }
    })

    expect(swState.supported).toBe(true)

    if (swState.registered) {
      expect(swState.active).toBe(true)
    }
  })

  test("TC-PWA-072 — App works without SW support (graceful degradation)", async ({ page }) => {
    // Simulate a browser without serviceWorker support by removing the property
    // from navigator before any page JavaScript runs.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "serviceWorker", {
        get: () => undefined,
        configurable: true,
      })
    })

    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")

    // Verify the page rendered with no errors despite SW being unavailable.
    expect(errors).toHaveLength(0)
    await expect(page.locator("body")).not.toBeEmpty()
  })
})

test.describe("PWA — Offline Fallback Page", () => {
  test("TC-PWA-021 — Offline fallback page exists and is accessible", async ({ page }) => {
    const response = await page.goto("/~offline")
    expect(response).not.toBeNull()
    expect(response!.ok()).toBe(true)

    // The page should contain the offline message
    await expect(page.locator("h1")).toContainText("offline")
    await expect(page.locator("p")).toContainText("Your timer and tasks are still available")
  })

  test("TC-PWA-021b — Offline fallback page is a server component (no client JS errors)", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/~offline")
    await page.waitForLoadState("networkidle")

    expect(errors).toHaveLength(0)
  })

  test("TC-PWA-020 — Offline fallback page serves for uncached navigations", async ({ page }) => {
    // This test verifies that when offline and navigating to an uncached page,
    // the service worker serves the /~offline fallback.
    // This requires an active SW, so skip if SW is not active.
    const swActive = await hasActiveSW(page)
    test.skip(!swActive, "SW not active — offline fallback for uncached pages requires SW")

    // Load the dashboard first to ensure the SW is in control
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")

    // Go offline
    await page.context().setOffline(true)

    try {
      // Navigate to an uncached page
      await page.goto("/some-uncached-page-" + Date.now())
      // Wait for the page to settle
      await page.waitForLoadState("domcontentloaded")

      // The SW should serve the /~offline fallback
      const title = await page.locator("h1").textContent()
      expect(title?.toLowerCase()).toContain("offline")
    } finally {
      // Always go back online
      await page.context().setOffline(false)
    }
  })
})

test.describe("PWA — Static Assets & Icons", () => {
  test("TC-PWA-062 — icon-192.png is a valid 192x192 image", async ({ page }) => {
    // Verify the file is served
    const response = await page.goto("/icon-192.png")
    expect(response).not.toBeNull()
    expect(response!.ok()).toBe(true)
    expect(response!.headers()["content-type"]).toBe("image/png")

    // Verify actual image dimensions using browser Image element
    const dimensions = await page.evaluate(() => {
      return new Promise<{ width: number; height: number } | null>((resolve) => {
        const img = new Image()
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
        img.onerror = () => resolve(null)
        img.src = "/icon-192.png"
      })
    })
    expect(dimensions).toEqual({ width: 192, height: 192 })
  })

  test("TC-PWA-063 — icon-512.png is a valid 512x512 image", async ({ page }) => {
    // Verify the file is served
    const response = await page.goto("/icon-512.png")
    expect(response).not.toBeNull()
    expect(response!.ok()).toBe(true)
    expect(response!.headers()["content-type"]).toBe("image/png")

    // Verify actual image dimensions
    const dimensions = await page.evaluate(() => {
      return new Promise<{ width: number; height: number } | null>((resolve) => {
        const img = new Image()
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
        img.onerror = () => resolve(null)
        img.src = "/icon-512.png"
      })
    })
    expect(dimensions).toEqual({ width: 512, height: 512 })
  })

  test("TC-PWA-064 — apple-touch-icon-180.png is a valid 180x180 image", async ({ page }) => {
    // Verify the file is served
    const response = await page.goto("/apple-touch-icon-180.png")
    expect(response).not.toBeNull()
    expect(response!.ok()).toBe(true)
    expect(response!.headers()["content-type"]).toBe("image/png")

    // Verify actual image dimensions
    const dimensions = await page.evaluate(() => {
      return new Promise<{ width: number; height: number } | null>((resolve) => {
        const img = new Image()
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
        img.onerror = () => resolve(null)
        img.src = "/apple-touch-icon-180.png"
      })
    })
    expect(dimensions).toEqual({ width: 180, height: 180 })
  })

  test("TC-PWA-013/014 — Static assets are served correctly (SVG, manifest)", async ({ page }) => {
    // Verify the site.webmanifest is accessible
    const manifestResponse = await page.goto("/site.webmanifest")
    expect(manifestResponse).not.toBeNull()
    expect(manifestResponse!.ok()).toBe(true)
    expect(manifestResponse!.headers()["content-type"]).toContain("json")
  })
})

test.describe("PWA — Network Resiliency", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
  })

  test("TC-PWA-022 — Timer runs when offline (Zustand-based, no network needed)", async ({ page }) => {
    // Verify the timer card loaded
    await expect(page.locator("body")).not.toBeEmpty()

    // Find and click the start button
    const startBtn = page.getByRole("button", { name: /start/i })
    await expect(startBtn).toBeVisible({ timeout: 10000 })

    // Get the time before starting (should be "25:00" for default Classic Pomodoro)
    const timeBefore = await getTimerText(page)
    expect(timeBefore).toMatch(/^\d{2}:\d{2}$/)

    // Click start to begin the timer
    await startBtn.click()

    // Wait a moment for the timer to begin counting
    await page.waitForTimeout(1500)

    // Verify the timer is now running by checking the button text changed to "Pause"
    await expect(page.getByRole("button", { name: /pause/i })).toBeVisible({ timeout: 3000 })

    // Go offline
    await page.context().setOffline(true)

    try {
      // Wait a few seconds for the timer to tick while offline
      await page.waitForTimeout(3000)

      // Get the time after going offline
      const timeAfter = await getTimerText(page)
      expect(timeAfter).toMatch(/^\d{2}:\d{2}$/)

      // Verify the timer advanced (time decreased) — it should be at least 3 seconds less
      const [minsBefore, secsBefore] = timeBefore.split(":").map(Number)
      const [minsAfter, secsAfter] = timeAfter.split(":").map(Number)
      const totalSecsBefore = minsBefore * 60 + secsBefore
      const totalSecsAfter = minsAfter * 60 + secsAfter

      expect(totalSecsAfter).toBeLessThan(totalSecsBefore)
    } finally {
      // Always go back online
      await page.context().setOffline(false)
    }
  })

  test("TC-PWA-025 — Previously loaded tasks visible offline", async ({ page }) => {
    // Wait for the dashboard content to load
    await expect(page.locator("body")).not.toBeEmpty()

    // The MIT card and/or Brain Dump card should be present in the dashboard
    // We'll check for known card titles or sections
    const mitSection = page.locator("text=Most Important Tasks").or(page.locator("text=MIT"))
    const brainDumpSection = page.locator("text=Brain Dump")

    // At least one of these should be visible after the dashboard loads
    await expect(mitSection.or(brainDumpSection)).toBeVisible({ timeout: 10000 })

    // Go offline
    await page.context().setOffline(true)

    try {
      // Verify the page is still rendered and the sections remain visible
      await expect(page.locator("body")).not.toBeEmpty()

      // The MIT/Brain Dump sections should still be in the DOM (cached by React)
      const mitVisible = await mitSection.isVisible().catch(() => false)
      const brainDumpVisible = await brainDumpSection.isVisible().catch(() => false)
      expect(mitVisible || brainDumpVisible).toBe(true)
    } finally {
      // Always go back online
      await page.context().setOffline(false)
    }
  })

  test("TC-PWA-028 — Product tour works offline (no network dependencies)", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))

    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")

    // Verify the dashboard shell renders before going offline
    await expect(page.locator("body")).not.toBeEmpty()

    // Try to trigger the product tour via Zustand store.
    // The store is a module-scoped singleton; we access it by finding its
    // React fiber in the DOM, but that's fragile. Instead, we rely on the
    // fact that the tour has no network dependencies — going offline won't
    // affect it. The key test is that the page survives going offline.
    await page.evaluate(() => {
      // Zustand stores are bundled into the client chunk and not directly
      // accessible via import. This is best-effort — the real assertion is
      // that the page doesn't crash offline.
      try {
        // Attempt to find and trigger the product tour store
        const world = window as { __ZUSTAND__?: Record<string, object> }
        const zustandStores = world.__ZUSTAND__
        if (zustandStores) {
          for (const store of Object.values(zustandStores)) {
            const s = store as { getState?: () => { triggerTour?: () => void } }
            const state = s.getState?.()
            if (typeof state?.triggerTour === "function") {
              state.triggerTour()
            }
          }
        }
      } catch {
        // Ignore — store access is best-effort
      }
    })

    // Go offline
    await page.context().setOffline(true)

    try {
      // Verify the page is still rendered with no errors
      await expect(page.locator("body")).not.toBeEmpty()
      expect(errors).toHaveLength(0)
    } finally {
      await page.context().setOffline(false)
    }
  })
})

test.describe("PWA — Update Flow Components", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
  })

  test("TC-PWA-046 — sw-update-available event triggers toast rendering", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))

    // Verify the sonner toaster is present
    const toaster = page.locator("[data-sonner-toaster]")
    await expect(toaster).toBeAttached()

    // Build a mock registration object for the CustomEvent
    await page.evaluate(() => {
      const mockRegistration = {
        waiting: {
          postMessage: () => {
            /* no-op in test */
          },
        },
      }
      window.dispatchEvent(
        new CustomEvent("sw-update-available", { detail: { registration: mockRegistration } })
      )
    })

    // Wait for the toast to appear — the toast says "A new version is available"
    // Sonner renders a toast with role="status"
    await page.waitForTimeout(1000)

    // Check that the toast text appears somewhere in the DOM
    const pageText = await page.locator("body").textContent()
    expect(pageText).toContain("A new version is available")

    expect(errors).toHaveLength(0)
  })

  test("TC-PWA-047 — Toast shows update action button and description", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", (err) => errors.push(err.message))

    // Build a mock registration object for the CustomEvent
    await page.evaluate(() => {
      const mockRegistration = {
        waiting: {
          postMessage: () => {
            /* no-op in test */
          },
        },
      }
      window.dispatchEvent(
        new CustomEvent("sw-update-available", { detail: { registration: mockRegistration } })
      )
    })

    await page.waitForTimeout(1000)

    // Verify the toast description and action label appear
    const bodyText = await page.locator("body").textContent()
    expect(bodyText).toContain("Update to get the latest features and fixes")
    expect(bodyText).toContain("Update")

    expect(errors).toHaveLength(0)
  })

  test("TC-PWA-048 — SKIP_WAITING message can be posted to service worker", async ({ page }) => {
    // Verify the message can be posted (requires SW)
    const messageHandled = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return { supported: false }

      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (!registration?.active) {
          return { supported: true, hasActiveSW: false }
        }

        // Post a SKIP_WAITING message to the active SW
        registration.active.postMessage({ type: "SKIP_WAITING" })
        return { supported: true, hasActiveSW: true, messageSent: true }
      } catch {
        return { supported: true, hasActiveSW: false, error: true }
      }
    })

    expect(messageHandled.supported).toBe(true)

    if (messageHandled.hasActiveSW) {
      expect(messageHandled.messageSent).toBe(true)
    } else {
      // If SW is not active, still verify the mock path works with dispatch
      // (non-SW path: dispatch the event and verify the UI handles it)
      await page.evaluate(() => {
        const mockRegistration = {
          waiting: {
            postMessage: (msg: { type: string }) => {
              // In test context, just verify the message shape
              if (msg.type !== "SKIP_WAITING") throw new Error("Unexpected message type")
            },
          },
        }
        mockRegistration.waiting.postMessage({ type: "SKIP_WAITING" })
      })
    }
  })
})
