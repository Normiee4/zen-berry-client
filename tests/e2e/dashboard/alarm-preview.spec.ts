import { test, expect } from "../../fixtures/audio-fixture"

test.describe("Timer alarm preview — AudioContext suspend handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
  })

  test("preview calls resume() when AudioContext is suspended", async ({
    page,
    audioMonitor,
  }) => {
    const settingsBtn = page.getByRole("button", { name: /settings/i })
    await settingsBtn.click()

    const previewBtn = page.getByRole("button", { name: "Preview sound" }).first()
    await previewBtn.click()

    await page.waitForTimeout(500)

    const resumeCount = await audioMonitor.getResumeCallCount()
    expect(resumeCount).toBeGreaterThanOrEqual(1)
  })

  test("preview starts audio buffer after resume resolves", async ({
    page,
    audioMonitor,
  }) => {
    const settingsBtn = page.getByRole("button", { name: /settings/i })
    await settingsBtn.click()

    const previewBtn = page.getByRole("button", { name: "Preview sound" }).first()
    await previewBtn.click()

    await page.waitForTimeout(1000)

    const playCount = await audioMonitor.getPlayStartCount()
    expect(playCount).toBeGreaterThanOrEqual(1)
  })

  test("preview toggles to stop on second click", async ({ page, audioMonitor }) => {
    const settingsBtn = page.getByRole("button", { name: /settings/i })
    await settingsBtn.click()

    const previewBtn = page.getByRole("button", { name: "Preview sound" }).first()
    await previewBtn.click()

    await page.waitForTimeout(500)

    const stopBtn = page.getByRole("button", { name: "Stop preview" }).first()
    await stopBtn.click()

    await audioMonitor.reset()
    await page.waitForTimeout(500)

    const newStarts = await audioMonitor.getPlayStartCount()
    expect(newStarts).toBe(0)
  })
})
