# Zen Berry Design System

## 1. Brand Identity & Art Direction

### 1.1 Visual Aesthetic

Zen Berry is a **minimalist, mindful productivity tool**. The visual identity pairs a warm, creamy base with soft strawberry accents and matcha green highlights — evoking a calm tea-house atmosphere. The aesthetic is:

- **Soft & rounded** — generous border radii, pill-shaped buttons, no sharp corners
- **Warm & inviting** — cream backgrounds, never pure white; strawberry pink for interactive elements
- **Matcha calm** — green for states of completion, success, and active focus
- **Playful details** — subtle steam/sparkle animations on idle states, gentle floating on the berry mascot
- **Low visual noise** — no heavy borders, faint dividers, plenty of negative space

### 1.2 Moodboard Keywords

`minimal` `warm` `matcha` `strawberry` `cream` `rounded` `soft shadow` `zen` `calm` `playful` `Nunito Sans`

### 1.3 Illustration Style

- Custom illustrations: `matcha_illustration.png`, `strawberry_illustration.png`
- Logo: `Zen-berry Logo.png` (brand mark) + `logo.svg` (responsive variant)
- Favicon: `favicon.svg` (lightweight SVG), fallback `favicon.ico`
- Apple touch icon: `apple-touch-icon.svg` (180×180)
- Mascot: A floating berry character with idle float animation (`animate-idle`), thinking pulse (`animate-thinking`), and speaking bob (`animate-speaking`)

### 1.4 Tone of Voice (UI)

- Friendly but not cutesy
- Encouraging without being pushy
- "Matcha green" for positive reinforcement
- "Strawberry pink" for primary actions (add, start, promote)
- Error messages are neutral, never alarming

---

## 2. Color System

### 2.1 Brand Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-cream` | `#FFFDEC` | Page background, card surfaces |
| `--color-strawberry` | `#FFCFCF` | Primary accent, buttons, active states |
| `--color-strawberry-light` | `#FFE2E2` | Hover fills, secondary accent, subtle highlights |
| `--color-matcha` | `#86A788` | Success, completed state, active timer, streak |
| `--color-matcha-light` | `#B8D4B8` | Progress bars, highlights, chart fills |
| `--color-matcha-dark` | `#5C7D5E` | Hover on matcha elements, deep success |

### 2.2 Semantic Tokens (shadcn/ui)

All semantic tokens are defined in `app/globals.css` using the `@theme inline` directive:

```
--background    → body bg        --foreground    → body text
--card          → card bg        --card-foreground → card text
--popover       → dropdown bg    --popover-foreground
--primary       → (dark text)    --primary-foreground  → (light text)
--secondary     → muted bg       --secondary-foreground
--muted         → subtle bg      --muted-foreground    → secondary text
--accent        → hover bg       --accent-foreground
--destructive   → error red      --border        → all borders
--input         → form borders   --ring          → focus ring
--sidebar-*     → sidebar tokens (parallel to main theme)
```

The `@theme inline` block maps these CSS custom properties to Tailwind v4 theme colors so they work seamlessly with Tailwind utility classes.

### 2.3 Theme Variants

#### Light Zen (default)

The root `:root` block defines the light theme in OKLCH color space where possible for better interpolation. Brand colors are kept in hex for precision.

#### Warm Earth (`.warm-earth`)

```css
--background: #F5F0E8    --foreground: #2D2820
--card: #FFFFFF           --card-foreground: #2D2820
--muted: #E8E0D0          --muted-foreground: #8C8678
--border: #D8D0C0
```

A warmer, earthier variant. Beige undertones replace the cream. Suitable for users who prefer a more grounded feel.

#### Cozy Dark (`.cozy-dark`)

```css
--background: #2A3D2C    --foreground: #EDE9E0
--card: #3A523C           --card-foreground: #EDE9E0
--muted: #3A523C          --muted-foreground: #C4B8A0
--border: #4A634C
```

A dark forest-green theme. Not pure black — warm dark green that evokes a cozy evening cabin. Matcha tones throughout.

### 2.4 Accessibility Notes

- All theme variants maintain a minimum **4.5:1 contrast ratio** for body text against their backgrounds
- Brand colors (strawberry, matcha) are used as **accent colors only** — never for body text
- Focus ring uses `--ring` (oklch(0.708 0 0) in light, adapted per theme) with `outline-ring/50`
- Destructive actions use `oklch(0.577 0.245 27.325)` (red) with text contrast verified

---

## 3. Typography

### 3.1 Font Stack

**Primary:** [Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans) (variable font via `next/font/google`)

```typescript
// app/layout.tsx
const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nunito-sans",
  display: "swap",
})
```

| Weight | CSS Value | Usage |
|--------|-----------|-------|
| Regular | `400` | Body text, descriptions, secondary info |
| Medium | `500` | Labels, input text, card subheadings |
| Semi Bold | `600` | Buttons, table headers, nav items |
| Bold | `700` | Card titles, headings (h1–h3), dialog titles |

### 3.2 Type Scale

The app follows the shadcn/ui default type scale:

| Level | Size / Class | Weight | Usage |
|-------|-------------|--------|-------|
| h1 | `text-2xl` / `text-3xl` | 700 | Dashboard page title |
| h2 | `text-xl` | 700 | Card titles, section headings |
| h3 | `text-lg` | 600 | Dialog titles, panel headers |
| Body | `text-sm` / `text-base` | 400 | Primary content text |
| Small | `text-xs` / `text-sm` | 400 | Secondary info, timestamps |
| Label | `text-sm` | 500 | Form labels, input labels |
| Button | `text-sm` | 600 | All button text |
| Caption | `text-xs` | 500 | Stats, counters, badges |

### 3.3 Line Heights

- Body text: `leading-normal` (1.5)
- Headings: `leading-tight` (1.25) or `leading-snug` (1.375)
- Small text: `leading-relaxed` (1.625)
- Tour popover description: `1.6`

---

## 4. Spacing & Layout

### 4.1 Grid System

The dashboard uses a **3-column responsive grid** that collapses based on viewport:

```
Desktop:   [Timer | MIT | AI]    [Streak | BrainDump | Recap]
Tablet:    [Timer | MIT] [AI]    [Streak | BrainDump] [Recap]
Mobile:    Single-column stack
```

Card gaps: `gap-4` (1rem) between columns, `gap-3` (0.75rem) between rows.

### 4.2 Component Spacing

| Context | Padding | Notes |
|---------|---------|-------|
| Card body | `p-4` to `p-6` | Depends on card density |
| Card header | `pb-2` or `pb-3` | Below title |
| Dialog content | `p-6` | With `gap-4` between sections |
| Form fields | `space-y-2` | Label → Input → Error |
| Button groups | `gap-2` | Between buttons |
| List items | `py-2` with `gap-2` | Task rows, preset lists |

---

## 5. Border Radius

### 5.1 Radius Scale

All radii are derived from the base `--radius: 0.625rem` (10px):

| Token | Calc | Value | Usage |
|-------|------|-------|-------|
| `--radius-sm` | × 0.6 | 0.375rem (6px) | Input fields, small badges |
| `--radius-md` | × 0.8 | 0.5rem (8px) | Buttons, small cards |
| `--radius-lg` | base | 0.625rem (10px) | Standard cards, dialogs |
| `--radius-xl` | × 1.4 | 0.875rem (14px) | Large cards, popovers |
| `--radius-2xl` | × 1.8 | 1.125rem (18px) | Tour popovers, modal dialogs |
| `--radius-3xl` | × 2.2 | 1.375rem (22px) | Pill-shaped elements |
| `--radius-4xl` | × 2.6 | 1.625rem (26px) | Maximum rounding |
| `rounded-full` | — | 9999px | Avatars, circular badges |

### 5.2 Usage Guide

- **Cards**: `rounded-xl`
- **Buttons**: `rounded-md` (standard) or `rounded-lg` (primary CTA)
- **Inputs**: `rounded-md`
- **Dialogs**: `rounded-xl` or `rounded-2xl`
- **Tour popover**: `rounded-2xl`
- **Badges / Chips**: `rounded-full`
- **Checkboxes**: `rounded-sm` (with a `rounded` hover ring)

---

## 6. Shadows & Elevation

### 6.1 Shadow Tokens

The app uses Tailwind CSS v4's default shadow scale, with one custom exception for the tour popover:

| Level | Tailwind Class | Usage |
|-------|---------------|-------|
| Subtle | `shadow-sm` | Cards on cream background |
| Standard | `shadow-md` | Elevated cards, dropdowns |
| Prominent | `shadow-lg` | Modals, dialogs |
| Tour | — | Custom matcha-tinted shadow (see below) |

### 6.2 Tour Popover Shadow (custom)

```css
box-shadow:
  0 8px 32px rgba(134, 167, 136, 0.15),
  0 2px 8px rgba(0, 0, 0, 0.06);
```

A dual-layer shadow with a matcha-tinted spread (top) and a subtle dark core (bottom). The green tint reinforces the brand identity without being overt.

### 6.3 Hover / Active Transitions

- All interactive elements transition at `0.2s ease`
- Buttons: slight lift on hover (`translateY(-1px)`) via custom CSS or scale
- Cards: optional `hover:shadow-md` transition from `shadow-sm`

---

## 7. Animation & Micro-interactions

### 7.1 Keyframes

All defined in `app/globals.css`:

| Name | Duration | Easing | Purpose |
|------|----------|--------|---------|
| `steam` | 3s | ease-in-out infinite | Gentle steam wisps on timer idle |
| `sparkle` | 2s | ease-out infinite | Sparkle particle on completion |
| `fadeIn` | 0.4s | ease-out | New content appearing (cards, dialogs) |
| `idleFloat` | 3s | ease-in-out infinite | Berry mascot gentle bobbing |
| `thinkingPulse` | 0.6s | ease-in-out infinite | Pulsing scale while AI generates |
| `speakingBob` | 2s | ease-in-out infinite | Gentle vertical bob during speech |

### 7.2 Tailwind Utilities

```css
@utility animate-steam { animation: steam 3s ease-in-out infinite; }
@utility animate-sparkle { animation: sparkle 2s ease-out infinite; }
@utility animate-fadeIn { animation: fadeIn 0.4s ease-out; }
@utility animate-idle { animation: idleFloat 3s ease-in-out infinite; }
@utility animate-thinking { animation: thinkingPulse 0.6s ease-in-out infinite; }
@utility animate-speaking { animation: speakingBob 2s ease-in-out infinite; }
```

### 7.3 Fade-in Pattern

New cards and content use `animate-fadeIn` (translateY(8px) → translateY(0), opacity 0→1) over 0.4s. This is applied on mount, not on scroll.

### 7.4 Drag & Drop

- Uses `@hello-pangea/dnd` with default cross-browser drag preview
- Confirmation dialog (`ConfirmDragDialog`) appears before promote/demote
- Dialog uses `animate-fadeIn` for open transition
- No custom drag visual — relies on browser native drag preview

---

## 8. Theme System

### 8.1 Theme Definitions

| Name | CSS Class | Description |
|------|-----------|-------------|
| `light-zen` | (none, default) | Cream + strawberry + matcha |
| `warm-earth` | `.warm-earth` | Beige tones, earthy warmth |
| `cozy-dark` | `.cozy-dark` | Forest green dark mode |

### 8.2 Persistence

```typescript
// lib/theme.ts
export const THEME_CLASS_MAP: Record<string, string> = {
  'light-zen': '',
  'warm-earth': 'warm-earth',
  'cozy-dark': 'cozy-dark',
}
export const THEME_COOKIE_KEY = 'zenberry_theme'
export const THEME_LOCAL_STORAGE_KEY = 'zenberry_theme'
```

Themes persist via **both** cookie (server-side read for SSR) and localStorage (client-side toggle). Cookie key: `zenberry_theme`. The root layout reads the cookie and applies the CSS class to `<html>`.

### 8.3 Adding a New Theme

1. Add the CSS class scope in `app/globals.css` (override `--background`, `--foreground`, `--card`, `--border`, `--muted`, `--secondary`, `--accent`, `--input`, `--popover`)
2. Add the theme entry in `lib/theme.ts` `THEME_CLASS_MAP` and optional `THEME_LOCAL_STORAGE_KEY`
3. Add the theme option in the settings UI

### 8.4 Theme Scoping

Theme CSS classes are scoped to `<html>` (set in `app/layout.tsx`). All shadcn/ui components reference CSS custom properties, so they automatically adapt. No per-component theme logic needed.

---

## 9. shadcn/ui Integration

### 9.1 Style Variant

The app uses the **`radix-nova`** style variant (default shadcn/ui style), customized with:
- Custom color tokens mapped via `@theme inline` in `globals.css`
- Increased border radii (see §5)
- Named brand colors (`strawberry`, `matcha`, `cream`) available as Tailwind classes

### 9.2 Component Customization

- **Buttons**: Use `variant="default"` for primary (strawberry via `--primary`), `variant="outline"` for secondary, `variant="ghost"` for tertiary
- **Cards**: Default shadcn/ui card with `rounded-xl`
- **Dialogs**: `rounded-xl` with `gap-4` spacing
- **Inputs**: Standard shadcn/ui with `rounded-md`
- **Toasts**: `sonner` toaster with default styling (customizable via `Toaster` props)

### 9.3 No Overrides Pattern

shadcn/ui components are used as-shipped from their generators. Customization is done exclusively through CSS custom properties and Tailwind utility classes on wrapper elements. No component source files are manually edited.

---

## 10. Feedback & Interaction Design

### 10.1 Toast Patterns

The app uses `sonner` for toast notifications:

| Type | Trigger | Behavior |
|------|---------|----------|
| Success | Task created, session completed, AI review done | `toast.success("message")` - auto-dismiss 3s |
| Error | API failure, validation error, rate limit | `toast.error("message")` - auto-dismiss 5s |
| Info | Tour step, milestone unlocked | `toast.info("message")` - auto-dismiss 4s |

### 10.2 Button States

| State | Treatment |
|-------|-----------|
| Default | Solid fill (primary) or outline (secondary) |
| Hover | Slight darken (`brightness(0.95)` or explicit hover color) |
| Active | `scale(0.97)` via Tailwind `active:` |
| Disabled | `opacity-50 cursor-not-allowed` |
| Loading | Spinner icon replaces text, button disabled |

### 10.3 Confirmation Dialogs

- Used for destructive actions (delete task, demote MIT) and promote/demote drag
- Standard shadcn/ui AlertDialog
- Title: action question (e.g., "Remove from MITs?")
- Description: consequence (e.g., "This task will move to Brain Dump.")
- Buttons: Cancel (secondary) + Confirm (destructive for delete, primary for promote)

### 10.4 Drag & Drop Feedback

- No visual feedback during drag beyond browser default
- On drop: `ConfirmDragDialog` appears (prevents accidental promote/demote)
- On confirm: optimistic update, then server sync
- On error: toast error, revert optimistic update

### 10.5 Timer Feedback

- **Session complete**: Alarm sound plays (Web Audio API), toast appears, streak updates
- **Break reminder**: Toast after 3+ hours without a break (server-detected via AI analysis)
- **Countdown**: No second-by-second updates visible in the card header — time display driven by Zustand store

---

## 11. Product Tour (Driver.js)

### 11.1 Theme Token Overrides

The tour popover uses a custom CSS class `.zb-tour-popover` scoping Driver.js theme variables:

```css
--driver-popover-background-color: white
--driver-popover-border-color: #FFCFCF
--driver-popover-border-width: 2px
--driver-popover-padding: 24px
--driver-popover-radius: 16px         (= radius-2xl)
--driver-popover-title-font-size: 18px
--driver-popover-description-font-size: 14px
--driver-popover-arrow-size: 12px
--driver-popover-arrow-color: white
```

### 11.2 Popover Styles

| Element | Style |
|---------|-------|
| Container | White bg, strawberry border (2px), `rounded-2xl`, matcha-tinted shadow |
| Title | 18px, Bold (700), `#2D3A2D` (dark forest green) |
| Description | 14px, Medium (500), `#6B7280`, line-height 1.6 |
| Footer | Top border in `#FFE2E2` (strawberry-light), 16px padding |
| Prev button | Transparent bg, strawberry border, matcha text |
| Next button | Matcha fill, white text, no border |
| Close button | Matcha color, 0.6 opacity → 1.0 on hover |

### 11.3 Usage

Tour steps are defined in the `useProductTour` hook and triggered via `product-tour-store.ts` (Zustand).

---

## 12. Accessibility

### 12.1 Focus Ring

```css
* { @apply border-border outline-ring/50; }
```

All interactive elements receive a focus ring using `--ring` custom property. The `outline-ring/50` applies 50% opacity of the ring color for a subtle but visible focus indicator.

### 12.2 Color Contrast

- Body text on background: minimum **4.5:1** across all theme variants
- Large text (18px+ bold, 24px+ regular): minimum **3:1**
- Brand colors (strawberry, matcha) used only as accents, never for text below 14px
- Interactive states (hover, active, focus) maintain contrast without relying on color alone

### 12.3 Reduced Motion

Animation keyframes use standard CSS and respect `prefers-reduced-motion` through Tailwind's built-in `motion-safe:` / `motion-reduce:` variants.

### 12.4 Touch Targets

- All interactive elements minimum **44×44px** (WCAG 2.2 target size)
- Buttons have adequate padding (`px-4 py-2` minimum)
- List items have `py-2` minimum tap area

---

## 13. Implementation Phases

### Phase 1: Database & Task API
- [ ] Create SQL migration for new tables
- [ ] Create `/api/tasks` route (GET, POST, PATCH, DELETE)
- [ ] Update MIT component to use API instead of localStorage
- [ ] Update Brain Dump component to use API

### Phase 2: Session Logging
- [ ] Add session_logs table
- [ ] Add daily_activity_log table
- [ ] Modify timer-service to call session logging on completion
- [ ] Add `was_break` handling

### Phase 3: Analytics Endpoints
- [ ] Create `/api/analytics/summary`
- [ ] Create `/api/analytics/history`
- [ ] Add peak hours calculation
- [ ] Implement caching with stale-while-revalidate

### Phase 4: Chart Components
- [ ] Create Analytics-chart component using Recharts
- [ ] Update Matcha-progress-card with real data
- [ ] Add weekly progress bar chart
- [ ] Optional: Hourly heatmap

### Phase 5: AI Integration
- [ ] Create `/api/ai/review` endpoint
- [ ] Integrate Gemini API
- [ ] Implement smart detection (rest, peak hours)
- [ ] Add fallback handling
- [ ] Implement rate limiting
- [ ] Update AI-insights-card to fetch from API
