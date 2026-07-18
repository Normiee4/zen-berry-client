# Test Spec: PWA Support

## Test Environment Prerequisites

| Requirement | Details |
|-------------|---------|
| **Build mode** | Service worker is disabled in development (`NODE_ENV === "development"`). All SW-dependent tests require **production build**: `npm run build && npm start` |
| **Browsers** | Chrome/Chromium for SW, manifest, and installability tests. Firefox for basic testing (SW support varies). Safari/iOS for iOS-specific tests (manual only) |
| **Tools** | Chrome DevTools → Application panel, Lighthouse PWA audit |
| **Network** | Offline testing via DevTools → Network → Offline toggle |
| **Auth** | Some pages require auth; use valid session or skip auth pages in offline tests |
| **CI** | Playwright in CI runs `npm run build && npm start` (production), so SW tests pass automatically |

---

## Test Categories

### 1. Service Worker

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-001 | SW Registration | Verify `/sw.js` is registered as active service worker in production | Production build running (`npm start`) | 1. Open Chrome DevTools → Application → Service Workers<br>2. Navigate to any app page<br>3. Check Service Workers list | SW registered for `http://localhost:3000` with status "activated and is running" |
| TC-PWA-002 | SW Registration | Verify SW registers in Playwright via `navigator.serviceWorker.controller` | Production build running | 1. Navigate to `/dashboard`<br>2. Evaluate `navigator.serviceWorker.controller` | Returns a non-null ServiceWorker object whose scriptURL ends with `/sw.js` |
| TC-PWA-003 | SW Registration | Verify SW does NOT register in development mode | Dev server running (`npm run dev`) | 1. Navigate to any page<br>2. Evaluate `navigator.serviceWorker.controller` | Returns `null` (SW disabled in dev) |
| TC-PWA-004 | SW Activation | Verify SW installs and activates successfully | Production build running | 1. Register SW via `navigator.serviceWorker.register('/sw.js')`<br>2. Wait for state to be 'activated' | Registration promise resolves; `registration.active` is non-null |
| TC-PWA-005 | SW Scope | Verify SW scope is `/` (entire origin) | Production build running | 1. Get SW registration<br>2. Check `registration.scope` | `registration.scope` ends with `/` |
| TC-PWA-006 | SW Build Artifact | Verify `public/sw.js` is generated during build | After `npm run build` | 1. Check file system for `public/sw.js`<br>2. Verify it's a valid JS file with Serwist code | `public/sw.js` exists, is non-empty, and contains Serwist initialization code |
| TC-PWA-007 | Skip Waiting | Verify SW does NOT auto-skip waiting (must wait for user) | Production build, new SW available | 1. Check SW source or verify `skipWaiting` option<br>2. Look for `self.skipWaiting()` call only in message handler | `skipWaiting: false` in Serwist config; `self.skipWaiting()` only called when `SKIP_WAITING` message received |
| TC-PWA-008 | SKIP_WAITING Message | Verify SW responds to `SKIP_WAITING` postMessage | Production build running | 1. Post `{ type: "SKIP_WAITING" }` to the active SW<br>2. Check if `self.skipWaiting()` was called | SW activates; clients are claimed; subsequent navigations use new SW |
| TC-PWA-009 | Message Validation | Verify SW ignores non-SKIP_WAITING messages | Production build running | 1. Post `{ type: "IGNORE" }` to the active SW<br>2. Check SW state | SW ignores message; no skip/activation occurs |

### 2. Caching

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-010 | Caching | Verify Next.js build assets are precached | Production build, first visit complete | 1. Load app once (populates precache)<br>2. Go offline<br>3. Reload page | Page loads from precache (no network errors) |
| TC-PWA-011 | Caching | Verify `/api/*` requests use NetworkFirst with 30s timeout | Production build running | 1. Inspect SW runtime caching config<br>2. Check `/api/` URL pattern handler | Handler is `NetworkFirst` with `networkTimeoutSeconds: 30`, cache name `api-cache`, max 50 entries, 1 hour max age |
| TC-PWA-012 | Caching | Verify `/audio/*.mp3` uses CacheFirst | Production build running | 1. Inspect SW runtime caching config<br>2. Check audio URL pattern | Handler is `CacheFirst` with cache name `audio-cache`, max 10 entries, 1 year max age |
| TC-PWA-013 | Caching | Verify static images (SVG, PNG) use CacheFirst | Production build running | 1. Inspect SW runtime caching config<br>2. Check image URL pattern | Handler is `CacheFirst` with cache name `static-assets`, max 50 entries, 30 days max age |
| TC-PWA-014 | Caching | Verify `/site.webmanifest` uses CacheFirst | Production build running | 1. Inspect SW runtime caching config<br>2. Check webmanifest URL pattern | Handler is `CacheFirst`; file pattern includes `.webmanifest` |
| TC-PWA-015 | Caching | Verify API cache returns cached data when offline | Production build, API data cached | 1. Load dashboard (caches API responses)<br>2. Go offline<br>3. Navigate dashboard | Dashboard loads with cached (previously seen) data |
| TC-PWA-016 | Caching | Verify audio plays from cache when offline | Production build, audio cached | 1. Play alarm sound at least once (populates cache)<br>2. Go offline<br>3. Trigger alarm | Alarm sound plays successfully from cache |
| TC-PWA-017 | Caching | Verify cache name conventions match spec | Source code review | 1. Read `app/sw.ts` | Cache names match: `api-cache`, `audio-cache`, `static-assets` |

### 3. Offline Behavior

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-018 | Offline | Dashboard loads from cache when offline (repeat visit) | Production build, dashboard loaded once while online | 1. Load `/dashboard` while online<br>2. Go offline (DevTools → Network → Offline)<br>3. Reload `/dashboard` | Dashboard shell renders; no blank page or browser error page |
| TC-PWA-019 | Offline | Auth pages load from cache when offline | Production build, auth pages loaded once while online | 1. Load `/auth/login` while online<br>2. Go offline<br>3. Reload `/auth/login` | Login page shell renders |
| TC-PWA-020 | Offline | Uncached page shows `/~offline` fallback | Production build, page never visited | 1. Go offline<br>2. Navigate to `/some-uncached-page` | SW serves `/~offline` fallback page with "You're offline" message |
| TC-PWA-021 | Offline | `/~offline` page renders without JS errors | Production build | 1. Navigate to `/~offline` directly (offline or online)<br>2. Check console for errors | Page renders silently with no client-side JS errors (server component, no `"use client"`) |
| TC-PWA-022 | Offline | Timer runs fully offline | Any build | 1. Start Pomodoro timer while online<br>2. Go offline<br>3. Let timer tick for 10+ seconds | Timer continues; time decreases; timer state is accurate |
| TC-PWA-023 | Offline | Timer completes offline | Any build | 1. Set a very short timer (e.g., 1 second)<br>2. Go offline<br>3. Wait for timer completion | Timer completes; session completion triggers; no crashes |
| TC-PWA-024 | Offline | Alarm sounds play while fully offline | Production build, audio cached | 1. Play alarm sound at least once while online<br>2. Go offline<br>3. Trigger alarm via timer completion | Alarm sound plays from cache |
| TC-PWA-025 | Offline | Previously loaded tasks are visible offline | Production build, tasks loaded | 1. Load dashboard while online (tasks cached by TanStack Query)<br>2. Go offline<br>3. View MIT / Brain Dump sections | Previously loaded tasks are visible (from TanStack Query cache) |
| TC-PWA-026 | Offline | Creating a task offline shows optimistic update | Production build | 1. Go offline<br>2. Type task title and submit in Brain Dump<br>3. Observe UI | Task appears in the list immediately (optimistic update) |
| TC-PWA-027 | Offline | Offline task creation shows appropriate toast | Production build | 1. Go offline<br>2. Create a task<br>3. Observe toast | Toast appears indicating the write will sync when reconnected |
| TC-PWA-028 | Offline | Product tour works offline | Any build | 1. Go offline<br>2. Trigger product tour<br>3. Navigate through steps | Tour works; all steps render from client-side state (no network dependencies) |
| TC-PWA-029 | Offline | Creating a task offline and going back online syncs data | Production build | 1. Go offline<br>2. Create task (optimistic update appears)<br>3. Go online<br>4. Refresh page | When refetching, server state syncs (optimistic task may be persisted if server accepted it, or list updates from server) |

### 4. Installability

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-030 | Installability | Manifest is valid and parseable | Any build | 1. Navigate to any page<br>2. Check `<link rel="manifest">` exists<br>3. Fetch `/site.webmanifest` and parse JSON | Manifest link present; response is valid JSON with required fields |
| TC-PWA-031 | Installability | Manifest includes 192×192 PNG icon | Any build | 1. Fetch `/site.webmanifest`<br>2. Check `icons` array | Entry with `src: "/icon-192.png"`, `sizes: "192x192"`, `type: "image/png"` exists |
| TC-PWA-032 | Installability | Manifest includes 512×512 PNG icon | Any build | 1. Fetch `/site.webmanifest`<br>2. Check `icons` array | Entry with `src: "/icon-512.png"`, `sizes: "512x512"`, `type: "image/png"` exists |
| TC-PWA-033 | Installability | Manifest has correct `display: standalone` | Any build | 1. Fetch `/site.webmanifest` | `display` field is `"standalone"` |
| TC-PWA-034 | Installability | Manifest has correct `start_url` | Any build | 1. Fetch `/site.webmanifest` | `start_url` is `"/"` |
| TC-PWA-035 | Installability | Manifest has correct `name` and `short_name` | Any build | 1. Fetch `/site.webmanifest` | `name` is `"Zen Berry"`, `short_name` is `"ZenBerry"` |
| TC-PWA-036 | Installability | PNG icon files exist at expected paths | File system check | 1. Check `public/icon-192.png`<br>2. Check `public/icon-512.png` | Files exist; both are valid PNG images of correct dimensions |
| TC-PWA-037 | Installability | Lighthouse PWA audit passes "installable" category | Production build | 1. Run Lighthouse audit on `/dashboard`<br>2. Check PWA category | "Installable" check passes; manifest valid, SW registered, HTTPS (localhost exempt) |

### 5. iOS Support

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-038 | iOS | `apple-mobile-web-app-capable` meta tag present | Any build | 1. View page source or inspect `<head>`<br>2. Search for `apple-mobile-web-app-capable` | Meta tag present with `content="yes"` |
| TC-PWA-039 | iOS | `apple-mobile-web-app-status-bar-style` meta tag present | Any build | 1. View page source or inspect `<head>`<br>2. Search for `apple-mobile-web-app-status-bar-style` | Meta tag present with `content="default"` |
| TC-PWA-040 | iOS | `application-name` metadata set | Any build | 1. Inspect `<meta name="application-name">` or check `Metadata` object | `applicationName` is `"Zen Berry"` in the exported metadata |
| TC-PWA-041 | iOS | `formatDetection` disables telephone auto-linking | Any build | 1. Inspect `<meta name="format-detection">` | Meta tag present with `content="telephone=no"` |
| TC-PWA-042 | iOS | Apple touch icon 180×180 PNG exists | File system check | 1. Check `public/apple-touch-icon-180.png` | File exists; valid 180×180 PNG |
| TC-PWA-043 | iOS | Apple touch icon is linked in layout metadata | Source code review | 1. Read `app/layout.tsx` → `icons.apple` array | Entry with `url: "/apple-touch-icon-180.png"`, `sizes: "180x180"`, `type: "image/png"` exists |
| TC-PWA-044 | iOS | Viewport has theme-color meta tag | Any build | 1. Inspect `<meta name="theme-color">`<br>2. Check `Viewport` export in `layout.tsx` | Theme color is `#86A788` (matcha green) |

### 6. Update Flow

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-045 | Update | SW `updatefound` event fires when new SW is detected | Production build | 1. Register SW (v1)<br>2. Deploy new build (v2)<br>3. Listen for `updatefound` event on registration | Event fires; `registration.installing` is non-null |
| TC-PWA-046 | Update | `SWRegister` component detects waiting SW and dispatches custom event | Production build, new SW available | 1. Load page (SW v1 active)<br>2. New SW v2 enters waiting state<br>3. Check that `sw-update-available` custom event fires | Custom event dispatched on `window` with `detail.registration` |
| TC-PWA-047 | Update | `SWUpdateToast` shows toast on `sw-update-available` event | Production build, new SW available | 1. Dispatch `sw-update-available` custom event<br>2. Observe UI | Toast appears with message "A new version is available" and an "Update" action button |
| TC-PWA-048 | Update | Clicking "Update" posts `SKIP_WAITING` message | Production build, toast visible | 1. Click "Update" button on toast<br>2. Check SW communication | `registration.waiting.postMessage({ type: "SKIP_WAITING" })` is called |
| TC-PWA-049 | Update | Page reloads after SW activates (controllerchange) | Production build, toast visible | 1. Click "Update"<br>2. Observe page behavior | `controllerchange` event fires; `window.location.reload()` is called; page refreshes |
| TC-PWA-050 | Update | Dismissing toast keeps old version active | Production build, toast visible | 1. Dismiss/ignore the update toast<br>2. Check SW state | Old SW remains active; no page reload; new SW stays in "waiting" state |
| TC-PWA-051 | Update | Active Pomodoro timer is NOT interrupted by SW update | Production build | 1. Start Pomodoro timer<br>2. New SW becomes available (simulate)<br>3. Verify timer continues uninterrupted | Timer keeps running; no page reload or state loss until user explicitly clicks "Update" |
| TC-PWA-052 | Update | Toast duration is `Infinity` (persists until action taken) | Source code review | 1. Read `components/pwa/sw-update-toast.tsx` | `toast()` call has `duration: Infinity` |

### 7. Configuration

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-053 | Config | `next.config.ts` wraps config with `withSerwistInit` | Source code review | 1. Read `next.config.ts` | Config uses `withSerwistInit({...})` and `export default withSerwist(nextConfig)` |
| TC-PWA-054 | Config | `withSerwistInit` has `disable: true` in development | Source code review | 1. Read `next.config.ts` | `disable: process.env.NODE_ENV === "development"` |
| TC-PWA-055 | Config | `withSerwistInit` has correct `swSrc` and `swDest` | Source code review | 1. Read `next.config.ts` | `swSrc: "app/sw.ts"`, `swDest: "public/sw.js"` |
| TC-PWA-056 | Config | `tsconfig.json` includes `@serwist/next/typings` | Source code review | 1. Read `tsconfig.json` | `"types"` array includes `"@serwist/next/typings"` |
| TC-PWA-057 | Config | `tsconfig.json` includes `"webworker"` in `lib` | Source code review | 1. Read `tsconfig.json` | `"lib"` array includes `"webworker"` |
| TC-PWA-058 | Config | `tsconfig.json` excludes `public/sw.js` | Source code review | 1. Read `tsconfig.json` | `"exclude"` array includes `"public/sw.js"` |
| TC-PWA-059 | Config | `.gitignore` ignores `public/sw*` and `public/sw-worker*` | Source code review | 1. Read `.gitignore` | Lines `public/sw*` and `public/sw-worker*` are present |
| TC-PWA-060 | Config | `@serwist/next` in `dependencies`, `serwist` and `sharp` in `devDependencies` | Source code review | 1. Read `package.json` | `@serwist/next` in `dependencies`; `serwist` and `sharp` in `devDependencies` |
| TC-PWA-061 | Config | `generate-pwa-icons` script exists | Source code review | 1. Read `package.json` `scripts` | `"generate-pwa-icons": "node scripts/generate-pwa-icons.mjs"` |
| TC-PWA-062 | Config | `public/icon-192.png` is a valid 192×192 PNG | File system check | 1. Check image dimensions | 192×192 pixels, valid PNG format |
| TC-PWA-063 | Config | `public/icon-512.png` is a valid 512×512 PNG | File system check | 1. Check image dimensions | 512×512 pixels, valid PNG format |
| TC-PWA-064 | Config | `public/apple-touch-icon-180.png` is a valid 180×180 PNG | File system check | 1. Check image dimensions | 180×180 pixels, valid PNG format |
| TC-PWA-065 | Config | `public/robots.txt` is empty (no changes made) | File system check | 1. Read `public/robots.txt` | File is empty (or contains only whitespace/comments) |
| TC-PWA-066 | Config | `cacheOnNavigation: true` in Serwist config | Source code review | 1. Read `next.config.ts` | `cacheOnNavigation: true` is set |
| TC-PWA-067 | Config | `reloadOnOnline: true` in Serwist config | Source code review | 1. Read `next.config.ts` | `reloadOnOnline: true` is set |

### 8. TanStack Query Tuning

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-068 | Query | `gcTime` set to 30 minutes | Source code review | 1. Read `lib/query-client.ts` | `gcTime: 1000 * 60 * 30` (30 minutes) |
| TC-PWA-069 | Query | `staleTime` set to 2 minutes | Source code review | 1. Read `lib/query-client.ts` | `staleTime: 1000 * 60 * 2` (2 minutes) |
| TC-PWA-070 | Query | `retry` set to 2 | Source code review | 1. Read `lib/query-client.ts` | `retry: 2` |
| TC-PWA-071 | Query | `refetchOnWindowFocus` is enabled | Source code review | 1. Read `lib/query-client.ts` | `refetchOnWindowFocus: true` |

### 9. Edge Cases

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-072 | Edge | Browser without SW support degrades gracefully | Browser without SW (or mock) | 1. Load app in environment without `navigator.serviceWorker`<br>2. Verify no crashes | App loads normally; all features work (no offline/installability); no errors |
| TC-PWA-073 | Edge | Private browsing mode (Safari) — SW registration fails silently | Private/incognito mode | 1. Open incognito/private window<br>2. Load app<br>3. Check console for SW errors | No unhandled errors; SW registration failure is caught silently; app works |
| TC-PWA-074 | Edge | SW update during active timer — user not interrupted | Production build | 1. Start Pomodoro (focus mode)<br>2. Simulate new SW available<br>3. Observe behavior | Timer continues; no page reload; update toast appears but timer unaffected |
| TC-PWA-075 | Edge | Multiple tabs open — update in one tab reloads all | Production build, 2+ tabs | 1. Open app in Tab A and Tab B<br>2. Simulate new SW in Tab A<br>3. Click "Update" in Tab A | Both tabs reload when new SW activates (`clientsClaim()`) |
| TC-PWA-076 | Edge | Offline → Online transition — tasks sync | Production build | 1. Go offline<br>2. Create new task (optimistic update visible)<br>3. Go online<br>4. Wait for TanStack Query refetch | Task list refreshes; tasks from server appear |
| TC-PWA-077 | Edge | First visit — no cache, navigation loads from network | Production build, fresh profile | 1. Clear all caches and SW registration<br>2. Load `/dashboard` while online | Dashboard loads from network; SW installs; precache populates |
| TC-PWA-078 | Edge | iOS Safari — standalone mode works | iOS device or simulator | 1. Add to Home Screen via Safari Share menu<br>2. Open from Home Screen | App opens in full-screen standalone mode (no Safari address bar/toolbar) |
| TC-PWA-079 | Edge | Icon generation script produces valid PNGs | Node.js with sharp | 1. Run `npm run generate-pwa-icons`<br>2. Check output files | Three PNGs generated at correct sizes (192, 512, 180) |
| TC-PWA-080 | Edge | No secrets in SW source | Source code review | 1. Read `app/sw.ts` | Contains no API keys, tokens, secrets, or environment variables with sensitive values |

### 10. Code Quality

| ID | Category | Description | Preconditions | Steps | Expected Result |
|----|----------|-------------|---------------|-------|-----------------|
| TC-PWA-081 | Quality | All new files use kebab-case naming | Source code review | 1. List new files: `app/sw.ts`, `components/pwa/sw-register.tsx`, `components/pwa/sw-update-toast.tsx`, `scripts/generate-pwa-icons.mjs` | All file names are kebab-case |
| TC-PWA-082 | Quality | All new components use named exports | Source code review | 1. Check exports in `sw-register.tsx`, `sw-update-toast.tsx` | Named exports: `export function SWRegister()`, `export function SWUpdateToast()` |
| TC-PWA-083 | Quality | Offline fallback page has NO `"use client"` directive | Source code review | 1. Read `app/(offline)/~offline/page.tsx` | No `"use client"` directive; it is a server component |
| TC-PWA-084 | Quality | PWA components use `"use client"` | Source code review | 1. Read `sw-register.tsx` and `sw-update-toast.tsx` | Both have `"use client"` directive at the top |
| TC-PWA-085 | Quality | SW registration catches errors gracefully | Source code review | 1. Read `sw-register.tsx` | No `.catch()` omitted; registration failure is silent (no crash) |

---

## Acceptance Criteria Coverage Map

| AC from SPEC.md | Test Case(s) |
|-----------------|-------------|
| `public/sw.js` generated during `next build` | TC-PWA-006 |
| SW registers in production | TC-PWA-001, TC-PWA-002 |
| All Next.js assets precached | TC-PWA-010 |
| `skipWaiting: false` by default | TC-PWA-007 |
| SW responds to `SKIP_WAITING` | TC-PWA-008 |
| kebab-case naming in `app/sw.ts` | TC-PWA-081 |
| `/_next/static/*` served from precache | TC-PWA-010 |
| `/api/*` NetworkFirst with 30s timeout | TC-PWA-011 |
| `/audio/*.mp3` CacheFirst | TC-PWA-012 |
| Static assets (SVG, PNG) CacheFirst | TC-PWA-013 |
| `/site.webmanifest` CacheFirst | TC-PWA-014 |
| Runtime caches bounded | TC-PWA-011, TC-PWA-012, TC-PWA-013 |
| Dashboard loads offline | TC-PWA-018 |
| Auth pages load offline | TC-PWA-019 |
| Uncached page → `/~offline` | TC-PWA-020 |
| `/~offline` renders without JS errors | TC-PWA-021 |
| Timer works offline | TC-PWA-022, TC-PWA-023 |
| Alarm sounds play offline | TC-PWA-024 |
| Tasks visible offline | TC-PWA-025 |
| Offline task creation shows optimistic update | TC-PWA-026 |
| Offline task creation shows toast | TC-PWA-027 |
| Product tour works offline | TC-PWA-028 |
| Valid manifest with icons | TC-PWA-030, TC-PWA-031, TC-PWA-032 |
| Lighthouse "installable" passes | TC-PWA-037 |
| `apple-mobile-web-app-capable` | TC-PWA-038 |
| `apple-mobile-web-app-status-bar-style` | TC-PWA-039 |
| `application-name` set | TC-PWA-040 |
| 180×180 apple touch icon | TC-PWA-042, TC-PWA-043 |
| `formatDetection` telephone-no | TC-PWA-041 |
| `updatefound` fires on new version | TC-PWA-045 |
| Toast appears on new version | TC-PWA-047 |
| "Update" activates SW + reloads | TC-PWA-048, TC-PWA-049 |
| Dismissing keeps old version | TC-PWA-050 |
| Active timer NOT interrupted | TC-PWA-051 |
| `gcTime` = 30 min | TC-PWA-068 |
| `staleTime` = 2 min | TC-PWA-069 |
| `retry` = 2 | TC-PWA-070 |
| `next.config.ts` wrapped with `withSerwistInit` | TC-PWA-053 |
| `disable: true` in dev | TC-PWA-054 |
| `tsconfig.json` types/lib/exclude | TC-PWA-056, TC-PWA-057, TC-PWA-058 |
| `.gitignore` patterns | TC-PWA-059 |
| Dependencies in package.json | TC-PWA-060 |
| `generate-pwa-icons` script | TC-PWA-061 |
| PNG icons exist | TC-PWA-062, TC-PWA-063, TC-PWA-064 |
| `robots.txt` empty | TC-PWA-065 |
| kebab-case naming | TC-PWA-081 |
| Named exports | TC-PWA-082 |
| No `"use client"` on offline page | TC-PWA-083 |
| Graceful SW failure | TC-PWA-085 |
| No secrets in SW | TC-PWA-080 |

---

## Manual Test Cases (Cannot Be Automated)

| ID | Description | Why Manual |
|----|-------------|------------|
| TC-PWA-MAN-001 | Chrome "Install" icon appears in address bar | Requires real browser install prompt; Chromium-specific; Playwright cannot trigger `beforeinstallprompt` |
| TC-PWA-MAN-002 | iOS Safari: Add to Home Screen → standalone mode | Requires physical iOS device or simulator; cannot automate Safari's Share menu |
| TC-PWA-MAN-003 | Lighthouse PWA audit pass on full PWA checklist | Lighthouse in DevTools vs CI differs; use `lighthouse-ci` for automation |
| TC-PWA-MAN-004 | Timer completes offline → comes online → session syncs | Requires precise offline→online transition timing; complex to automate reliably |
| TC-PWA-MAN-005 | Installing the app creates home screen icon with 512×512 icon | Requires actual installation; no automation available |
| TC-PWA-MAN-006 | Apple touch icon appears on iOS home screen | Requires iOS device |

---

## Test Execution Order

1. **Config & Code Quality** tests (no server needed) — run first as smoke checks
2. **Meta tag & manifest** tests (work in any mode) — run on every build
3. **TanStack Query** tests (source review) — static analysis
4. **SW Registration & Caching** tests (require production build) — run in CI
5. **Offline behavior** tests (require production build) — run in CI
6. **Update flow** tests (require production build + version change) — run in staging
7. **Manual** tests — run before release

For CI, run test groups 1–5. For release, run all groups including manual checks.
