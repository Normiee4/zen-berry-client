import { describe, it, expect, beforeEach } from "vitest"

// ──────────────────────────────────────────────
// ProductTourStore — pure Zustand store tests
// ──────────────────────────────────────────────
//
// The store is a simple Zustand store with no side effects:
// - tourTriggered: boolean (default false)
// - triggerTour: () => void  (sets tourTriggered to true)
// - clearTourTrigger: () => void (sets tourTriggered to false)
//
// We import it fresh for each test suite via dynamic import to
// ensure clean state, though Zustand stores can also be reset.
// ──────────────────────────────────────────────

describe("ProductTourStore initial state", () => {
  it("has tourTriggered set to false by default", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    expect(useProductTourStore.getState().tourTriggered).toBe(false)
  })

  it("has triggerTour and clearTourTrigger as functions", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    const state = useProductTourStore.getState()
    expect(typeof state.triggerTour).toBe("function")
    expect(typeof state.clearTourTrigger).toBe("function")
  })

  it("has exactly the expected state shape", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    const state = useProductTourStore.getState()
    expect(Object.keys(state).sort()).toEqual([
      "clearTourTrigger",
      "tourTriggered",
      "triggerTour",
    ])
  })
})

describe("ProductTourStore triggerTour", () => {
  beforeEach(async () => {
    // Reset store state
    const { useProductTourStore } = await import("@/store/product-tour-store")
    useProductTourStore.setState({ tourTriggered: false })
  })

  it("sets tourTriggered to true", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    useProductTourStore.getState().triggerTour()
    expect(useProductTourStore.getState().tourTriggered).toBe(true)
  })

  it("is idempotent — calling multiple times keeps tourTriggered true", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    useProductTourStore.getState().triggerTour()
    useProductTourStore.getState().triggerTour()
    useProductTourStore.getState().triggerTour()
    expect(useProductTourStore.getState().tourTriggered).toBe(true)
  })
})

describe("ProductTourStore clearTourTrigger", () => {
  beforeEach(async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    useProductTourStore.setState({ tourTriggered: false })
  })

  it("sets tourTriggered to false", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    // First trigger
    useProductTourStore.getState().triggerTour()
    expect(useProductTourStore.getState().tourTriggered).toBe(true)

    // Then clear
    useProductTourStore.getState().clearTourTrigger()
    expect(useProductTourStore.getState().tourTriggered).toBe(false)
  })

  it("is idempotent — calling multiple times keeps tourTriggered false", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    useProductTourStore.getState().clearTourTrigger()
    useProductTourStore.getState().clearTourTrigger()
    useProductTourStore.getState().clearTourTrigger()
    expect(useProductTourStore.getState().tourTriggered).toBe(false)
  })

  it("does nothing when already false (no-op)", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    expect(useProductTourStore.getState().tourTriggered).toBe(false)
    useProductTourStore.getState().clearTourTrigger()
    expect(useProductTourStore.getState().tourTriggered).toBe(false)
  })
})

describe("ProductTourStore state transitions", () => {
  beforeEach(async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    useProductTourStore.setState({ tourTriggered: false })
  })

  it("transitions correctly: false → trigger → true → clear → false", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")

    // Start false
    expect(useProductTourStore.getState().tourTriggered).toBe(false)

    // Trigger
    useProductTourStore.getState().triggerTour()
    expect(useProductTourStore.getState().tourTriggered).toBe(true)

    // Clear
    useProductTourStore.getState().clearTourTrigger()
    expect(useProductTourStore.getState().tourTriggered).toBe(false)
  })

  it("transitions correctly: true → clear → false → trigger → true", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")

    // Set initial to true
    useProductTourStore.getState().triggerTour()
    expect(useProductTourStore.getState().tourTriggered).toBe(true)

    // Clear
    useProductTourStore.getState().clearTourTrigger()
    expect(useProductTourStore.getState().tourTriggered).toBe(false)

    // Re-trigger
    useProductTourStore.getState().triggerTour()
    expect(useProductTourStore.getState().tourTriggered).toBe(true)
  })

  it("has no side effects — state only changes when actions are called", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")

    // Capture initial state
    const initialState = { ...useProductTourStore.getState() }

    // No-op: just read state
    const _readonly = useProductTourStore.getState().tourTriggered

    // State should be unchanged
    expect(useProductTourStore.getState()).toEqual(initialState)
  })
})

describe("ProductTourStore setState direct manipulation", () => {
  it("can be set to true directly via setState", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    useProductTourStore.setState({ tourTriggered: true })
    expect(useProductTourStore.getState().tourTriggered).toBe(true)
  })

  it("can be set to false directly via setState", async () => {
    const { useProductTourStore } = await import("@/store/product-tour-store")
    useProductTourStore.setState({ tourTriggered: true })
    useProductTourStore.setState({ tourTriggered: false })
    expect(useProductTourStore.getState().tourTriggered).toBe(false)
  })
})
