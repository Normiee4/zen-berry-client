# Test Spec: Timer Alarms

## Overview
This document describes the test strategy for the Timer Alarms feature. The feature adds configurable alarm sounds that play when a focus or rest timer completes. It consists of store extensions (alarm sound type + state + persistence), a subscription hook for playback, and a UI picker component inside the Timer Settings dialog.

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

### 2. Hook Layer — `hooks/use-timer-alarm.ts`
**Framework**: Unit tests with mocked store subscription and `HTMLAudioElement`

#### Happy Path
- Subscribes to `useTimerStore` with selector `{ timeLeft, isRunning, alarmSound }`
- When `timeLeft <= 0`, `isRunning === false`, and `alarmSound !== "none"`, creates an `HTMLAudioElement` and calls `.play()`
- Audio volume is set to `0.5`
- After `ALARM_DURATION_MS` (4000ms), the audio is paused and `currentTime` reset to 0
- `isPlayingRef` guard is set to `true` during playback and `false` after timeout

#### Edge Cases
- When `alarmSound === "none"`, no audio is created regardless of timer state
- When `isRunning === true`, no audio is created even if `timeLeft <= 0`
- When `timeLeft > 0`, no audio is created
- If a second timer completion fires while alarm is playing (`isPlayingRef.current === true`), playback is skipped (no overlap)
- `audio.play()` promise rejection (browser autoplay policy) — `isPlayingRef` is reset, no error surfaces
- `AUDIO_FILES[alarmSound]` lookup returns `undefined` (theoretical, shouldn't happen) — guard returns early

#### Error Scenarios
- `new Audio(src)` fails or `play()` rejects — caught silently, `isPlayingRef` and `currentAudioRef` are cleaned up
- Cleanup on unmount: subscription is unsubscribed via returned `unsub()` function

---

### 3. Component Layer — `components/dashboard/timer-alarm-picker.tsx`
**Framework**: Component tests with `@testing-library/react` and mocked `HTMLAudioElement`

#### Happy Path
- Renders all 5 sound options: None, Bell, Chime, Digital, Lo-fi
- Currently selected option is visually highlighted (matcha border-left class)
- Clicking an option fires `onAlarmSoundChange` with the correct value
- Preview button is visible for every non-"None" option
- Preview button shows `Volume2` icon when not previewing, `VolumeX` icon when previewing
- Preview plays the audio file for 3 seconds then stops automatically
- Preview toggle: clicking play then stop works (play → stop → play)
- Clicking a different sound while previewing stops the current preview and starts the new one

#### Edge Cases
- "None" option has no preview button
- When `previewing === sound`, clicking the preview button stops playback (toggle behavior)
- Audio `play()` promise rejects (browser policy) — `previewing` state resets to `null`

#### Error Scenarios
- Missing audio file URL → `new Audio(src)` may still create an element, but `play()` rejects — caught in `.catch()`
- Rapid clicking of preview buttons is handled (previous timeout cleared, previous audio paused)

---

### 4. Component Integration — `components/dashboard/Timer-card.tsx`
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

### HTMLAudioElement
Mock the `Audio` constructor globally:
```ts
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  volume: 0,
  currentTime: 0,
};
vi.stubGlobal('Audio', vi.fn(() => mockAudio));
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
| 3 | Alarm plays 3–5s on timer completion | `use-timer-alarm.test.ts` — subscription fires playback + timeout clears |
| 4 | `alarmSound === "none"` → no audio | `use-timer-alarm.test.ts` — guard returns early |
| 5 | No overlapping audio | `use-timer-alarm.test.ts` — `isPlayingRef` guard blocks re-entry |
| 6 | Settings dialog shows 4 sounds + "None" | `timer-alarm-picker.test.tsx` — renders all 5 options |
| 7 | Preview button plays 3s, independent of timer | `timer-alarm-picker.test.tsx` — preview Audio + 3s timeout |
| 8 | Selecting sound updates store + localStorage | `timer-store.test.ts` + `timer-alarm-picker.test.tsx` — onChange fires appropriately |
| 9 | Page refresh restores from localStorage | `timer-store.test.ts` — initial state from `loadAlarmSound()` |
| 10 | Crash recovery preserves `alarmSound` | `timer-store.test.ts` — `restoreSession()` applies saved alarmSound |
| 11 | Uses `HTMLAudioElement` API | `use-timer-alarm.test.ts` — `new Audio(src)` is called |
| 12 | Audio files served from `/audio/<name>_alarm.mp3` | `use-timer-alarm.test.ts` — `AUDIO_FILES` paths match pattern |
| 13 | kebab-case + named exports | (lint/typecheck) |
| 14 | No new dependencies | (build/package.json check) |

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
