# Frontend Design — Zen Berry

This skill guides creation of distinctive, production-grade frontend interfaces that match the **Zen Berry** brand aesthetic. It avoids generic "AI slop" by codifying the project's specific design language.

## Brand Identity

Zen Berry is a **soft, warm, matcha-cafe inspired** productivity tool. The aesthetic is:

- **Tone**: Warm, organic, gentle — like a cozy teahouse. Soft pastels on cream paper. Rounded and friendly, never sharp or corporate.
- **Vibe**: Calm, focused, nurturing. Matcha green meets strawberry milk pink on warm cream backgrounds.
- **Differentiator**: The matcha/strawberry/cream palette + Nunito Sans rounded warmth + playful emoji accents (🌱🍓). It feels like a friendly journal, not a spreadsheet.

## Design Tokens

These are defined in `globals.css` and available as Tailwind classes:

### Colors
```
Cream (background):     #FFFDEC  → bg-cream
Strawberry (pink):      #FFCFCF  → bg-strawberry
Strawberry Light:       #FFE2E2  → bg-strawberry-light
Matcha (green):         #86A788  → bg-matcha          (primary action)
Matcha Light:           #B8D4B8  → bg-matcha-light
Matcha Dark:            #5C7D5E  → bg-matcha-dark
Foreground:             oklch(0.145 0 0) → text-foreground
Muted foreground:       oklch(0.556 0 0) → text-muted-foreground
Border:                 oklch(0.922 0 0) → border-border
```

### Typography
```
Font:  Nunito Sans (via next/font/google, variable: --font-nunito-sans)
Usage: font-sans (Tailwind) / var(--font-nunito-sans)
```

### Border Radius Scale
```
sm:   0.375rem  (rounded-sm)
md:   0.5rem    (rounded-md)
lg:   0.625rem  (rounded-lg)
xl:   0.875rem  (rounded-xl)
2xl:  1.125rem  (rounded-2xl)
3xl:  1.375rem  (rounded-3xl)
4xl:  1.625rem  (rounded-4xl)
```

### Icon Library
Use **Lucide React** (`lucide-react`) — import named icons. Never use emoji for structural/functional icons (only for decorative accents like 🌱🍓).

## Component Patterns

### Card Container (most common)
```tsx
<div className="flex min-h-0 flex-col rounded-3xl bg-strawberry-light/30 p-6 overflow-hidden border border-matcha-dark/20">
```

### Selectable List Item (presets, settings)
```tsx
<div className={`flex items-center rounded-lg border p-4 transition-colors ${
  isSelected
    ? "border-l-4 border-l-matcha border-t-matcha-light/50 border-r-matcha-light/50 border-b-matcha-light/50 bg-matcha-light/20"
    : "border-border hover:bg-cream/50"
}`}>
```

### Action Buttons
```tsx
// Primary (matcha green, rounded-full):
<Button className="gap-2 rounded-full bg-matcha px-6 text-white hover:bg-matcha/90 cursor-pointer">

// Icon-only secondary (circular, outline):
<Button size="icon" variant="outline" className="size-10 rounded-full border-border bg-white/60 hover:bg-white cursor-pointer">
```

### Mode Toggle
```tsx
// Focus active:
"bg-matcha text-white"
// Focus inactive:
"bg-white/60 text-foreground hover:bg-white/80"
// Break active:
"bg-strawberry text-foreground"
// Break inactive:
"bg-white/60 text-foreground hover:bg-white/80"
```

### Section Headings in Dialogs
```tsx
<h4 className="mb-4 text-sm font-medium text-muted-foreground">Section Title</h4>
```

### Hover Icon Buttons (circle, subtle)
```tsx
<button className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-matcha-light/30 hover:text-matcha transition-colors">
```

## Aesthetic Guidelines

### Typography
- **Nunito Sans** only (already set via next/font). Don't add alternate fonts.
- Use `font-mono` for timer displays (`font-mono text-4xl font-bold text-primary`).
- Use `text-muted-foreground` for secondary info, `text-foreground` for primary.

### Color & Theme
- **Commit to the palette**: cream background, matcha green for focus/primary actions, strawberry pink for break/secondary.
- No dark mode currently (no `.dark` class usage).
- Use opacity for layering: `bg-strawberry-light/30`, `bg-white/60`, `bg-matcha-light/20`.
- Border color: `border-border` or `border-matcha-dark/20` for cards.

### Motion
- Use Tailwind `transition-colors` for hover/state changes.
- Use `transition-all` sparingly — prefer `transition-colors` and `transition-transform`.
- Animation keys in globals.css: `animate-steam`, `animate-sparkle`, `animate-fadeIn`, `animate-idle`, `animate-thinking`.
- Keep it subtle — the brand is calm, not flashy.

### Spatial Composition
- Use `rounded-3xl` on major card containers, `rounded-lg` on list items.
- Consistent spacing: `p-6` on cards, `gap-2` on lists, `mb-6` between sections.
- Center-align timer UI, left-align settings content.
- Max-w limits on dialogs: `max-w-md`.

### State Management Context
- **Server data** → TanStack React Query
- **Client persistence** → Zustand with localStorage (see `store/timer-store.ts` patterns)
- **Ephemeral UI** → `useState`
- **No Redux, no Context for data**

## Anti-Patterns (Don't)

- ❌ No raw hex colors in components — use the Tailwind semantic tokens (`bg-matcha`, `text-muted-foreground`)
- ❌ No emoji as icons — use Lucide. Emoji only for decorative accents (🌱🍓)
- ❌ No dark mode — not currently supported
- ❌ No mixing stroke widths in Lucide icons — they're all consistent by default
- ❌ No hardcoded font families — use `font-sans` (resolves to Nunito Sans)
- ❌ No purple gradients, no Inter/Roboto/Space Grotesk, no generic "startup" aesthetic
- ❌ No `export default` — named exports only (exception: `page.tsx`/`layout.tsx`)

## Implementation Checklist

Before delivering UI code:
- [ ] Colors use Tailwind tokens, not raw hex
- [ ] Icons are Lucide, not emoji
- [ ] Nunito Sans via `font-sans`
- [ ] Border radius matches the scale above
- [ ] Named exports
- [ ] No `any` types
- [ ] Consistent with existing component patterns
