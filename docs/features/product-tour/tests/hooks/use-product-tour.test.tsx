import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

let mockTourTriggered = false
const mockTriggerTour = vi.fn(() => {
  mockTourTriggered = true
})
const mockClearTourTrigger = vi.fn(() => {
  mockTourTriggered = false
})

vi.mock("@/store/product-tour-store", () => ({
  useProductTourStore: (selector: (state: Record<string, unknown>) => unknown) => {
    const state = {
      tourTriggered: mockTourTriggered,
      triggerTour: mockTriggerTour,
      clearTourTrigger: mockClearTourTrigger,
    }
    return selector(state)
  },
}))

const mockUseResponsive = vi.fn()
vi.mock("@/hooks/useResponsive", () => ({
  useResponsive: () => mockUseResponsive(),
}))

// ──────────────────────────────────────────────
// Import after mocks
// ──────────────────────────────────────────────

import { useProductTour } from "@/hooks/use-product-tour"

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks()
  mockTourTriggered = false
  mockUseResponsive.mockReturnValue({ isMobile: false })
})

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("useProductTour()", () => {
  describe("return shape", () => {
    it("returns startTour, isActive, steps, and onClose", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current).toHaveProperty("startTour")
      expect(result.current).toHaveProperty("isActive")
      expect(result.current).toHaveProperty("steps")
      expect(result.current).toHaveProperty("onClose")
    })

    it("startTour is the triggerTour function from the store", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.startTour).toBe(mockTriggerTour)
    })

    it("onClose is the clearTourTrigger function from the store", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.onClose).toBe(mockClearTourTrigger)
    })

    it("isActive reflects tourTriggered from the store (default false)", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.isActive).toBe(false)
    })

    it("isActive is true when store tourTriggered is true", () => {
      mockTourTriggered = true

      const { result } = renderHook(() => useProductTour())

      expect(result.current.isActive).toBe(true)
    })
  })

  describe("steps array", () => {
    it("has exactly 7 steps", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps).toHaveLength(7)
    })

    it("each step has element (string) and popover (object) with title, description, side", () => {
      const { result } = renderHook(() => useProductTour())

      for (const step of result.current.steps) {
        expect(typeof step.element).toBe("string")
        expect(step.popover).toBeTypeOf("object")
        expect(step.popover).toHaveProperty("title")
        expect(step.popover).toHaveProperty("description")
        expect(step.popover).toHaveProperty("side")
      }
    })

    it("each step has a non-empty title and description", () => {
      const { result } = renderHook(() => useProductTour())

      for (const step of result.current.steps) {
        expect(step.popover.title).toBeTruthy()
        expect(step.popover.description).toBeTruthy()
        expect(typeof step.popover.title).toBe("string")
        expect(typeof step.popover.description).toBe("string")
      }
    })

    it("each step selector matches [data-tour='step-<n>'] pattern for n = 1..7", () => {
      const { result } = renderHook(() => useProductTour())

      result.current.steps.forEach((step, i) => {
        expect(step.element).toBe(`[data-tour="step-${i + 1}"]`)
      })
    })
  })

  describe("desktop side mapping", () => {
    it("steps 1-5 (indices 0-4) have side 'right'", () => {
      const { result } = renderHook(() => useProductTour())

      for (let i = 0; i < 5; i++) {
        expect(result.current.steps[i].popover.side).toBe("right")
      }
    })

    it("step 6 (index 5) has side 'left'", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[5].popover.side).toBe("left")
    })

    it("step 7 (index 6) has side 'bottom'", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[6].popover.side).toBe("bottom")
    })
  })

  describe("mobile behavior", () => {
    it("all 7 steps have side 'bottom' when isMobile is true", () => {
      mockUseResponsive.mockReturnValue({ isMobile: true })

      const { result } = renderHook(() => useProductTour())

      for (const step of result.current.steps) {
        expect(step.popover.side).toBe("bottom")
      }
    })

    it("desktop sides used when isMobile is false", () => {
      mockUseResponsive.mockReturnValue({ isMobile: false })

      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[0].popover.side).toBe("right")
      expect(result.current.steps[5].popover.side).toBe("left")
      expect(result.current.steps[6].popover.side).toBe("bottom")
    })
  })

  describe("step content accuracy", () => {
    it("step 1 (sidebar) has 'Welcome' in title", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[0].popover.title).toContain("Welcome")
    })

    it("step 2 (timer) has 'Timer Card' in title", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[1].popover.title).toContain("Timer")
    })

    it("step 3 (MIT) references 'Most Important Tasks'", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[2].popover.description).toContain("Most Important")
    })

    it("step 4 (brain dump) references 'Quick-capture'", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[3].popover.description).toContain("Quick-capture")
    })

    it("step 5 (streak) references 'Streak'", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[4].popover.title).toContain("Streak")
    })

    it("step 6 (AI) references 'AI Insights'", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[5].popover.title).toContain("AI")
    })

    it("step 7 (help) has 'Help & Tour' title", () => {
      const { result } = renderHook(() => useProductTour())

      expect(result.current.steps[6].popover.title).toContain("Help")
    })
  })

  describe("re-computation on isMobile change", () => {
    it("recomputes steps when isMobile changes from false to true", () => {
      const { result, rerender } = renderHook(() => useProductTour())

      // Desktop: step 0 side is "right"
      expect(result.current.steps[0].popover.side).toBe("right")

      // Switch to mobile and re-render
      mockUseResponsive.mockReturnValue({ isMobile: true })
      rerender()

      // Now all sides should be "bottom"
      for (const step of result.current.steps) {
        expect(step.popover.side).toBe("bottom")
      }
    })

    it("does not recompute steps when isMobile unchanged", () => {
      const { result, rerender } = renderHook(() => useProductTour())

      const firstSteps = result.current.steps

      // Re-render with same isMobile value
      rerender()

      // Same reference (useMemo dependency unchanged)
      expect(result.current.steps).toBe(firstSteps)
    })
  })
})
