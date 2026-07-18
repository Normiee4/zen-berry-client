# Feature: PWA Support

- **Type:** new
- **Status:** new
- **Created:** 2026-07-18
- **Updated:** 2026-07-18

---

## Problem Statement

Zen Berry is a productivity app that users interact with throughout the day — starting timers, checking MITs, logging sessions. Currently:

1. **Not installable** — No service worker means no `beforeinstallprompt` fires; browsers don't offer "Add to Home Screen"
2. **No offline support** — Navigating to the app without a network connection shows a blank page (DNS fail or browser offline page)
3. **No asset caching** — All Next.js chunks, images, fonts, and audio files are fetched fresh on every load; no cache-then-network strategy
4. **No iOS standalone polish** — Missing `apple-mobile-web-app-capable` meta tag; the app opens in Safari's browser chrome, not full-screen standalone mode
5. **Update gap** — When a new version deploys, users keep running old JS until they manually hard-refresh; no prompt to update

The timer already works offline (Zustand + localStorage), but the app shell and all other pages fail without a network. PWA support closes this gap.

---

## Requirements

### Must Have (MVP)

- [ ] App is installable on Chrome/Edge/Samsung Internet (desktop + mobile) via the browser's native "Install" prompt
- [ ] App is installable on iOS Safari (full-screen standalone via `apple-mobile-web-app-capable` meta tag)
- [ ] Service worker is registered and active in production builds
- [ ] All Next.js build assets (JS chunks, CSS, fonts) are precached and served instantly on repeat visits
- [ ] The dashboard page (`/dashboard`) loads from cache when offline (app shell)
- [ ] The auth pages (`/auth/*`) load from cache when offline (login/signup read from cache so users can see the page even without connection)
- [ ] `/audio/*.mp3` files are cached (CacheFirst) — alarm sounds play offline
- [ ] `favicon.svg`, `apple-touch-icon.svg`, `logo.svg` are cached
- [ ] API routes (`/api/*`) use NetworkFirst with a 30-second timeout — fresh data preferred, cached fallback when offline
- [ ] Offline fallback: when an uncached navigation request fails, serve a minimal offline page (`/~offline`) instead of the browser's error page
- [ ] A new version notification appears as a toast ("Update available — refresh to update") when the service worker detects a new build; user must confirm before the new SW takes over
- [ ] iOS: `apple-mobile-web-app-capable` meta tag set to `yes` for standalone full-screen
- [ ] iOS: `apple-mobile-web-app-status-bar-style` set to `default` (translucent, blends with background)
- [ ] iOS: `apple-touch-icon` PNG (180×180) added for home screen icon (fallback from SVG)
- [ ] Web app manifest includes 192×192 and 512×512 PNG icons (not just SVG)
- [ ] The service worker only activates in production (`NODE_ENV === "production"`) — no SW in dev mode
- [ ] `robots.txt` is left empty (no changes needed)

### Should Have (Phase 1)

- [ ] TanStack Query `gcTime` increased from default to 30 minutes for offline resilience
- [ ] TanStack Query `staleTime` tuned per query to minimise unnecessary re-fetches on slow/reconnecting networks
- [ ] Offline indicator: a subtle banner or toast when the browser goes offline ("You're offline — changes will sync when reconnected")
- [ ] Task writes that fail due to offline show a toast with "Saved locally — will sync when online" (optimistic update + deferred sync)

### Won't Have (MVP out of scope)

- Background Sync API for queueing failed writes (deferred to follow-up)
- Custom install prompt UI button (relies on browser's native prompt)
- Push notifications
- Periodic background sync
- IndexedDB-based data cache for tasks (localStorage + Zustand is sufficient for MVP)
- Offline analytics dashboard data (charts require network)
- Offline AI insights (requires Gemini API)

---

## Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **PWA library** | `@serwist/next` v10.0.0-preview.14 + `serwist` (dev) | Maintained successor to `next-pwa`; works with Next.js 16; typed SW support; webpack-based build injection |
| **Update strategy** | Prompt-based (skipWaiting only after user confirms) | Auto-updating could interrupt an active Pomodoro timer; user control is essential for a focus tool |
| **Offline write depth** | Graceful fail with toast | Background Sync requires additional complexity; local-only optimistic updates with re-fetch on reconnection are sufficient for MVP |
| **Offline app shell** | Precached Next.js pages (`/dashboard`, `/auth/*`) | These are static HTML shells that hydrate from localStorage/TanStack cache; no server data needed for initial render |
| **iOS icons** | PNG 180×180 apple-touch-icon | iOS does not support SVG for home screen icons; SVG-to-PNG conversion needed |
| **PWA icons** | PNG 192×192 + 512×512 | All browsers and platforms require PNG for installable manifest icons |
| **Icons source** | `public/logo.svg` (512×512 brand mark) | The existing SVG file is a rich brand mark that scales well; convert via `sharp` at build time or commit pre-generated PNGs |
| **Install prompt** | Browser native only | No custom `beforeinstallprompt` handler; browsers fire the prompt automatically when criteria are met |
| **TanStack Query** | Increase `gcTime` to 30 min, tune `staleTime` per query | Prevents data from being garbage-collected during brief offline periods; re-fetches on reconnection |
| **Robots.txt** | No changes | Already empty; search indexing is not a concern for a private dashboard app |
| **SW file location** | `app/sw.ts` | Serwist convention for App Router; compiled to `public/sw.js` at build time |

---

## Caching Strategy

### Strategy Map

| Resource | Pattern | Cache Name | Rationale |
|----------|---------|------------|-----------|
| Next.js build assets (JS, CSS, fonts) | **Precache** (via Serwist injection) | `next-precache` | Immutable per build; served instantly; versioned via hash |
| Navigation requests (page shells) | **NetworkFirst** with precache fallback | `next-precache` | Prefers fresh HTML from server; serves precached shell when offline |
| `/dashboard/*` pages | **Precache** + StaleWhileRevalidate | `next-precache` / `pages-cache` | Shell is precached; revalidates in background when online |
| `/auth/*` pages | **Precache** + StaleWhileRevalidate | `next-precache` / `pages-cache` | Same as dashboard — auth pages are static shells |
| `/api/*` requests | **NetworkFirst** (30s timeout) | `api-cache` | Fresh data preferred; cached fallback when offline |
| `/audio/*.mp3` | **CacheFirst** (upon first access) | `audio-cache` | Audio files are immutable; fetch once, cache forever |
| Static images (SVGs, PNGs) | **CacheFirst** | `static-cache` | Immutable brand assets; fetch once, cache forever |
| `/_next/static/*` | **Precache** (auto by Serwist) | `next-precache` | Automatically handled by `@serwist/next` build injection |
| `/site.webmanifest` | **CacheFirst** | `static-cache` | Static JSON manifest; rarely changes |

### Runtime Caching Configuration (in `app/sw.ts`)

The `defaultCache` export from `@serwist/next/worker` provides sensible defaults for Next.js. We extend it with custom routes for API, audio, and static assets:

```typescript
// Order matters — more specific routes first, general fallbacks last.
const runtimeCaching = [
  // API routes: NetworkFirst with 30s timeout, max 5 entries
  {
    urlPattern: /^\/api\//,
    handler: "NetworkFirst",
    options: {
      cacheName: "api-cache",
      expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 }, // 1 hour
      networkTimeoutSeconds: 30,
    },
  },
  // Audio files: CacheFirst, immutable
  {
    urlPattern: /\/audio\/.*\.mp3$/,
    handler: "CacheFirst",
    options: {
      cacheName: "audio-cache",
      expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }, // 1 year
    },
  },
  // Static images (SVG, PNG): CacheFirst
  {
    urlPattern: /\.(?:svg|png|ico)$/,
    handler: "CacheFirst",
    options: {
      cacheName: "static-cache",
      expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 days
    },
  },
  // Site.webmanifest: CacheFirst
  {
    urlPattern: /\/site\.webmanifest$/,
    handler: "CacheFirst",
    options: {
      cacheName: "static-cache",
      expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
    },
  },
];
```

> **Design note:** The audio cache uses CacheFirst because alarm MP3s are immutable files served from `public/audio/`. Once fetched, they never need to be re-fetched. The 1-year expiration is effectively "cache forever."

> **Design note:** API routes use NetworkFirst with a 30-second timeout so the app prefers fresh data when online but gracefully degrades to cached data when offline or slow. The 1-hour cache age balances freshness with offline utility.

---

## Update Strategy

### Prompt-Based Update Flow

```
1. New build deploys to Vercel
2. User is on old version, SW checks for updates (every navigation / 24h)
3. New SW detected → installs in background, enters "waiting" state
4. `controllerchange` event does NOT fire automatically
5. Frontend detects waiting SW via `navigator.serviceWorker.getRegistration()`
   or `updatefound` event
6. Toast appears: "A new version is available — Update now"
7. User clicks "Update"
   → `registration.waiting?.postMessage({ type: "SKIP_WAITING" })`
   → `self.skipWaiting()` in SW
   → `clientsClaim()` activates new SW
   → Page reloads with new version
8. If user dismisses toast, keeps running old version until next navigation
```

### Why Not Auto-Update?

An active Pomodoro timer must not be interrupted. Auto-updating the SW triggers `clientsClaim()` which reloads the page, resetting all in-memory state. Since the timer relies on Zustand + `localStorage`, the timer **would survive** a refresh (restored from active session), but the user would see a flash/refresh mid-focus. Prompt-based avoids this entirely.

### Implementation in Service Worker

```typescript
// In app/sw.ts — do NOT set skipWaiting: true
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,      // Explicit: wait for user confirmation
  clientsClaim: false,      // Don't claim clients until after skipWaiting
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // ... other options
});

// Listen for skip waiting message from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
```

### Frontend Update Detection

A dedicated hook `hooks/use-sw-update.ts` watches for a waiting service worker and exposes a trigger:

```typescript
function useSWUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        setUpdateAvailable(true);
        setRegistration(reg);
      }
    });

    const handleUpdateFound = () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.installing) {
        reg.installing.addEventListener("statechange", () => {
          if (reg.waiting) {
            setUpdateAvailable(true);
            setRegistration(reg);
          }
        });
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload();
    });
  }, []);

  const applyUpdate = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  };

  return { updateAvailable, applyUpdate };
}
```

The update prompt UI is integrated into `app/providers.tsx` as a `useEffect` that shows a `sonner` toast when `updateAvailable` is true.

---

## Technical Design

### 1. File Structure

```
app/
├── sw.ts                          — Service worker source (Serwist + runtime caching)
├── layout.tsx                     — Updated: iOS meta tags, manifest, apple-web-app-capable
├── providers.tsx                  — Updated: SW registration component, update toast
└── (offline)/
    └── ~offline/
        └── page.tsx               — Offline fallback page (static, no data dependencies)

components/pwa/
├── sw-register.tsx                — Client component that registers SW + listens for updates
└── sw-update-toast.tsx            — Toast UI for "Update available" notification

public/
├── icon-192.png                   — New: 192×192 PNG for manifest
├── icon-512.png                   — New: 512×512 PNG for manifest
└── apple-touch-icon-180.png       — New: 180×180 PNG for iOS (fallback from SVG)

scripts/
└── generate-pwa-icons.mjs         — Script to convert logo.svg → PNGs via sharp
```

### 2. Service Worker (`app/sw.ts`)

```typescript
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const revision = crypto.randomUUID();

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false,
  clientsClaim: false,
  navigationPreload: true,
  runtimeCaching: [
    // API routes: NetworkFirst
    {
      urlPattern: /^\/api\//,
      handler: "NetworkFirst",
      options: {
        cacheName: "api-cache",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 },
        networkTimeoutSeconds: 30,
      },
    },
    // Audio MP3s: CacheFirst
    {
      urlPattern: /\/audio\/.*\.mp3$/,
      handler: "CacheFirst",
      options: {
        cacheName: "audio-cache",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    // Static images: CacheFirst
    {
      urlPattern: /\.(?:svg|png|ico|webmanifest)$/,
      handler: "CacheFirst",
      options: {
        cacheName: "static-assets",
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
  ],
  fallbacks: {
    entries: [
      {
        url: "/~offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },
});

serwist.addEventListeners();

// Listen for skip-waiting message from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
```

### 3. Next.js Config (`next.config.ts`)

```typescript
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  disable: process.env.NODE_ENV === "development",
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  cacheOnNavigation: true,
  reloadOnOnline: true,
});

const nextConfig: NextConfig = {
  // existing config
};

export default withSerwist(nextConfig);
```

### 4. SW Registration (`components/pwa/sw-register.tsx`)

```typescript
"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "development" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }

    const register = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js");

      // Detect waiting SW for update prompt
      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New SW installed and waiting — dispatch custom event for the toast
            window.dispatchEvent(new CustomEvent("sw-update-available", { detail: { registration } }));
          }
        });
      });
    };

    register();
  }, []);

  return null; // Renderless component
}
```

### 5. Update Toast (`components/pwa/sw-update-toast.tsx`)

```typescript
"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export function SWUpdateToast() {
  useEffect(() => {
    const handleUpdate = (event: Event) => {
      const { registration } = (event as CustomEvent).detail;

      toast("A new version is available", {
        description: "Update to get the latest features and fixes.",
        action: {
          label: "Update",
          onClick: () => {
            registration.waiting?.postMessage({ type: "SKIP_WAITING" });
          },
        },
        duration: Infinity, // Dismisses only on action
      });
    };

    window.addEventListener("sw-update-available", handleUpdate);
    return () => window.removeEventListener("sw-update-available", handleUpdate);
  }, []);

  return null;
}
```

### 6. Providers Integration (`app/providers.tsx`)

```typescript
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { Toaster } from "@/components/ui/sonner";
import { SWRegister } from "@/components/pwa/sw-register";
import { SWUpdateToast } from "@/components/pwa/sw-update-toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-right" />
      <SWRegister />
      <SWUpdateToast />
    </QueryClientProvider>
  );
}
```

### 7. Layout Metadata Updates (`app/layout.tsx`)

Add iOS standalone meta tags and application name:

```typescript
export const metadata: Metadata = {
  title: "Zen Berry",
  description: "A mindful productivity app with Pomodoro timer, task management, and AI-powered insights",
  applicationName: "Zen Berry",
  icons: {
    icon: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon-180.png", sizes: "180x180", type: "image/png" },
      { url: "/apple-touch-icon.svg", sizes: "180x180", type: "image/svg+xml" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Zen Berry",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#86A788",
};
```

### 8. Web App Manifest Updates (`public/site.webmanifest`)

Add PNG icons alongside SVG icons:

```json
{
  "name": "Zen Berry",
  "short_name": "ZenBerry",
  "description": "A mindful productivity app with Pomodoro timer, task management, and AI-powered insights",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FEFCF3",
  "theme_color": "#86A788",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/favicon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any"
    },
    {
      "src": "/apple-touch-icon.svg",
      "sizes": "180x180",
      "type": "image/svg+xml",
      "purpose": "apple-touch-icon"
    }
  ]
}
```

### 9. Offline Fallback Page (`app/(offline)/~offline/page.tsx`)

A minimal static page with no data dependencies:

```typescript
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-matcha">You're offline</h1>
      <p className="text-muted-foreground max-w-sm">
        Your timer and tasks are still available. Changes will sync when you're back online.
      </p>
    </div>
  );
}
```

> **Note:** This page must be a server component with no `"use client"` directive. It cannot import from `@/store/timer-store` or any client hook. It is a static fallback HTML shell.

### 10. Icon Generation (`scripts/generate-pwa-icons.mjs`)

```javascript
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const PUBLIC_DIR = path.resolve("public");
const SOURCE_SVG = path.join(PUBLIC_DIR, "logo.svg");

const SIZES = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "apple-touch-icon-180.png", size: 180 },
];

async function main() {
  for (const { name, size } of SIZES) {
    const output = path.join(PUBLIC_DIR, name);
    await sharp(SOURCE_SVG, { density: 300 })
      .resize(size, size, { fit: "cover" })
      .png()
      .toFile(output);
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

main().catch(console.error);
```

Add a script to `package.json`:
```json
{
  "scripts": {
    "generate-pwa-icons": "node scripts/generate-pwa-icons.mjs"
  }
}
```

### 11. TanStack Query Tuning (`lib/query-client.ts`)

Increase `gcTime` for offline resilience:

```typescript
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 30, // 30 minutes (default is 5 minutes)
      staleTime: 1000 * 60 * 2, // 2 minutes — balance freshness vs re-fetches
      retry: 2,                 // Retry failed queries twice before showing error
      refetchOnWindowFocus: true,
    },
  },
});
```

### 12. TypeScript Config Updates (`tsconfig.json`)

```json
{
  "compilerOptions": {
    // ... existing options
    "types": [
      // ... existing types
      "@serwist/next/typings"
    ],
    "lib": [
      // ... existing libs
      "webworker"
    ]
  },
  "exclude": [
    // ... existing excludes
    "public/sw.js"
  ]
}
```

### 13. `.gitignore` Updates

```
# Serwist
public/sw*
public/sw-worker*
```

---

## Offline Behavior Matrix

| Page / Component | Offline Behavior | Data Source | Notes |
|-----------------|------------------|-------------|-------|
| `/auth/*` | Shell loads from precache; login/signup form renders | Cache (precached HTML) | Auth requires network for actual submission; forms show error on submit |
| `/dashboard` | Shell loads from precache; cards render with cached/empty data | Cache (precached HTML) | See per-card breakdown below |
| Timer card | **Fully functional** | Zustand + localStorage | Already works offline — no change needed |
| MIT card | Read cached tasks; writes fail with toast | TanStack Query cache | Optimistic update + toast on write failure |
| Brain Dump card | Read cached tasks; writes fail with toast | TanStack Query cache | Same as MIT |
| Streak card | Streak reads from localStorage; API call fails gracefully | Zustand + localStorage | Streak data is in localStorage; analytics API call is non-critical |
| AI Insights card | Shows cached insight or empty state | TanStack Query cache | AI review requires network; cached insight shown if available |
| Analytics charts | Shows empty state or "offline" message | TanStack Query cache | Requires API data; show cached summary if available |
| Pins page | Read cached pins; writes fail with toast | TanStack Query cache | Same pattern as tasks |
| Product tour | **Fully functional** | Client-side only | No network dependencies |
| Alarm sounds | **Fully functional** | CacheFirst audio | MP3s are cached on first play; play from cache offline |
| `/~offline` | Fallback page when navigation can't be served | Precached | Brief message + instructions |
| Auth submission | Form submission shows error toast | N/A | Network required |
| New task creation | Optimistic update + "saved locally" toast | TanStack Query + localStorage | Accepts input, shows in UI, queues for sync |

---

## Data Flow

### Page Load (Online)

```
1. User navigates to /dashboard
2. Service Worker intercepts fetch
3. NetworkFirst: tries network first
   └── Success → serve fresh HTML from server
4. SW serves HTML; page loads
5. SW background: precaches all build assets (first visit only)
6. TanStack Query refetches data from /api/*
7. Components render with live data
```

### Page Load (Offline — Repeat Visit)

```
1. User navigates to /dashboard
2. Service Worker intercepts fetch
3. NetworkFirst: network fails (offline)
   └── Fall back to precached shell HTML
4. SW serves cached shell; page renders
5. TanStack Query tries to fetch /api/*
   └── NetworkFirst → fails → serves cached data
   └── No cached data → empty state or cached fallback
6. Components render with cached/fallback data
7. Timer picks up from localStorage (always works)
```

### Page Load (Offline — First Visit, Uncached Page)

```
1. User navigates to /settings (not precached)
2. Service Worker intercepts fetch
3. NetworkFirst: network fails
4. No cache entry exists → fallback matcher fires
5. SW serves /~offline page
6. User sees "You're offline" message
```

### SW Update Flow

```
1. New build deployed to Vercel
2. User is on /dashboard with active SW
3. SW checks for updates (on navigation or every 24h)
4. New SW detected → fetch + install in background
5. New SW enters "waiting" state (skipWaiting: false)
6. `updatefound` event fires → SWRegister detects waiting SW
7. window dispatches "sw-update-available" custom event
8. SWUpdateToast shows "Update available" toast with action button
9. User clicks "Update"
   → registration.waiting.postMessage({ type: "SKIP_WAITING" })
   → self.skipWaiting() in SW
   → SW activates, claims clients
   → controllerchange event fires
   → window.location.reload()
10. Page loads with new version
```

### Icon Generation Flow

```
1. Developer runs: npm run generate-pwa-icons
2. script reads public/logo.svg
3. sharp converts SVG to PNG at 192×192, 512×512, 180×180
4. PNGs written to public/icon-192.png, public/icon-512.png, public/apple-touch-icon-180.png
5. Git commit the generated PNGs
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `app/sw.ts` | Service worker source — Serwist init, runtime caching, update listener |
| `app/(offline)/~offline/page.tsx` | Offline fallback page (static, no client hooks) |
| `components/pwa/sw-register.tsx` | Client component — registers SW, detects waiting updates |
| `components/pwa/sw-update-toast.tsx` | Client component — toast UI for "Update available" prompt |
| `scripts/generate-pwa-icons.mjs` | SVG-to-PNG conversion script using `sharp` |
| `public/icon-192.png` | 192×192 manifest icon (generated, committed) |
| `public/icon-512.png` | 512×512 manifest icon (generated, committed) |
| `public/apple-touch-icon-180.png` | 180×180 iOS home screen icon (generated, committed) |

## Files to Modify

| File | Change |
|------|--------|
| `next.config.ts` | Wrap with `withSerwistInit` — configure `swSrc`, `swDest`, `disable` in dev |
| `app/layout.tsx` | Add `applicationName`, `appleWebApp` to metadata; add PNG apple icon to icons array |
| `app/providers.tsx` | Import and render `<SWRegister />` and `<SWUpdateToast />` inside `Providers` |
| `lib/query-client.ts` | Increase `gcTime` to 30 min, set `staleTime` to 2 min |
| `public/site.webmanifest` | Add PNG icon entries (192, 512) |
| `tsconfig.json` | Add `@serwist/next/typings` to `types`, `"webworker"` to `lib`, exclude `public/sw.js` |
| `.gitignore` | Add `public/sw*` and `public/sw-worker*` lines |
| `package.json` | Add `@serwist/next` to dependencies, `serwist` and `sharp` to devDependencies; add `generate-pwa-icons` script |

---

## Installation & Dependencies

```bash
npm install @serwist/next
npm install -D serwist sharp
```

| Package | Version | Purpose |
|---------|---------|---------|
| `@serwist/next` | `^10.0.0-preview.14` | Next.js integration — build-time SW injection, config wrapper |
| `serwist` | latest | Core Serwist library — runtime caching, precaching, SW utilities |
| `sharp` | latest (dev) | High-performance SVG → PNG conversion for PWA icons |

---

## Security Considerations

| Concern | Mitigation |
|---------|------------|
| **SW scope** | SW serves from `/sw.js` with scope of `/` (entire origin); limited to Zen Berry's domain by browser design |
| **Secret exposure** | No API keys, tokens, or secrets are included in the SW source; `GEMINI_API_KEY` stays server-side only |
| **Cache poisoning** | All precached entries are content-addressed (Next.js build hashes); runtime caches are bounded by `maxEntries` |
| **API data in cache** | API responses are cached with 1-hour `maxAgeSeconds`; no PII is stored beyond what the API already returns |
| **SW update hijack** | SW file is served from the same origin with HTTPS; no third-party can inject a malicious SW |
| **Message validation** | The `message` event listener only responds to `type === "SKIP_WAITING"`; all other messages ignored |
| **Offline fallback** | The `/~offline` page contains no dynamic content or data — safe to serve to any user |

---

## Edge Cases

### SW Update During Active Timer

**Risk:** New SW activates mid-Pomodoro, triggering page reload.

**Mitigation:** `skipWaiting: false` ensures the new SW waits. The user must click "Update" in the toast for activation. A natural break point (timer completion → break mode) is the ideal update opportunity. If the user ignores the toast, the old SW continues to serve until the next page navigation or the user clicks update.

### Multiple Tabs

**Risk:** Opening Zen Berry in multiple tabs creates multiple SW clients. When a new SW activates, all tabs reload simultaneously.

**Mitigation:** `clientsClaim: false` means the new SW only controls clients after `skipWaiting()`. When the user confirms the update in one tab, all tabs controlled by the same SW will reload (this is standard SW behavior — unavoidable). The toast appears in each tab independently; only one needs to confirm.

### Offline → Online Transition

**Risk:** User creates tasks while offline. When connection returns, those writes are lost because they were never queued for sync.

**Mitigation (MVP):** Optimistic updates in TanStack Query show the task in the UI immediately. When the API call fails, a toast says "Saved locally — will sync when reconnected." On reconnection, the user can retry or the query refetches (and the optimistic task is lost). This is a known MVP limitation — Background Sync is deferred.

**Future:** Background Sync API would queue failed mutations in IndexedDB and replay them when online.

### Cache Filling First Visit

**Risk:** First visit has no cache. Navigating to a page while still loading could show the offline fallback.

**Mitigation:** `navigationPreload: true` tells the SW to start a network request in parallel with SW boot. Combined with the precache (which fills during the SW `install` event), navigation requests are served from the network on the first visit. The offline fallback only triggers for pages never visited while online.

### iOS Specifics

**Risk:** iOS Safari has stricter PWA requirements: no SW update checking in background, no `beforeinstallprompt` event.

**Mitigation:** iOS 16.4+ supports Home Screen web apps with SW. The `apple-mobile-web-app-capable` meta tag enables standalone mode. iOS checks for SW updates on app launch and periodically while running. The update prompt works on iOS when the user navigates within the app. Users add to Home Screen via Safari's Share menu (standard iOS flow).

### Large Audio Cache

**Risk:** 4 MP3 files cached; each is ~100-200 KB. Total is < 1 MB — negligible.

**Mitigation:** Bounded via `maxEntries: 10` (far more than our 4 files). No action needed.

### Service Worker Fails to Register

**Risk:** Older browser, private browsing mode (Safari), or extension conflict prevents SW registration.

**Mitigation:** The app degrades gracefully. All features work normally (just without offline caching or installability). `SWRegister` component silently catches errors.

### Server-Side Rendering of SW-dependent Components

**Risk:** `SWRegister` and `SWUpdateToast` use `window`, `navigator`, and `CustomEvent` — will crash during SSR.

**Mitigation:** Both components use `"use client"` directive and wrap browser API access in `useEffect` (runs only client-side). They return `null` during initial SSR render.

---

## Implementation Plan

### Phase 1: Foundation (Config + Icons)

| Step | Action | Details |
|------|--------|---------|
| 1.1 | Install dependencies | `npm install @serwist/next` + `npm install -D serwist sharp` |
| 1.2 | Create icon generation script | `scripts/generate-pwa-icons.mjs` — SVG→PNG using sharp |
| 1.3 | Generate PNG icons | Run `npm run generate-pwa-icons`; commit generated PNGs |
| 1.4 | Update `public/site.webmanifest` | Add 192×192 and 512×512 PNG icon entries |
| 1.5 | Update `next.config.ts` | Wrap with `withSerwistInit` |
| 1.6 | Update `tsconfig.json` | Add `@serwist/next/typings`, `"webworker"`, exclude `public/sw.js` |
| 1.7 | Update `.gitignore` | Add Serwist ignore patterns |

### Phase 2: Service Worker

| Step | Action | Details |
|------|--------|---------|
| 2.1 | Create `app/sw.ts` | Serwist initialization, runtime caching, update message listener |
| 2.2 | Create `app/(offline)/~offline/page.tsx` | Static offline fallback page |
| 2.3 | Create `components/pwa/sw-register.tsx` | SW registration + update detection |
| 2.4 | Create `components/pwa/sw-update-toast.tsx` | Update notification toast |

### Phase 3: Integration

| Step | Action | Details |
|------|--------|---------|
| 3.1 | Update `app/layout.tsx` | Add `applicationName`, `appleWebApp` to metadata |
| 3.2 | Update `app/providers.tsx` | Add `SWRegister` and `SWUpdateToast` components |
| 3.3 | Update `lib/query-client.ts` | Tune `gcTime`, `staleTime`, `retry` |
| 3.4 | Build and test | `npm run build` → verify SW is generated at `public/sw.js` |

### Phase 4: Testing & Polish

| Step | Action | Details |
|------|--------|---------|
| 4.1 | Chrome DevTools → Application → Service Workers | Verify SW is registered, active, and caching |
| 4.2 | Chrome DevTools → Lighthouse → PWA audit | Score ≥ 90 on PWA category |
| 4.3 | Offline test: DevTools → Network → Offline | Verify dashboard, auth, offline page work |
| 4.4 | iOS Safari test | Add to Home Screen → verify standalone mode, no Safari chrome |
| 4.5 | Update test: deploy a change → verify toast appears | Confirm prompt-based update flow works end-to-end |
| 4.6 | Verify timer survives offline → online transition | Start timer → go offline → timer ticks → go online → session logs sync |

---

## Acceptance Criteria

### Service Worker

- [ ] `public/sw.js` is generated during `next build` (exists after build, not in dev)
- [ ] Service worker registers successfully in production (`npm run build && npm start`)
- [ ] All Next.js build assets are precached and served from cache on repeat visits
- [ ] `skipWaiting` is `false` by default; SW enters "waiting" state on new version
- [ ] SW responds to `SKIP_WAITING` message by calling `self.skipWaiting()`
- [ ] `app/sw.ts` follows kebab-case naming and uses named exports

### Caching

- [ ] `/_next/static/*` requests are served from precache (no network on repeat visit)
- [ ] `/api/*` requests use NetworkFirst with 30-second timeout
- [ ] `/audio/*.mp3` requests are served CacheFirst (first fetch caches, subsequent fetches hit cache)
- [ ] `*.svg`, `*.png` static assets are served CacheFirst
- [ ] `/site.webmanifest` is served CacheFirst
- [ ] Each runtime cache is bounded by `maxEntries` and `maxAgeSeconds`

### Offline Behavior

- [ ] Navigating to `/dashboard` while offline shows the previously visited dashboard (not a blank page)
- [ ] Navigating to `/auth/login` while offline shows the login page (not a blank page)
- [ ] Navigating to an uncached page while offline shows the `/~offline` fallback page
- [ ] The `/~offline` page renders without any client-side JavaScript errors
- [ ] Timer starts, runs, and completes while fully offline (Zustand + localStorage)
- [ ] Alarm sounds play while fully offline (MP3 served from cache)
- [ ] Previously loaded tasks are visible while offline (TanStack Query cache)
- [ ] Creating a task while offline shows an optimistic update in the UI
- [ ] Creating a task while offline shows a toast indicating the write will sync later
- [ ] Product tour works while offline (no network dependencies)

### Installability

- [ ] Chrome DevTools → Application → Manifest shows a valid manifest with icons
- [ ] Chrome DevTools → Lighthouse → PWA audit passes "installable" category
- [ ] Browser shows the "Install" icon in the address bar when criteria are met
- [ ] Installing the app creates a home screen icon with the 512×512 icon

### iOS Support

- [ ] `apple-mobile-web-app-capable` meta tag is present in `<head>` with value `"yes"`
- [ ] `apple-mobile-web-app-status-bar-style` meta tag is present with value `"default"`
- [ ] `application-name` is set to `"Zen Berry"` in metadata
- [ ] Adding to Home Screen via Safari Share menu opens the app in standalone full-screen mode
- [ ] The 180×180 PNG (`apple-touch-icon-180.png`) is used as the home screen icon
- [ ] `formatDetection` with `telephone: false` prevents phone number auto-linking

### Update Flow

- [ ] Deploying a new version triggers the SW `updatefound` event on existing clients
- [ ] A toast appears: "A new version is available" with an "Update" action button
- [ ] Clicking "Update" activates the new SW and reloads the page
- [ ] Dismissing the toast keeps the old version active
- [ ] An active Pomodoro timer is NOT interrupted by a SW update (user must confirm)

### TanStack Query

- [ ] `gcTime` is set to `1000 * 60 * 30` (30 minutes) in default options
- [ ] `staleTime` is set to `1000 * 60 * 2` (2 minutes) in default options
- [ ] `retry` is set to `2` in default options

### Configuration

- [ ] `next.config.ts` wraps the Next.js config with `withSerwistInit`
- [ ] `withSerwistInit` has `disable: true` when `NODE_ENV === "development"`
- [ ] `tsconfig.json` includes `"@serwist/next/typings"` in `types` array
- [ ] `tsconfig.json` includes `"webworker"` in `lib` array
- [ ] `tsconfig.json` excludes `public/sw.js`
- [ ] `.gitignore` ignores `public/sw*` and `public/sw-worker*`
- [ ] `package.json` lists `@serwist/next` in dependencies, `serwist` and `sharp` in devDependencies
- [ ] `package.json` has a `"generate-pwa-icons"` script entry
- [ ] `public/icon-192.png` exists and is a valid 192×192 PNG
- [ ] `public/icon-512.png` exists and is a valid 512×512 PNG
- [ ] `public/apple-touch-icon-180.png` exists and is a valid 180×180 PNG
- [ ] `robots.txt` remains empty (no changes)

### Code Quality

- [ ] All new files use kebab-case naming (e.g., `sw-register.tsx`, `sw-update-toast.tsx`)
- [ ] All new components use named exports
- [ ] No `"use client"` on the offline fallback page
- [ ] SW registration gracefully handles browsers without SW support (no crashes)
- [ ] No secrets or API keys in the service worker source
- [ ] All `console.log`/debug statements removed from production code

---

## Open Questions

- None — all design decisions are settled above.

---

## Future Considerations (explicitly out of scope for this iteration)

- Background Sync API for queueing failed task/session writes
- Custom install prompt button (e.g., "Install App" in UI)
- Push notifications (session completion, streak reminders)
- Periodic background sync (daily data refresh)
- IndexedDB for structured data cache (beyond TanStack Query's in-memory cache)
- Offline analytics charts with cached historical data
- Offline AI insights (requires on-device ML or cached responses)
- Dynamic icon generation per environment (staging vs production badges)
- Splash screen customization via `apple-touch-startup-image`
