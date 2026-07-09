# Test Spec: Product Tour

## Overview

This document describes the test strategy for the Product Tour feature. The feature uses [driver.js](https://github.com/kamranahmedse/driver.js) to create an interactive, element-by-element guided tour of the dashboard. It consists of a Zustand store (trigger mechanism), a React hook (step definitions + state bridge), a tour orchestrator (driver.js lifecycle), a help button (UI entry point), and a CSS injection utility (popover styling).

Since the project does not currently have a unit test runner configured (Playwright is in devDeps but not configured), test files live under `tests/` as reference specs. They are written in a standard `describe`/`it`/`expect` pattern compatible with Vitest (recommended) or Jest. Mocking patterns use `vi.mock()` (Vitest) and can be adapted to `jest.mock()` if needed.

---

## Test Layers

### 1. Store Layer — `store/product-tour-store.ts`

**Framework**: Unit tests with direct Zustand store assertions (no React needed)

#### Happy Path
- Initial state has `tourTriggered` set to `false`
- `triggerTour()` sets `tourTriggered` to `true`
- `clearTourTrigger()` sets `tourTriggered` to `false`
- State transitions correctly: `false → triggerTour() → true → clearTourTrigger() → false`

#### Edge Cases
- Multiple calls to `triggerTour()` keep the state `true` (idempotent)
- Multiple calls to `clearTourTrigger()` keep the state `false` (idempotent)
- Calling `clearTourTrigger()` when already `false` is a no-op
- Calling `triggerTour()` when already `true` is a no-op

#### Error Scenarios
- None — the store has no side effects, no async operations, no external dependencies

---

### 2. Hook Layer — `hooks/use-product-tour.tsx`

**Framework**: Unit tests with `@testing-library/react`'s `renderHook`, mocked store and responsive hook

#### Happy Path
- Returns shape `{ startTour, isActive, steps, onClose }`
- `steps` array has exactly 7 items
- Each step has `element` (string CSS selector) and `popover` object with `title`, `description`, `side`
- Step selectors match `[data-tour="step-<n>"]` pattern (n = 1..7)
- `isActive` reflects the store's `tourTriggered` value (`false` by default)
- `startTour` is `triggerTour` from the store
- `onClose` is `clearTourTrigger` from the store

#### Desktop Side Mapping
- Steps 1–5 use `side: "right"` (sidebar, timer, MIT, brain dump, streak — left/center columns)
- Step 6 uses `side: "left"` (AI insights — right column)
- Step 7 uses `side: "bottom"` (help button — top-right header)

#### Mobile Behavior
- When `isMobile` is `true`, all 7 steps use `side: "bottom"`
- When `isMobile` is `false`, sides follow the desktop mapping

#### Edge Cases
- `steps` is recomputed when `isMobile` changes (via `useMemo` dependency)
- Each step popover contains `title` and `description` strings (non-empty)
- Step data is static and does not change between renders (unless `isMobile` changes)

#### Mocking
- Mock `@/store/product-tour-store` with `vi.mock()` — expose `useProductTourStore` as a mock that returns controllable values
- Mock `@/hooks/useResponsive` — return `{ isMobile: boolean }`

---

### 3. Component Layer — `components/product-tour/tour-help-button.tsx`

**Framework**: Component tests with `@testing-library/react`

#### Happy Path
- Renders a `<button>` element
- Button text includes "Help"
- Renders `HelpCircle` icon (from lucide-react)
- Has `data-tour="step-7"` attribute
- Has `title="Start product tour"` attribute
- Calls `onClick` handler when clicked

#### Edge Cases
- `onClick` prop is a function and is called exactly once per click
- Component has the correct CSS classes (flex, gap, rounded, etc.)
- Button has correct `type="button"` attribute (avoids form submission)

#### Mocking
- Mock `lucide-react` to render a simple data-testid element for `HelpCircle`

---

### 4. Component Layer — `components/product-tour/product-tour.tsx`

**Framework**: Component/render tests with `@testing-library/react` and mocked `driver.js`

#### Happy Path
- Renders `null` (no DOM output)
- Calls `injectTourStyles()` on mount
- Initializes `driver()` from `driver.js` when mounted with steps
- Passes correct configuration to `driver()`:
  - `showProgress: false`
  - `animate: true`
  - `overlayColor` matches expected value
  - `stagePadding: 8`
  - `popoverClass: "zb-tour-popover"`
  - `steps` from props
- When `isActive` becomes `true`, calls `driverObj.drive()`
- When component unmounts, calls `driverObj.destroy()`
- `onPopoverRender` callback injects progress HTML into popover footer
- `onDestroyed` callback calls `onClose`

#### Progress HTML (`getProgressHTML` function)
- Returns HTML string with `zb-tour-progress` wrapper
- For steps 0–2 (first half of 7): uses strawberry illustration (`/strawberry_illustration.png`, alt "Strawberry"), `animate-idle` class
- For steps 3–6 (second half of 7): uses matcha illustration (`/matcha_illustration.png`, alt "Matcha"), `animate-steam` class
- Includes SVG sparkles with `animate-sparkle` class and staggered delays
- Shows "Step X of 7" text (1-indexed: `stepIndex + 1`)
- Renders 7 dot progress indicators
  - Current step dot has `active` class
  - Previous steps have `completed` class
  - Future steps have no extra class

#### Edge Cases
- When `isActive` changes from `true` to `false`, nothing happens (no second `drive()` call)
- If `isActive` is already `true` on mount, tour starts
- Multiple re-renders with same `isActive` do not re-initialize driver
- `currentStepRef` resets to 0 when `isActive` becomes `true`

#### Error Scenarios
- If `driver()` constructor throws, component should not crash (error caught by React error boundary)
- If `injectTourStyles()` throws, component should still render (non-critical)

#### Mocking
- Mock `driver.js` — mock the `driver` export to return a controllable object with `drive()`, `destroy()`
- Verify `popoverClass: "zb-tour-popover"` is set in driver config (theme applied via globals.css)
- Use ref-based control to simulate lifecycle

---

### 5. Tour Theme Styling — `app/globals.css`

The Zen Berry tour theme is applied via CSS classes in `app/globals.css` under `.zb-tour-popover`, using driver.js CSS variable overrides and class overrides. No JS injection is needed — driver.js applies the class via `popoverClass: "zb-tour-popover"` in the config.

**Testing approach**: The `popoverClass` is verified in the driver config test. Visual theme correctness relies on the CSS being present in `globals.css` and is verified visually during development, or through snapshot/E2E tests.

---

## Acceptance Criteria Coverage

| # | AC Description | Test Location | Test Name |
|---|---|---|---|
| 1 | `driver.js` is installed and tour component initializes without errors | `product-tour.test.tsx` | "renders null (no DOM output)" / "initializes driver with correct configuration" |
| 2 | Clicking Help button starts tour from step 0 | `tour-help-button.test.tsx` + `product-tour.test.tsx` | "calls onClick when clicked" / "calls drive() when isActive becomes true after mount" |
| 3 | Each step highlights the correct element with smooth overlay | `use-product-tour.test.tsx` | "each step has element and popover properties" |
| 4 | Popover appears on opposite side of highlighted element | `use-product-tour.test.tsx` | "desktop: steps 1-5 have side right" / "step 6 has side left" / "step 7 has side bottom" |
| 5 | On mobile, all popovers appear below (side: bottom) | `use-product-tour.test.tsx` | "mobile: all steps have side bottom" |
| 6 | Popover styling matches Zen Berry theme | `product-tour.test.tsx` | driver config has `popoverClass: "zb-tour-popover"` (styles live in globals.css) |
| 7 | Progress indicator from built-in `showProgress: true` | `product-tour.test.tsx` | driver config has `showProgress: true` |
| 8 | Built-in progress step counter shows current step | `product-tour.test.tsx` | driver config includes `showButtons: ["next", "previous"]` |
| 9 | Step counter with progress bar | `product-tour.test.tsx` | driver config verified — driver.js renders built-in progress bar |
| 10 | Back and Next buttons navigate between steps | `product-tour.test.tsx` | driver config has `showButtons: ["next", "previous"]` and `prevBtnText`/`nextBtnText` | |
| 11 | Done button on last step closes the tour | `product-tour.test.tsx` | "onDestroyed callback calls onClose" |
| 12 | Close button (X) dismisses the tour | `product-tour.test.tsx` | driver config verified — driver.js built-in close button rendered by default |
| 13 | Tour can be restarted by clicking Help again after finishing | `product-tour-store.test.ts` + `product-tour.test.tsx` | "triggerTour sets tourTriggered to true" / "state transitions correctly" |
| 14 | First-time onboarding overlay shows independently | `use-product-tour.test.tsx` | "returns correct shape" (no auto-start logic in hook) |
| 15 | Tour works without API calls or backend dependencies | (architectural — verified by absence of API calls in all test files) | All tests — no network requests |
| 16 | All modified components have correct data-tour attributes | `tour-help-button.test.tsx` + `use-product-tour.test.tsx` | "has data-tour=step-7 attribute" (help button) / step selectors verified in "each step selector matches [data-tour='step-<n>']" (all 7 steps) |
| 17 | Zustand store has no side effects — clean trigger/clear pattern | `product-tour-store.test.ts` | All tests verify no side effects beyond state transitions |
| 18 | Destroying driver instance on unmount prevents memory leaks | `product-tour.test.tsx` | "calls driverObj.destroy on unmount" |
| 19 | Clicking the overlay backdrop does NOT advance the tour (no accidental navigation) | (requires E2E testing with Playwright) | E2E-only — driver.js internal behavior cannot be unit tested |
| 20 | `driver.js` is listed in `package.json` dependencies | `product-tour.test.tsx` | "driver.js is listed in package.json dependencies" |
| 21 | `data-tour` attributes on all 7 components (step-1 through step-7) | `use-product-tour.test.tsx` | "each step selector matches [data-tour='step-<n>'] pattern for n = 1..7" (verifies selector targeting) |

---

## Setup Requirements

To run these tests, the project needs:
1. A test runner: **Vitest** (recommended) or **Jest**
2. Testing library: **@testing-library/react** for component tests
3. **jsdom** or equivalent DOM environment for component rendering
4. **@testing-library/jest-dom** for DOM matchers

### Recommended Vitest installation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Add `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest-setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname),
    },
  },
})
```
