# Test Spec: Timer Alarms

## Overview
This document describes the test strategy for the Timer Alarms feature. The feature adds configurable alarm sounds that play when a focus or rest timer completes. It consists of store extensions (alarm sound type + state + persistence), a shared `AudioManager` singleton (Web Audio API), a subscription hook for playback and keepalive, and a UI picker component inside the Timer Settings dialog.

Since the project does not currently have a unit test runner configured, test files live under `tests/` as reference specs. They are written in a standard `describe`/`it`/`expect` pattern compatible with Vitest (recommended) or Jest. Mocking patterns use `vi.mock()` (Vitest) and can be adapted to `jest.mock()` if needed.

---

## Test Layers

### 1. Store Layer — `store/timer-store.ts`
**Framework**: Unit tests with mocked `localStorage` and Zustand store assertions

#### Happy Path
- `AlarmSound` type accepts `"none"`, `"bell"`, `"chime"`, `"digital"`, `"lofi"`
- `loadAlarmSound()` returns a valid stored value from `localStorage`
- `saveAlarmSound()` writes the selected sound to `localStorage`
- `setAlarmSound` action updates store state and calls `saveAlarmSound()`
- Initial store state uses `loadAlarmSound()` to hydrate `alarmSound`
- `saveActiveSession()` includes `alarmSound` in the serialized session
- `restoreSession()` restores `alarmSound` from a saved session when present
- `ActiveSession` interface includes the `alarmSound` field

#### Edge Cases
- `loadAlarmSound()` returns `"none"` when `localStorage` has no entry for the key
- `loadAlarmSound()` returns `"none"` when stored value is invalid (not in the union)
- `loadAlarmSound()` returns `"none"` on parse error (corrupted data)
- `restoreSession()` handles saved sessions without `alarmSound` (migration from old format) — alarmSound retains its current value
- `saveAlarmSound()` silently ignores write failures

#### Error Scenarios
- `localStorage.getItem()` throws → `loadAlarmSound()` returns `"none"`
- `localStorage.setItem()` throws → `saveAlarmSound()` ignores the error silently

---

### 2. Audio Manager Layer — `lib/audio-manager.ts`
**Framework**: Unit tests with mocked Web Audio API (`AudioContext`, `AudioBufferSourceNode`, `AudioBuffer`, `GainNode`)

#### Happy Path
- `init()` creates an `AudioContext`, fetches and decodes all 4 MP3 buffers, sets up `onstatechange` handler
- `init()` registers unlock handler via `pointerdown`/`keydown` when context starts suspended
- `init()` returns the same promise on subsequent calls (idempotent)
- `startKeepAlive()` creates a 1-sample silent `AudioBufferSourceNode` with `loop: true`
- `startKeepAlive()` is idempotent (no-op if already active)
- `stopKeepAlive()` stops and nulls the keepalive source
- `play("bell")` creates an `AudioBufferSourceNode` at 0.5 volume, calls `source.start()`, sets `_isPlaying = true`
- `play("chime")` uses the correct duration (4000ms) before auto-stopping
- `play("lofi")` uses the correct duration (9000ms) before auto-stopping
- `preview("bell", 3000)` stops current playback, plays at 0.3 volume, auto-stops after 3000ms
- `stop()` clears timeout, stops source, resets `_isPlaying`
- `getIsPlaying()` returns current `_isPlaying` state

#### Edge Cases
- `play("none")` returns immediately — no source created
- `play()` returns early if `_isPlaying` is already `true` (no overlap)
- `play()` returns early if buffer for the sound is missing (fetch failure)
- `play()` returns early if `ctx` is `null` (init failed)
- `preview("none")` returns immediately
- Calling `preview()` while alarm is playing stops the alarm first
- `stopKeepAlive()` when no keepalive is active is a safe no-op

#### iOS Suspension Recovery
- When `ctx.state === "suspended"` in `play()`, the sound is stored in `queuedSound` and `ctx.resume()` is called
- If `ctx.resume()` succeeds (context transitions to `"running"`), `playInternal()` fires and queue is cleared
- If `ctx.resume()` fails, `queuedSound` remains set for gesture handler
- `registerUnlockHandler()`'s callback (on `pointerdown`/`keydown`) resumes context and drains `queuedSound`
- `queuedSound` is set to `null` after being drained (prevents double-play)
- `onstatechange` handler re-registers unlock handler via `registerUnlockHandler()` whenever context transitions to `"suspended"`

#### Error Scenarios
- `new AudioContext()` throws → `ctx` is `null`, all playback methods return early
- `fetch()` fails for a sound → individual buffer is missing, `play()` returns early for that sound only
- `decodeAudioData()` fails for a sound → same as above, other sounds still work
- `source.start()` throws → caught silently, `_isPlaying` reset to `false`

---

### 3. Hook Layer — `hooks/use-timer-alarm.ts`
**Framework**: Unit tests with mocked `AudioManager` (verify calls, don't test real audio) and mocked `useTimerStore.subscribe`

#### Happy Path
- On mount, calls `audioManager.init()`
- Subscribes to `state.isRunning` → calls `audioManager.startKeepAlive()` when `true`, `audioManager.stopKeepAlive()` when `false`
- Subscribes to `state.timerJustCompleted` → calls `audioManager.play()` with current `alarmSound` when `justCompleted` is `true`
- After calling `play()`, resets `timerJustCompleted` to `false` in the store
- On unmount, unsubscribes from both subscriptions

#### Guard Clauses
- When `timerJustCompleted` is `false`, no `play()` call is made
- When `timerJustCompleted` is `true` but `audioManager.getIsPlaying()` returns `true`, `play()` is skipped (no overlap)
- When `timerJustCompleted` is `true` and `alarmSound` is `"none"`, `audioManager.play("none")` is called (guard is inside `play()`)

#### Cleanup
- On unmount, `stopKeepAlive()` is called
- On unmount, both subscription `unsub()` functions are called

---

### 4. Component Layer — `components/dashboard/timer-alarm-picker.tsx`
**Framework**: Component tests with `@testing-library/react` and mocked `audioManager`

#### Happy Path
- Renders all 5 sound options: None, Bell, Chime, Digital, Lo-fi
- Currently selected option is visually highlighted (matcha border-left class)
- Clicking an option fires `onAlarmSoundChange` with the correct value
- Preview button is visible for every non-"None" option
- Preview button shows `Volume2` icon when not previewing, `VolumeX` icon when previewing
- Preview calls `audioManager.preview(sound, 3000)` and sets previewing state
- Preview toggle: clicking play then stop works (play → stop → play)

#### Edge Cases
- "None" option has no preview button
- When `previewing === sound`, clicking the preview button calls `audioManager.stop()` (toggle behavior)
- On mount, `audioManager.init()` is called
- On unmount, `audioManager.stop()` is called

#### Mocking
- Mock `audioManager` singleton: `vi.spyOn(audioManager, 'init')`, `vi.spyOn(audioManager, 'preview')`, `vi.spyOn(audioManager, 'stop')`

---

### 5. Component Integration — `components/dashboard/Timer-card.tsx`
**Framework**: Component/render tests with mocked child hooks and components

#### Happy Path
- Renders without throwing an error
- Mounts `useTimerAlarm()` alongside `useTimerLogic()` (verify both are called)
- Passes `alarmSound` and `setAlarmSound` props to `TimerAlarmPicker`
- `TimerAlarmPicker` is rendered inside the settings dialog content

#### Edge Cases
- Timer card renders loading skeleton when `loaded` is `false`
- Timer card renders full UI after `loaded` becomes `true`

---

## Mocking Strategy

### localStorage
Mock via `vi.spyOn(Storage.prototype, 'getItem')` / `vi.spyOn(Storage.prototype, 'setItem')` or simply call `localStorage.setItem()`/`localStorage.clear()` directly (Vitest provides a fake `localStorage` in `jsdom` environment). For initial state tests, use `vi.resetModules()` + dynamic `import()` to force re-evaluation of the store module.

### Web Audio API (AudioManager tests)
Mock the Web Audio API constructors globally:

```typescript
const mockGainNode = {
  gain: { value: 0 },
  connect: vi.fn().mockReturnThis(),
};

const mockSource = {
  buffer: null,
  loop: false,
  connect: vi.fn(() => mockGainNode),
  start: vi.fn(),
  stop: vi.fn(),
  onended: null as (() => void) | null,
};

const mockAudioContext = {
  state: "running",
  sampleRate: 44100,
  createBuffer: vi.fn(() => ({
    getChannelData: vi.fn(() => new Float32Array(1)),
    duration: 1,
  })),
  createBufferSource: vi.fn(() => ({ ...mockSource })),
  createGain: vi.fn(() => ({ ...mockGainNode })),
  resume: vi.fn().mockResolvedValue(undefined),
  destination: {},
  onstatechange: null as (() => void) | null,
};

vi.stubGlobal("AudioContext", vi.fn(() => mockAudioContext));
vi.stubGlobal("AudioBufferSourceNode", vi.fn(() => mockSource));
```

To simulate a suspended context, override `mockAudioContext.state`:

```typescript
mockAudioContext.state = "suspended";
```

### AudioManager singleton (Hook & Component tests)
For hook and component tests, do not test real Web Audio API internals. Instead, spy on the imported singleton:

```typescript
import { audioManager } from "@/lib/audio-manager";

vi.spyOn(audioManager, "init");
vi.spyOn(audioManager, "play");
vi.spyOn(audioManager, "startKeepAlive");
vi.spyOn(audioManager, "stopKeepAlive");
vi.spyOn(audioManager, "getIsPlaying").mockReturnValue(false);
```

### Zustand Store
For hook tests, mock `useTimerStore.subscribe` directly to invoke the callback with controlled values. For component tests, mock `@/store/timer-store` to return static values, or use `useTimerStore.setState()` to set up desired state.

### Child Components / UI Library
For `Timer-card.tsx` tests, mock heavy dependencies:
- `recharts` components (RadialBarChart, RadialBar, PolarAngleAxis)
- `lucide-react` icons
- `@/hooks/useResponsive`
- `sonner` toast
- `@tanstack/react-query` useQueryClient

---

## Acceptance Criteria Coverage

| AC # | Description | Test Location |
|------|------------|---------------|
| 1 | `alarmSound` field in `TimerState` and `ActiveSession` | `timer-store.test.ts` — type shape + state structure |
| 2 | `setAlarmSound` action persists to `localStorage` | `timer-store.test.ts` — action updates state + calls saveAlarmSound |
| 3 | Alarm plays on timer completion | `use-timer-alarm.test.ts` — `timerJustCompleted` subscription fires `play()` |
| 4 | `alarmSound === "none"` → no audio | `audio-manager.test.ts` — `play("none")` returns early |
| 5 | No overlapping audio | `use-timer-alarm.test.ts` — `getIsPlaying()` guard blocks re-entry |
| 6 | Settings dialog shows 4 sounds + "None" | `timer-alarm-picker.test.tsx` — renders all 5 options |
| 7 | Preview button plays 3s via `audioManager.preview` | `timer-alarm-picker.test.tsx` — preview delegates to AudioManager |
| 8 | Selecting sound updates store + localStorage | `timer-store.test.ts` + `timer-alarm-picker.test.tsx` — onChange fires appropriately |
| 9 | Page refresh restores from localStorage | `timer-store.test.ts` — initial state from `loadAlarmSound()` |
| 10 | Crash recovery preserves `alarmSound` | `timer-store.test.ts` — `restoreSession()` applies saved alarmSound |
| 11 | Uses Web Audio API (`AudioContext` + `AudioBufferSourceNode`) | `audio-manager.test.ts` — constructs AudioContext, creates BufferSource |
| 12 | Audio files served from `/audio/<name>_alarm.mp3` | `audio-manager.test.ts` — `AUDIO_FILES` paths match pattern |
| 13 | kebab-case + named exports | (lint/typecheck) |
| 14 | No new dependencies | (build/package.json check) |
| 15 | Silent keepalive loop keeps context alive during timer | `audio-manager.test.ts` — `startKeepAlive()` creates looping source, `stopKeepAlive()` stops it |
| 16 | `onstatechange` re-registers unlock on suspension | `audio-manager.test.ts` — statechange triggers `registerUnlockHandler()` |
| 17 | `play()` queues sound and resumes when suspended | `audio-manager.test.ts` — suspended context → queue + resume attempt |
| 18 | Gesture handler drains queued sound on next interaction | `audio-manager.test.ts` — pointerdown fires → `playInternal()` called |
| 19 | `isRunning` subscription starts/stops keepalive | `use-timer-alarm.test.ts` — subscribe to `isRunning` triggers keepalive methods |

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
