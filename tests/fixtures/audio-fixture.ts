/* eslint-disable react-hooks/rules-of-hooks -- Playwright fixture, not a React hook */
import { test as base, expect, type Page } from "@playwright/test"

interface AudioEvent {
  type: string
  timestamp: number
}

class AudioMonitor {
  constructor(private page: Page) {}

  async install(): Promise<void> {
    await this.page.addInitScript(() => {
      (window as unknown as Record<string, unknown>).__audioEvents = [] as AudioEvent[]

      const origResume = AudioContext.prototype.resume
      AudioContext.prototype.resume = function (...args: unknown[]) {
        ;(window as unknown as Record<string, unknown[]>).__audioEvents.push({
          type: "audio-context-resume",
          timestamp: Date.now(),
        })
        return origResume.apply(this, args as [])
      }

      const origStart = AudioBufferSourceNode.prototype.start
      AudioBufferSourceNode.prototype.start = function (...args: unknown[]) {
        ;(window as unknown as Record<string, unknown[]>).__audioEvents.push({
          type: "web-audio-start",
          timestamp: Date.now(),
        })
        return origStart.apply(this, args as [])
      }
    })
  }

  async getEvents(): Promise<AudioEvent[]> {
    return this.page.evaluate(
      () => (window as unknown as Record<string, AudioEvent[]>).__audioEvents ?? [],
    )
  }

  async getResumeCallCount(): Promise<number> {
    const events = await this.getEvents()
    return events.filter((e) => e.type === "audio-context-resume").length
  }

  async getPlayStartCount(): Promise<number> {
    const events = await this.getEvents()
    return events.filter((e) => e.type === "web-audio-start").length
  }

  async reset(): Promise<void> {
    await this.page.evaluate(() => {
      ;(window as unknown as Record<string, unknown>).__audioEvents = []
    })
  }
}

type AudioFixtures = {
  audioMonitor: AudioMonitor
}

export const test = base.extend<AudioFixtures>({
  audioMonitor: async ({ page }, use) => {
    const monitor = new AudioMonitor(page)
    await monitor.install()
    await use(monitor)
  },
})

export { expect }
