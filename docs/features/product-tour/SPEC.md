# Feature: Product Tour

- **Type:** new
- **Status:** new
- **Created:** 2026-07-09
- **Updated:** 2026-07-09

## Overview

An interactive, element-by-element guided tour of the dashboard using the [driver.js](https://github.com/kamranahmedse/driver.js) library. Unlike the existing full-screen onboarding overlay (5-slide modal shown on first login), this tour highlights individual dashboard cards and navigation elements in sequence, with animated popovers that match the Zen Berry brand theme.

The tour is re-playable on demand via a Help button in the navbar header. It is designed as a **synchronous, single-page tour** — not an async/backend-driven one — since all highlighted elements exist on the dashboard page and no server-side data is needed to define the steps.

---

## Installation & Dependencies

### Add driver.js

```bash
npm install driver.js
```

- `driver.js` is ~6 KB gzipped, framework-agnostic, and works with React via `useEffect`
- Version: latest stable (v1.x at time of writing)
- No TypeScript types needed — `driver.js` ships with its own type declarations
- No additional CSS import required — all styling is done via the driver.js `popoverClass` option and custom CSS overrides

---

## Architecture

### Component Tree

```
components/product-tour/
├── product-tour.tsx         — Main tour orchestrator (driver.js setup + step config)
├── tour-help-button.tsx     — "Help" button placed in dashboard header
├── tour-progress.tsx        — Progress indicator shown in popover footer (illustrations + step counter)
└── tour-styles.ts           — CSS class strings exported for popover styling
```

### Data Flow

```
TourHelpButton click
        │
        ▼
product-tour.tsx initializes driver.js
        │
        ▼
driver.js walks through defined steps
        │
        ▼
Each step:
  1. driver.js highlights the element via overlay
  2. Popover appears at computed position (opposite side)
  3. TourProgress component renders inside popover footer
  4. SVG animations react to current step index
        │
        ▼
Last step → driver.js destroys overlay → done
```

### State

The tour is fully client-side. No server data, no API calls, no Zustand store. The only state is local `useState` or `useRef` inside the tour component to manage the driver instance.

---

## Driver Setup and Configuration

### Basic Initialization

```typescript
import { driver } from "driver.js"
import "driver.js/dist/driver.css" // base styles (overridden via popoverClass)

const driverObj = driver({
  showProgress: false,       // We use our own progress indicator
  showButtons: [],           // We render custom buttons in the popover
  showBullets: false,        // We use our own step indicator
  animate: true,             // Smooth transitions between steps
  overlayColor: "rgba(42, 61, 44, 0.4)",   // Matcha-dark tint overlay
  stagePadding: 8,           // Space around highlighted element
  popoverClass: "zb-tour-popover",          // Custom CSS class
  disableActiveInteraction: false,          // Allow clicking through overlay? No
  prevBtnText: "Back",
  nextBtnText: "Next",
  doneBtnText: "Finish",
})
```

### Creating the Driver Instance

The driver instance should be created inside a `useEffect` in a client component. It must be destroyed on unmount to prevent memory leaks:

```typescript
useEffect(() => {
  const driverObj = createDriver(steps)
  return () => driverObj.destroy()
}, [])
```

The driver is started programmatically:

```typescript
driverObj.drive() // start from step 0
// or
driverObj.drive(index) // start from specific step
```

---

## Tour Steps Definition

All steps target elements on the dashboard page (`app/dashboard/page.tsx`) and the dashboard layout (`app/dashboard/layout.tsx`). Each step uses a CSS selector to find the element. Use `data-tour` attributes on target elements to ensure robust selectors.

### Target Element Markup Changes

Add `data-tour="step-<n>"` attributes to existing dashboard elements:

| Step | Target | Selector | data-tour attr |
|------|--------|----------|----------------|
| 1 | Sidebar nav | `aside nav` | `data-tour="step-1"` |
| 2 | TimerCard | TimerCard container | `data-tour="step-2"` |
| 3 | MITCard | MITCard container | `data-tour="step-3"` |
| 4 | BrainDumpCard | BrainDumpCard container | `data-tour="step-4"` |
| 5 | StreakCard | StreakCard container | `data-tour="step-5"` |
| 6 | AIInsightsCard | AIInsightsCard container | `data-tour="step-6"` |
| 7 | Help button | TourHelpButton itself | `data-tour="step-7"` |

### Step Definitions

```typescript
import { DriveStep } from "driver.js"

const steps: DriveStep[] = [
  {
    element: '[data-tour="step-1"]',
    popover: {
      title: "Welcome to Zen Berry! 🍓",
      description:
        "Use the sidebar to navigate between Focus, Pins, and Productivity. Everything you need is just a click away.",
      side: "right", // sidebar is on the left → popover on the right
      // alignment controlled by smart positioning logic
    },
  },
  {
    element: '[data-tour="step-2"]',
    popover: {
      title: "Timer Card",
      description:
        "Start your focus sessions here. Choose a preset duration, track your progress with the radial chart, and build your streak one pomodoro at a time.",
      side: "left", // timer is in column 1 (left) → popover on the right
    },
  },
  {
    element: '[data-tour="step-3"]',
    popover: {
      title: "Top 3 MIT",
      description:
        "Your Most Important Tasks. Focus on no more than 3 high-leverage tasks each day. They persist until you mark them done.",
      side: "left", // MIT is in column 2 (center-left) → popover on the right
    },
  },
  {
    element: '[data-tour="step-4"]',
    popover: {
      title: "Brain Dump",
      description:
        "Quick-capture every random thought here. Drag tasks to MIT when they become priorities. Nothing slips through the cracks.",
      side: "left",
    },
  },
  {
    element: '[data-tour="step-5"]',
    popover: {
      title: "Streak Card",
      description:
        "Track your daily streaks and stay motivated. Every completed session and MIT keeps the streak alive.",
      side: "right", // streak is in column 1 → popover on the right
    },
  },
  {
    element: '[data-tour="step-6"]',
    popover: {
      title: "AI Insights",
      description:
        "Get AI-powered insights about your productivity. Zensei analyzes your focus patterns and delivers personalized motivation.",
      side: "left", // AI is in column 3 → popover on the left
    },
  },
  {
    element: '[data-tour="step-7"]',
    popover: {
      title: "Help & Tour",
      description:
        "Click this button anytime to restart this tour. Zen Berry is here to help you stay focused and organized.",
      side: "bottom", // help button is in the header → popover below it
    },
  },
]
```

---

## Popover Positioning Logic

### Requirement: Opposite Side Positioning

If the element is on the **left** side of the screen → popover appears on the **right**
If the element is on the **right** side → popover appears on the **left**
If the element is near the **top** → popover appears **below**
If the element is near the **bottom** → popover appears **above**

### Implementation

The `side` property in driver.js accepts: `"top" | "bottom" | "left" | "right"`. We determine the side dynamically based on the element's position in the viewport.

Create a helper function `getPopoverSide(element: Element): PopoverSide`:

```typescript
type PopoverSide = "top" | "bottom" | "left" | "right"

function getPopoverSide(element: Element): PopoverSide {
  const rect = element.getBoundingClientRect()
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const centerX = viewportWidth / 2
  const centerY = viewportHeight / 2
  const elementCenterX = rect.left + rect.width / 2
  const elementCenterY = rect.top + rect.height / 2

  // Determine if element is more horizontal or vertical relative to center
  const dx = Math.abs(elementCenterX - centerX) / viewportWidth
  const dy = Math.abs(elementCenterY - centerY) / viewportHeight

  if (dx > dy) {
    // Element is primarily left or right of center
    return elementCenterX < centerX ? "right" : "left"
  } else {
    // Element is primarily above or below center
    return elementCenterY < centerY ? "bottom" : "top"
  }
}
```

This function is called for each step when the popover is about to render. Since driver.js accepts `side` as a static value in the step config, we compute the side at mount time — or better, use `onPopoverRender` to adjust dynamically if needed.

**Alternative approach** (simpler, preferred for MVP): Hard-code the `side` per step based on the known dashboard layout (3-column grid). Since the dashboard layout is fixed (LG: 3 columns, each element has a known position), we can define `side` statically in the step config:

| Step | Element | Column | Static `side` |
|------|---------|--------|---------------|
| 1 | Sidebar | Left overlay | `"right"` |
| 2 | TimerCard | Column 1 (left) | `"right"` |
| 3 | MITCard | Column 2 (center) | `"right"` (or `"left"` on mobile) |
| 4 | BrainDumpCard | Column 2 (center) | `"right"` |
| 5 | StreakCard | Column 1 (left) | `"right"` |
| 6 | AIInsightsCard | Column 3 (right) | `"left"` |
| 7 | Help button in header | Top-right | `"bottom"` |

### Mobile Responsiveness

On mobile (`isMobile` from `useResponsive`), the grid collapses to single-column. In this case, all elements are centered, so use `side: "bottom"` for all steps to avoid popovers going off-screen left/right. Use `useResponsive` to select the side strategy:

```typescript
const { isMobile } = useResponsive()
const defaultSide = isMobile ? "bottom" : "right"
```

---

## Styling the Popover

### Custom CSS Class

Use `popoverClass: "zb-tour-popover"` in the driver config. Then add global CSS in `globals.css` or a dedicated CSS module.

### Required CSS Overrides

```css
/* In globals.css or app/product-tour.css */

/* Override driver.js default popover styles */
.zb-tour-popover {
  --driver-popover-background-color: white;
  --driver-popover-border-color: #FFCFCF;          /* strawberry */
  --driver-popover-border-width: 2px;
  --driver-popover-padding: 24px;
  --driver-popover-radius: 16px;                    /* rounded-2xl equivalent */
  --driver-popover-title-font-size: 18px;
  --driver-popover-description-font-size: 14px;
  --driver-popover-arrow-size: 12px;
  --driver-popover-arrow-color: white;
}

/* Popover card — match Zen Berry theme */
.zb-tour-popover .driver-popover {
  background: white !important;
  border: 2px solid var(--color-strawberry) !important;
  border-radius: var(--radius-2xl) !important;      /* 1.125rem */
  box-shadow:
    0 8px 32px rgba(134, 167, 136, 0.15),
    0 2px 8px rgba(0, 0, 0, 0.06);
  font-family: var(--font-nunito-sans), sans-serif;
  max-width: 360px;
}

/* Title */
.zb-tour-popover .driver-popover-title {
  font-size: 18px;
  font-weight: 700;
  color: #2D3A2D;                                   /* dark matcha text */
  margin-bottom: 8px;
  line-height: 1.3;
}

/* Description */
.zb-tour-popover .driver-popover-description {
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;                                   /* muted-foreground */
  line-height: 1.6;
  margin-bottom: 16px;
}

/* Footer area (buttons + progress) */
.zb-tour-popover .driver-popover-footer {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
  border-top: 1px solid var(--color-strawberry-light);
  padding-top: 16px;
}

/* Button row */
.zb-tour-popover .driver-popover-footer .driver-popover-btn-group {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

/* Previous button */
.zb-tour-popover .driver-popover-prev-btn {
  background: transparent !important;
  border: 1px solid var(--color-strawberry) !important;
  color: var(--color-matcha) !important;
  border-radius: var(--radius-xl) !important;       /* 0.875rem */
  padding: 8px 16px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  font-family: var(--font-nunito-sans), sans-serif !important;
  transition: all 0.2s ease;
}

.zb-tour-popover .driver-popover-prev-btn:hover {
  background: var(--color-strawberry-light) !important;
}

/* Next/Done button */
.zb-tour-popover .driver-popover-next-btn {
  background: var(--color-matcha) !important;
  border: none !important;
  color: white !important;
  border-radius: var(--radius-xl) !important;
  padding: 8px 20px !important;
  font-size: 13px !important;
  font-weight: 600 !important;
  font-family: var(--font-nunito-sans), sans-serif !important;
  transition: all 0.2s ease;
}

.zb-tour-popover .driver-popover-next-btn:hover {
  background: var(--color-matcha-dark) !important;
}

/* Close button */
.zb-tour-popover .driver-popover-close-btn {
  color: var(--color-matcha) !important;
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.zb-tour-popover .driver-popover-close-btn:hover {
  opacity: 1;
}

/* Arrow */
.zb-tour-popover .driver-popover-arrow {
  border-color: var(--color-strawberry) !important;
}
```

### CSS Injection Strategy

Rather than modifying `globals.css` (which already has custom animations that should stay), create a separate file `components/product-tour/tour-styles.ts` that exports a CSS string and injects it via `useEffect`:

```typescript
export function injectTourStyles() {
  const styleId = "zb-tour-styles"
  if (document.getElementById(styleId)) return

  const style = document.createElement("style")
  style.id = styleId
  style.textContent = `/* all .zb-tour-popover CSS from above */`
  document.head.appendChild(style)
}
```

Call `injectTourStyles()` when the tour component mounts.

---

## Tour Progress Indicator with SVG Animations

### Progress UI Inside Popover

The progress indicator consists of two elements rendered in the popover footer:

1. **Illustration** — shows either the strawberry or matcha illustration depending on step index
2. **Step counter** — "Step 2 of 7" with animated transition

### Implementation using `onPopoverRender`

driver.js provides an `onPopoverRender` callback that fires each time a popover is rendered. Use this to inject custom progress HTML into the popover footer:

```typescript
onPopoverRender: (popover) => {
  const footer = popover.querySelector(".driver-popover-footer")
  if (!footer) return

  // Remove previous custom content
  const existing = footer.querySelector(".zb-tour-progress")
  existing?.remove()

  const progressEl = document.createElement("div")
  progressEl.className = "zb-tour-progress"
  progressEl.innerHTML = getProgressHTML(currentStep)
  footer.prepend(progressEl)
}
```

### Progress HTML Template

```typescript
function getProgressHTML(stepIndex: number, totalSteps: number): string {
  const isStrawberry = stepIndex < Math.floor(totalSteps / 2)
  const imgSrc = isStrawberry
    ? "/strawberry_illustration.png"
    : "/matcha_illustration.png"
  const alt = isStrawberry ? "Strawberry" : "Matcha"

  return `
    <div class="zb-tour-progress">
      <div class="zb-tour-progress-illustration">
        <img
          src="${imgSrc}"
          alt="${alt}"
          class="zb-tour-progress-img ${isStrawberry ? "animate-idle" : "animate-steam"}"
        />
        ${getSVGSparkles(stepIndex, totalSteps)}
      </div>
      <div class="zb-tour-progress-counter">
        <span class="zb-tour-progress-text">Step ${stepIndex + 1} of ${totalSteps}</span>
        <div class="zb-tour-progress-dots">
          ${Array.from({ length: totalSteps }, (_, i) => `
            <span class="zb-tour-progress-dot ${i === stepIndex ? "active" : i < stepIndex ? "completed" : ""}"></span>
          `).join("")}
        </div>
      </div>
    </div>
  `
}
```

### SVG Animations

Use two animations from the existing `globals.css`:
- `animate-idle` — gentle floating (for strawberry illustration)
- `animate-steam` — steam rising effect (for matcha illustration)

The strawberry illustration appears for steps in the **first half** of the tour, and the matcha illustration for the **second half**. This creates a visual narrative: strawberry (sweet, getting started) → matcha (earnest focus, progress).

Additionally, add sparkle effects via inline SVG that react to step transitions:

```svg
<svg class="zb-tour-sparkles" width="60" height="30" viewBox="0 0 60 30">
  <circle cx="10" cy="15" r="2" fill="#FFCFCF" class="animate-sparkle" style="animation-delay: 0s" />
  <circle cx="30" cy="8" r="1.5" fill="#FFCFCF" class="animate-sparkle" style="animation-delay: 0.3s" />
  <circle cx="50" cy="20" r="2" fill="#86A788" class="animate-sparkle" style="animation-delay: 0.6s" />
</svg>
```

### Progress CSS

```css
.zb-tour-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.zb-tour-progress-illustration {
  position: relative;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.zb-tour-progress-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.zb-tour-progress-counter {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.zb-tour-progress-text {
  font-size: 11px;
  font-weight: 600;
  color: #86A788;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.zb-tour-progress-dots {
  display: flex;
  gap: 4px;
}

.zb-tour-progress-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #FFE2E2;
  transition: all 0.3s ease;
}

.zb-tour-progress-dot.active {
  width: 18px;
  border-radius: 3px;
  background: #86A788;
}

.zb-tour-progress-dot.completed {
  background: #B8D4B8;
}
```

---

## Help Button in Navbar

### Component: `components/product-tour/tour-help-button.tsx`

A small button placed in the dashboard header, next to the existing Review and Report buttons.

```typescript
"use client"

import { HelpCircle } from "lucide-react"

interface TourHelpButtonProps {
  onStartTour: () => void
}

export function TourHelpButton({ onStartTour }: TourHelpButtonProps) {
  return (
    <button
      onClick={onStartTour}
      data-tour="step-7"
      className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-strawberry-light/50 hover:text-matcha"
      title="Start product tour"
    >
      <HelpCircle className="size-4" strokeWidth={1.5} />
      Help
    </button>
  )
}
```

### Placement in Dashboard Layout

In `app/dashboard/layout.tsx`, add the `TourHelpButton` inside the header, after the Report link:

```tsx
<div className="ml-auto flex items-center gap-1">
  <Link href="/feedback?tab=review">...</Link>
  <Link href="/feedback?tab=report">...</Link>
  <TourHelpButton onStartTour={handleStartTour} />
</div>
```

### Integration with Tour Component

The dashboard layout or page component hosts the tour orchestration. The recommended approach: render the `ProductTour` component at the dashboard page level (`app/dashboard/page.tsx`), since that's where all target elements live.

```tsx
// In app/dashboard/page.tsx
import { useProductTour } from "@/hooks/use-product-tour"

export default function DashboardPage() {
  const { startTour, TourComponent } = useProductTour()
  // ... existing code

  return (
    <>
      {/* ... existing JSX ... */}
      <TourComponent />
    </>
  )
}
```

Or, more simply, use a context or prop to pass `onStartTour` down from the layout to the header. Since layout and page are separate, use a simple approach:

**Option A: Zustand store boolean** (preferred — no prop drilling)
```typescript
// store/product-tour-store.ts
import { create } from "zustand"

interface ProductTourStore {
  tourTriggered: boolean
  triggerTour: () => void
  clearTourTrigger: () => void
}

export const useProductTourStore = create<ProductTourStore>((set) => ({
  tourTriggered: false,
  triggerTour: () => set({ tourTriggered: true }),
  clearTourTrigger: () => set({ tourTriggered: false }),
}))
```

The layout calls `triggerTour()` when the Help button is clicked. The dashboard page watches `tourTriggered` and starts the driver tour.

**Option B: Simple callback via a ref** — less clean but avoids a store.

**Recommendation:** Option A with Zustand. The store is tiny (< 15 lines), avoids any prop drilling, and is consistent with the existing state management pattern (Zustand for client state).

---

## Async Tour Question

### Should the tour be async (server-driven)?

**Recommendation: No. Start with a synchronous, client-side tour.**

Here is the reasoning:

| Concern | Sync (client-side) | Async (server-driven) |
|---------|-------------------|----------------------|
| **Step data** | Steps are static config — no DB needed | Would need a `tour_steps` table + API |
| **First-time trigger** | Already handled by `has_onboarded` flag on user | Same — `has_onboarded` already exists |
| **Re-play** | Help button triggers locally | Need API call to fetch steps |
| **Personalization** | Not needed for MVP — all users see the same tour | Could serve different steps per cohort |
| **Progress tracking** | Local state is sufficient | Would need `tour_progress` DB table |
| **Latency** | Instant — no network call | Must wait for API response |
| **Offline** | Works offline (PWA-compatible) | Would break offline |
| **Complexity** | ~200 lines of client code | ~400+ lines + new DB table + API route + RLS |

### When to Revisit Async

If the following requirements emerge, consider making the tour async:
1. **A/B testing** different tour steps or copy per user cohort
2. **Feature-gated steps** — showing different steps based on user permissions or plan tier
3. **Saved tour progress** — user starts tour, leaves, and comes back to resume where they left off
4. **Multi-page tours** — steps span across `/dashboard`, `/dashboard/pins`, `/dashboard/productivity`, etc.

For the MVP, a synchronous client-side tour is simpler, faster, and completely sufficient.

---

## First-Time vs. On-Demand Behavior

### First-Time Users

The existing `OnboardingOverlay` (5-slide full-screen modal) still runs first. After completing it, the driver.js product tour can optionally follow. However, this may be overwhelming.

**Recommended approach:** Show the onboarding overlay on first login (as it does now). Do NOT auto-start the driver.js tour. Instead, show a subtle hint or a small pulse animation on the Help button to let users know a tour is available. The tour is opt-in from the Help button.

### Returning Users

- Help button in header → click → tour starts from step 0
- No progress is persisted (consistent with sync, non-async design)
- The tour always starts from the beginning

---

## Files to Create or Modify

### New Files

| File | Purpose |
|------|---------|
| `components/product-tour/product-tour.tsx` | Tour orchestrator — driver.js initialization, step config, progress callbacks |
| `components/product-tour/tour-help-button.tsx` | Help button with HelpCircle icon |
| `components/product-tour/tour-styles.ts` | CSS injection helper for popover styling |
| `store/product-tour-store.ts` | Zustand store for triggering the tour |
| `hooks/use-product-tour.ts` | Hook that encapsulates driver lifecycle + state management |

### Modified Files

| File | Changes |
|------|---------|
| `app/dashboard/layout.tsx` | Import and render `<TourHelpButton />` in the header (right side, after Report link) |
| `app/dashboard/page.tsx` | Import and use `useProductTour` hook; render `<TourComponent />`; add `data-tour` attributes to card containers |
| `components/dashboard/Timer-card.tsx` | Add `data-tour="step-2"` to the root div |
| `components/dashboard/Mit-card.tsx` | Add `data-tour="step-3"` to the root div |
| `components/dashboard/Brain-dump-card.tsx` | Add `data-tour="step-4"` to the root div |
| `components/dashboard/Streak-card.tsx` | Add `data-tour="step-5"` to the root div |
| `components/dashboard/Ai-insights-card.tsx` | Add `data-tour="step-6"` to the root div |
| `components/sidebar/sidebar.tsx` | Add `data-tour="step-1"` to the `<nav>` element |
| `package.json` | Add `driver.js` to dependencies |

---

## Implementation Plan

### Phase 1: Setup & Foundation

1. **Install driver.js** — `npm install driver.js`
2. **Create `store/product-tour-store.ts`** — Zustand store with `tourTriggered`, `triggerTour`, `clearTourTrigger`
3. **Create `components/product-tour/tour-styles.ts`** — CSS injection with all popover styling overrides
4. **Create `components/product-tour/product-tour.tsx`** — Main tour orchestrator:
   - Accepts `isActive` / `onClose` props
   - Initializes driver.js in `useEffect`
   - Defines steps with `data-tour` selectors
   - Implements `onPopoverRender` for progress injection
   - Implements smart positioning (static sides for known layout, fallback to dynamic)
5. **Create `hooks/use-product-tour.ts`** — Hook wrapping the driver lifecycle:
   - Starts tour when `tourTriggered` is true
   - Calls `clearTourTrigger` when done
   - Returns `startTour` function + `TourComponent` (renderless placeholder or portal)

### Phase 2: UI Integration

6. **Create `components/product-tour/tour-help-button.tsx`** — Help button component
7. **Modify `app/dashboard/layout.tsx`**:
   - Import `TourHelpButton`
   - Add it to the header after the Report link
   - Wire `onStartTour` to `useProductTourStore.triggerTour()`
8. **Modify `app/dashboard/page.tsx`**:
   - Import `useProductTour` hook
   - Render `TourComponent` (renderless — just listens to store)
   - Wire the tour trigger from store

### Phase 3: Data Attributes on Targets

9. **Add `data-tour` attributes** to each target component's root element:
   - `sidebar.tsx` → `data-tour="step-1"` on `<nav>`
   - `Timer-card.tsx` → `data-tour="step-2"` on root div
   - `Mit-card.tsx` → `data-tour="step-3"` on root div
   - `Brain-dump-card.tsx` → `data-tour="step-4"` on root div
   - `Streak-card.tsx` → `data-tour="step-5"` on root div
   - `Ai-insights-card.tsx` → `data-tour="step-6"` on root div
   - `tour-help-button.tsx` → `data-tour="step-7"` on the button itself

### Phase 4: Polish

10. **Test responsive behavior** — ensure mobile single-column layout uses `side: "bottom"` for all steps
11. **Verify styling** — popover matches theme (strawberry border, matcha buttons, Nunito Sans, rounded corners)
12. **Verify progress indicator** — illustrations switch from strawberry to matcha at the halfway point, dot animation works
13. **Verify first-time flow** — onboarding overlay still works, tour does NOT auto-start, Help button shows a subtle hint

---

## Acceptance Criteria

- [ ] `driver.js` is installed and the tour component initializes without errors
- [ ] Clicking the Help button in the dashboard header starts the tour from step 0
- [ ] Each step highlights the correct element with a smooth overlay animation
- [ ] Popover appears on the opposite side of the highlighted element (right for left elements, left for right, bottom for top)
- [ ] On mobile (single-column layout), all popovers appear below the element (`side: "bottom"`)
- [ ] Popover styling matches the Zen Berry theme:
  - Strawberry-colored border (`#FFCFCF`)
  - Matcha-green Next/Done button (`#86A788`)
  - Nunito Sans font
  - Rounded corners (`border-radius: 1.125rem`)
  - Cream/white background
- [ ] Progress indicator shows the correct illustration (strawberry for first half, matcha for second half)
- [ ] SVG animations play on the progress illustration (`animate-idle` for strawberry, `animate-steam` for matcha)
- [ ] Step counter shows "Step X of 7" with dot progress bar
- [ ] Back and Next buttons navigate between steps correctly
- [ ] Done button on the last step closes the tour
- [ ] Clicking the overlay backdrop does NOT advance the tour (no accidental navigation)
- [ ] Close button (X) dismisses the tour
- [ ] Tour can be restarted by clicking Help again after finishing
- [ ] First-time onboarding overlay still shows independently (tour does NOT auto-start)
- [ ] The tour works without any API calls or backend dependencies
- [ ] `driver.js` is listed in `package.json` dependencies
- [ ] All modified components have correct `data-tour` attributes without breaking existing functionality
- [ ] Zustand store `product-tour-store.ts` has no side effects — clean trigger/clear pattern
- [ ] Destroying the driver instance on component unmount prevents memory leaks
