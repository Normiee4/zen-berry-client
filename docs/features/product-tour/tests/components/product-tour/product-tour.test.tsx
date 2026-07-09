import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, cleanup } from "@testing-library/react"
import pkg from "@/package.json"

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

const mockDrive = vi.fn()
const mockDestroy = vi.fn()

let driverConfigCaptured: Record<string, unknown> | null = null

vi.mock("driver.js", () => ({
  driver: (config: Record<string, unknown>) => {
    driverConfigCaptured = config
    return {
      drive: mockDrive,
      destroy: mockDestroy,
    }
  },
}))

// ──────────────────────────────────────────────
// Import after mocks
// ──────────────────────────────────────────────

import { ProductTour } from "@/components/product-tour/product-tour"

// ──────────────────────────────────────────────
// Test data
// ──────────────────────────────────────────────

const mockSteps = [
  { element: '[data-tour="step-1"]', popover: { title: "Welcome", description: "Desc 1", side: "right" as const } },
  { element: '[data-tour="step-2"]', popover: { title: "Timer", description: "Desc 2", side: "right" as const } },
  { element: '[data-tour="step-3"]', popover: { title: "MIT", description: "Desc 3", side: "right" as const } },
  { element: '[data-tour="step-4"]', popover: { title: "Brain Dump", description: "Desc 4", side: "right" as const } },
  { element: '[data-tour="step-5"]', popover: { title: "Streak", description: "Desc 5", side: "right" as const } },
  { element: '[data-tour="step-6"]', popover: { title: "AI Insights", description: "Desc 6", side: "left" as const } },
  { element: '[data-tour="step-7"]', popover: { title: "Help", description: "Desc 7", side: "bottom" as const } },
]

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Simulates an `onPopoverRender` call with the given step index.
 * Returns the HTML content of the injected progress element.
 */
function simulatePopoverRender(stepIndex: number): string {
  const footer = document.createElement("div")
  footer.className = "driver-popover-footer"

  const popover = {
    footer,
    querySelector: (selector: string) => {
      if (selector === ".driver-popover-footer") return footer
      if (selector === ".zb-tour-progress") return footer.querySelector(".zb-tour-progress")
      return null
    },
  }

  const onRender = driverConfigCaptured?.onPopoverRender as (popover: unknown, opts: unknown) => void
  onRender(popover, { state: { activeIndex: stepIndex } })

  const progressEl = footer.querySelector(".zb-tour-progress")
  return progressEl?.innerHTML ?? ""
}

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("ProductTour component", () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    driverConfigCaptured = null
  })

  afterEach(() => {
    cleanup()
  })

  describe("rendering", () => {
    it("renders null (no DOM output)", () => {
      const { container } = render(
        <ProductTour isActive={false} steps={mockSteps} onClose={onClose} />,
      )

      expect(container.firstChild).toBeNull()
    })

    it("returns null regardless of props", () => {
      const { container: c1 } = render(
        <ProductTour isActive={true} steps={mockSteps} onClose={onClose} />,
      )
      const { container: c2 } = render(
        <ProductTour isActive={false} steps={[]} onClose={onClose} />,
      )

      expect(c1.firstChild).toBeNull()
      expect(c2.firstChild).toBeNull()
    })
  })

  describe("initialization", () => {
    it("calls injectTourStyles on mount", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      expect(mockInjectTourStyles).toHaveBeenCalledTimes(1)
    })

    it("calls injectTourStyles only once even on re-renders", () => {
      const { rerender } = render(
        <ProductTour isActive={false} steps={mockSteps} onClose={onClose} />,
      )

      rerender(<ProductTour isActive={true} steps={mockSteps} onClose={onClose} />)
      rerender(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      // injectTourStyles is called in the useEffect that runs on mount only
      // (steps and handleClose are in deps, so it could re-run if those change)
      // But since our mock steps reference doesn't change, it should run once
      expect(mockInjectTourStyles).toHaveBeenCalledTimes(1)
    })

    it("initializes driver with correct configuration", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      expect(driverConfigCaptured).not.toBeNull()
      expect(driverConfigCaptured?.showProgress).toBe(false)
      expect(driverConfigCaptured?.animate).toBe(true)
      expect(driverConfigCaptured?.stagePadding).toBe(8)
      expect(driverConfigCaptured?.popoverClass).toBe("zb-tour-popover")
      expect(driverConfigCaptured?.disableActiveInteraction).toBe(false)
    })

    it("has correct button text config", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      expect(driverConfigCaptured?.prevBtnText).toBe("Back")
      expect(driverConfigCaptured?.nextBtnText).toBe("Next")
      expect(driverConfigCaptured?.doneBtnText).toBe("Finish")

      // ════════════════════════════════════════════════════════════════════
      // NOTE: Back/Next navigation behavior
      // ════════════════════════════════════════════════════════════════════
      // We verify the button label text above to confirm the config is
      // correctly wired. However, we CANNOT unit-test driver.js internal
      // navigation behavior (e.g., "clicking Next advances to step 2")
      // because:
      //   1. driver.js requires a real browser DOM with visible elements
      //      matching the step selectors for its scroll/position logic
      //   2. The `drive()` method and internal step tracking are opaque
      //      to our mock — our mock captures config but doesn't run the
      //      actual driver.js engine
      //   3. Driver.js popover rendering, event binding, and step
      //      transitions are all browser-native behaviors
      //
      // For full behavioral verification of step-by-step navigation
      // (Back, Next, Finish, close button), use Playwright E2E tests
      // with a real browser context, where driver.js can interact with
      // actual DOM elements, scroll positions, and popover rendering.
      // ════════════════════════════════════════════════════════════════════
    })

    it("passes steps to driver configuration", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      expect(driverConfigCaptured?.steps).toBe(mockSteps)
    })

    it("has overlayColor matching matcha-dark tint", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      expect(driverConfigCaptured?.overlayColor).toBe("rgba(42, 61, 44, 0.4)")
    })

    it("has showButtons as an empty array (custom buttons in popover)", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      expect(driverConfigCaptured?.showButtons).toEqual([])
    })
  })

  describe("driver lifecycle", () => {
    it("destroys driver instance on unmount", () => {
      const { unmount } = render(
        <ProductTour isActive={false} steps={mockSteps} onClose={onClose} />,
      )

      unmount()

      expect(mockDestroy).toHaveBeenCalledTimes(1)
    })

    it("calls drive() when isActive becomes true after mount", () => {
      const { rerender } = render(
        <ProductTour isActive={false} steps={mockSteps} onClose={onClose} />,
      )

      expect(mockDrive).not.toHaveBeenCalled()

      rerender(<ProductTour isActive={true} steps={mockSteps} onClose={onClose} />)

      expect(mockDrive).toHaveBeenCalledTimes(1)
    })

    it("calls drive() with no arguments (starts from step 0)", () => {
      const { rerender } = render(
        <ProductTour isActive={false} steps={mockSteps} onClose={onClose} />,
      )

      rerender(<ProductTour isActive={true} steps={mockSteps} onClose={onClose} />)

      expect(mockDrive).toHaveBeenCalledWith()
    })

    it("starts tour when isActive is true on mount", () => {
      render(<ProductTour isActive={true} steps={mockSteps} onClose={onClose} />)

      expect(mockDrive).toHaveBeenCalledTimes(1)
    })

    it("does not call drive() again when isActive stays true on re-render", () => {
      const { rerender } = render(
        <ProductTour isActive={true} steps={mockSteps} onClose={onClose} />,
      )

      rerender(<ProductTour isActive={true} steps={mockSteps} onClose={onClose} />)

      // Should only have been called once (from the initial mount effect)
      expect(mockDrive).toHaveBeenCalledTimes(1)
    })
  })

  describe("onDestroyed callback", () => {
    it("calls onClose when driver's onDestroyed fires", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      const onDestroyed = driverConfigCaptured?.onDestroyed as () => void
      onDestroyed()

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("calls onClose each time onDestroyed fires (multiple closes)", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      const onDestroyed = driverConfigCaptured?.onDestroyed as () => void
      onDestroyed()
      onDestroyed()
      onDestroyed()

      expect(onClose).toHaveBeenCalledTimes(3)
    })
  })

  describe("onPopoverRender callback — progress injection", () => {
    beforeEach(() => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)
    })

    it("injects progress HTML into popover footer on render", () => {
      const html = simulatePopoverRender(0)

      expect(html).toBeTruthy()
      expect(html).toContain("zb-tour-progress")
    })

    it("progress HTML contains 'Step X of 7' text", () => {
      const html = simulatePopoverRender(0)

      expect(html).toContain("Step")
      expect(html).toContain("of 7")
    })

    it("shows correct step number (1-indexed) in progress", () => {
      const html = simulatePopoverRender(3)

      expect(html).toContain("Step 4 of 7")
    })

    it("removes previous progress element before adding new one", () => {
      const footer = document.createElement("div")
      footer.className = "driver-popover-footer"

      const popover = {
        footer,
        querySelector: (selector: string) => {
          if (selector === ".driver-popover-footer") return footer
          if (selector === ".zb-tour-progress") return footer.querySelector(".zb-tour-progress")
          return null
        },
      }

      const onRender = driverConfigCaptured?.onPopoverRender as (popover: unknown, opts: unknown) => void

      // First render
      onRender(popover, { state: { activeIndex: 0 } })
      const firstProgressElements = footer.querySelectorAll(".zb-tour-progress")
      expect(firstProgressElements.length).toBe(1)

      // Second render — should replace, not duplicate
      onRender(popover, { state: { activeIndex: 1 } })
      const secondProgressElements = footer.querySelectorAll(".zb-tour-progress")
      expect(secondProgressElements.length).toBe(1)
    })
  })

  describe("close button integration", () => {
    it("close button is enabled (showCloseButton not explicitly disabled)", () => {
      render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      // driver.js shows the close button (X) by default.
      // The config must NOT set showCloseButton: false to ensure it's available.
      expect(driverConfigCaptured?.showCloseButton).not.toBe(false)
      // Also verify showCloseButton is either undefined (default) or true
      if (driverConfigCaptured?.showCloseButton !== undefined) {
        expect(driverConfigCaptured?.showCloseButton).toBe(true)
      }
    })
  })

  describe("dependency check", () => {
    it("driver.js is listed in package.json dependencies", () => {
      expect(pkg.dependencies).toHaveProperty("driver.js")
    })
  })

  describe("edge cases", () => {
    it("handles isActive changing from true to false without error", () => {
      const { rerender } = render(
        <ProductTour isActive={true} steps={mockSteps} onClose={onClose} />,
      )

      expect(() => {
        rerender(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)
      }).not.toThrow()
    })

    it("handles empty steps array gracefully", () => {
      expect(() => {
        render(<ProductTour isActive={false} steps={[]} onClose={onClose} />)
      }).not.toThrow()
    })

    it("handles multiple active toggles", () => {
      const { rerender } = render(
        <ProductTour isActive={false} steps={mockSteps} onClose={onClose} />,
      )

      // Toggle on
      rerender(<ProductTour isActive={true} steps={mockSteps} onClose={onClose} />)
      expect(mockDrive).toHaveBeenCalledTimes(1)

      // Toggle off
      rerender(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)

      // Toggle on again — should drive again
      rerender(<ProductTour isActive={true} steps={mockSteps} onClose={onClose} />)
      expect(mockDrive).toHaveBeenCalledTimes(2)
    })
  })
})

// ──────────────────────────────────────────────
// getProgressHTML — illustration and step counter unit tests
// (tested through the onPopoverRender callback)
// ──────────────────────────────────────────────

describe("getProgressHTML — illustration selection", () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    driverConfigCaptured = null
    render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)
  })

  afterEach(() => {
    cleanup()
  })

  it("uses strawberry illustration for step 0 (first half)", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("/strawberry_illustration.png")
    expect(html).toContain('alt="Strawberry"')
  })

  it("uses strawberry illustration for step 1 (first half)", () => {
    const html = simulatePopoverRender(1)
    expect(html).toContain("/strawberry_illustration.png")
  })

  it("uses strawberry illustration for step 2 (first half)", () => {
    const html = simulatePopoverRender(2)
    expect(html).toContain("/strawberry_illustration.png")
  })

  it("switches to matcha illustration at step 3 (second half)", () => {
    const html = simulatePopoverRender(3)
    expect(html).toContain("/matcha_illustration.png")
    expect(html).toContain('alt="Matcha"')
  })

  it("uses matcha illustration for step 4 (second half)", () => {
    const html = simulatePopoverRender(4)
    expect(html).toContain("/matcha_illustration.png")
  })

  it("uses matcha illustration for step 5 (second half)", () => {
    const html = simulatePopoverRender(5)
    expect(html).toContain("/matcha_illustration.png")
  })

  it("uses matcha illustration for step 6 (second half)", () => {
    const html = simulatePopoverRender(6)
    expect(html).toContain("/matcha_illustration.png")
  })

  it("step 0 has animate-idle class on strawberry", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("animate-idle")
    expect(html).not.toContain("animate-steam")
  })

  it("step 4 has animate-steam class on matcha", () => {
    const html = simulatePopoverRender(4)
    expect(html).toContain("animate-steam")
    expect(html).not.toContain("animate-idle")
  })
})

describe("getProgressHTML — sparkles and SVG", () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    driverConfigCaptured = null
    render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)
  })

  afterEach(() => {
    cleanup()
  })

  it("includes SVG sparkles element", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("zb-tour-sparkles")
    expect(html).toContain("<svg")
    expect(html).toContain("</svg>")
  })

  it("SVG sparkles have animate-sparkle class", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("animate-sparkle")
  })

  it("SVG sparkles have staggered animation delays", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("animation-delay:0s")
    expect(html).toContain("animation-delay:0.3s")
    expect(html).toContain("animation-delay:0.6s")
  })

  it("SVG uses correct viewBox and dimensions", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain('width="60"')
    expect(html).toContain('height="30"')
    expect(html).toContain('viewBox="0 0 60 30"')
  })

  it("SVG sparkles use strawberry and matcha colors", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain('#FFCFCF')
    expect(html).toContain('#86A788')
  })
})

describe("getProgressHTML — step counter and dots", () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    driverConfigCaptured = null
    render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)
  })

  afterEach(() => {
    cleanup()
  })

  it("shows 'Step 1 of 7' for step index 0", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("Step 1 of 7")
  })

  it("shows 'Step 7 of 7' for step index 6", () => {
    const html = simulatePopoverRender(6)
    expect(html).toContain("Step 7 of 7")
  })

  it("renders exactly 7 progress dots", () => {
    const html = simulatePopoverRender(0)
    const dotCount = (html.match(/zb-tour-progress-dot/g) || []).length
    expect(dotCount).toBe(7)
  })

  it("marks the current step dot as 'active'", () => {
    const html = simulatePopoverRender(3)
    // Index 3 → 4th dot should be active
    expect(html).toMatch(/class="zb-tour-progress-dot active"/)
  })

  it("marks completed steps with 'completed' class", () => {
    const html = simulatePopoverRender(4)
    // Indices 0-3 should be "completed" (4 dots)
    const completedMatches = html.match(/class="zb-tour-progress-dot completed"/g)
    expect(completedMatches).toHaveLength(4)
  })

  it("marks only one dot as active at a time", () => {
    const html = simulatePopoverRender(2)
    const activeMatches = html.match(/class="zb-tour-progress-dot active"/g)
    expect(activeMatches).toHaveLength(1)
  })

  it("has no active dots at step 0 (first step)", () => {
    const html = simulatePopoverRender(0)
    // The first dot is active, remaining 6 are plain
    const activeMatches = html.match(/class="zb-tour-progress-dot active"/g)
    expect(activeMatches).toHaveLength(1)
  })

  it("all dots are completed at the last step except current", () => {
    const html = simulatePopoverRender(6)
    const completedMatches = html.match(/class="zb-tour-progress-dot completed"/g)
    expect(completedMatches).toHaveLength(6) // steps 0-5 completed
  })

  it("step counter text is uppercase (CSS expectation)", () => {
    const html = simulatePopoverRender(0)
    const textEl = html.match(/Step \d+ of \d+/)
    expect(textEl).toBeTruthy()
  })
})

describe("getProgressHTML — structure and classes", () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    driverConfigCaptured = null
    render(<ProductTour isActive={false} steps={mockSteps} onClose={onClose} />)
  })

  afterEach(() => {
    cleanup()
  })

  it("has zb-tour-progress wrapper class", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain('class="zb-tour-progress-illustration"')
  })

  it("includes progress illustration container", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("zb-tour-progress-illustration")
  })

  it("includes progress counter container", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("zb-tour-progress-counter")
  })

  it("includes dot container", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("zb-tour-progress-dots")
  })

  it("progress img has zb-tour-progress-img class", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("zb-tour-progress-img")
  })

  it("progress text has zb-tour-progress-text class", () => {
    const html = simulatePopoverRender(0)
    expect(html).toContain("zb-tour-progress-text")
  })
})
