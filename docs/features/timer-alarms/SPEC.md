# Feature: Timer Alarms

- Type: new
- Status: updated
- Created: 2026-06-22
- Updated: 2026-07-09
- Feature version: 2.0.0
  - 1.0.0 (2026-06-22) — initial alarm sound picker + `HTMLAudioElement` playback
  - 2.0.0 (2026-06-25) — migrated to Web Audio API (`AudioContext` + `AudioBufferSourceNode`), `timerJustCompleted` subscription, shared `AudioManager` singleton
  - 2.1.0 (2026-07-09) — silent keepalive loop, `onstatechange` re-registration, `ctx.resume()` fallback, gesture-queue recovery

## Problem Statement

When a focus or rest timer cycle completes, there is no audible feedback. Users who are not looking at the screen (e.g., working in split-screen on desktop/iPad) may miss the transition. Adding configurable alarm sounds solves this without requiring visual attention, while keeping the experience optional and non-intrusive.

## Requirements

- Play an alarm sound for 3–5 seconds when a focus or rest timer reaches 0
- Provide 4 preset alarm sounds: bell, chime, digital, lofi
- "None" option to disable alarms entirely
- Alarm selection is saved per-session via `localStorage` (persists across page refreshes; no DB/API involved)
- Audio files already exist at `public/audio/bell_alarm.mp3`, `public/audio/chime_alarm.mp3`, `public/audio/digital_alarm.mp3`, `public/audio/lofi_alarm.mp3`
- Alarm playback is controlled programmatically — audio is truncated at ~3–5 seconds
- Sound picker UI lives inside the existing Timer Settings dialog
- Include a preview (play) button next to each sound option so users can hear before selecting
- Desktop + iPad split-screen focus is the primary use case; mobile/tablet full-switch is out of scope
- Guard against multiple overlapping alarm fires (e.g., rapid tab switches) with an `isPlaying` flag
- Active session crash recovery must preserve the selected alarm sound
- On iOS Safari (especially iPad split-screen), the `AudioContext` can be suspended when the tab is inactive; the system must keep the context alive during the timer via an inaudible silent loop
- Three-layer defense for iOS AudioContext suspension: silent keepalive loop → programmatic `ctx.resume()` → gesture-queued playback

## Acceptance Criteria

- [ ] A new `alarmSound` field (`"none" | "bell" | "chime" | "digital" | "lofi"` with default `"none"`) exists in `TimerState` and `ActiveSession`
- [ ] A `setAlarmSound(sound: AlarmSound)` action exists in the timer store and persists the value to `localStorage`
- [ ] When the timer completes (in `tick()`), the selected alarm plays for 3–5 seconds then stops automatically
- [ ] When `alarmSound` is `"none"`, no audio plays
- [ ] If a second timer completion fires while an alarm is already playing, play is skipped (no overlapping audio)
- [ ] The Timer Settings dialog shows a "Timer Alarm" section with radio buttons or a selectable list for the 4 sounds + "None"
- [ ] Each sound option has a preview play button (e.g., a small play icon) that plays the sound for 3 seconds independent of the timer
- [ ] Selecting a sound immediately updates the store and persists to `localStorage`
- [ ] After a page refresh, the previously selected alarm sound is restored from `localStorage`
- [ ] After a crash/page-reload with an active session (restore flow), the saved `alarmSound` from `ActiveSession` is restored
- [ ] Audio playback uses the **Web Audio API** (`AudioContext` + `AudioBufferSourceNode`); no new external audio libraries are added
- [ ] Audio context is lazily initialized on component mount and resumed on first user gesture (`pointerdown`/`keydown`) to comply with iOS Safari autoplay policy
- [ ] Audio files are pre-fetched and decoded into `AudioBuffer` objects on init for instant playback
- [ ] Audio files are served from `/audio/<name>_alarm.mp3` via Next.js public directory
- [ ] All new/modified files follow kebab-case naming and use named exports (except `page.tsx`)
- [ ] No new dependencies beyond existing ones
- [ ] An inaudible silent loop (`startKeepAlive()` / `stopKeepAlive()`) keeps the `AudioContext` in `"running"` state while the timer is active, preventing iOS Safari from suspending it during split-screen usage
- [ ] `AudioContext.onstatechange` handler re-registers the gesture unlock listener whenever the context transitions back to `"suspended"`
- [ ] `play()` checks `ctx.state` and attempts `ctx.resume()` if suspended; if resume fails, the sound is queued for playback on the next user gesture

## Technical Design

### 1. Type Definition

Add a shared type for alarm sounds in the timer store:

```typescript
export type AlarmSound = "none" | "bell" | "chime" | "digital" | "lofi";
```

### 2. Store Changes (`store/timer-store.ts`)

#### 2.1 State additions

```typescript
// In TimerState:
alarmSound: AlarmSound;

// In ActiveSession interface (for crash recovery):
alarmSound: AlarmSound;
```

#### 2.2 Initial state

```typescript
alarmSound: "none", // default — no alarm
```

#### 2.3 localStorage persistence

Add a new storage key:
```typescript
const ALARM_SOUND_KEY = "zenberry_timer_alarm_sound";
```

Add helper functions:
- `loadAlarmSound(): AlarmSound` — reads from `localStorage`, returns `"none"` on error/missing
- `saveAlarmSound(sound: AlarmSound)` — writes to `localStorage`

#### 2.4 New action: `setAlarmSound`

```typescript
setAlarmSound: (sound: AlarmSound) => {
  saveAlarmSound(sound);
  return set({ alarmSound: sound });
}
```

#### 2.5 Tick changes (`tick()` action)

Inside the `tick()` action, when `newTimeLeft <= 0` (timer completion), add a side-effect call to play the alarm. Since Zustand actions should be pure, the actual audio playback should happen **outside** the store — either in `useTimerLogic` or in a new `useTimerAlarm` hook.

**Design decision**: Keep audio playback out of the store. The `tick()` action will not trigger audio directly. Instead, a new hook (`use-timer-alarm.ts`) will subscribe to `timeLeft` changes and play the alarm when it crosses from `> 0` to `=== 0` while `isRunning` transitions to `false`.

Alternatively: fire a callback from `tick()` via Zustand's `subscribeWithSelector` middleware. Subscribe to `timeLeft` and detect transition to 0.

**Preferred approach**: Use Zustand's built-in `subscribeWithSelector` (already wired in the store) to watch for the timer reaching 0. This keeps concerns cleanly separated.

```typescript
// In use-timer-alarm.ts:
useTimerStore.subscribe(
  (state) => ({ timeLeft: state.timeLeft, isRunning: state.isRunning, alarmSound: state.alarmSound }),
  ({ timeLeft, isRunning, alarmSound }) => {
    if (timeLeft <= 0 && !isRunning && alarmSound !== "none" && !isPlaying) {
      playAlarm(alarmSound);
    }
  },
  { equalityFn: shallow }
);
```

#### 2.6 `restoreSession` updates

Include `alarmSound` in the restored state:
```typescript
// In restoreSession(), after deserializing saved session:
if (saved.alarmSound) {
  set({ alarmSound: saved.alarmSound as AlarmSound });
}
```

#### 2.7 `saveActiveSession` updates

Include `alarmSound` in the serialized session:
```typescript
saveActiveSession({
  ...existingFields,
  alarmSound: get().alarmSound,
});
```

Also update `loadActiveSession` and `saveActiveSession` in `start()`, `pause()`, `toggle()`, `reset()` paths that call them.

### 3. Shared Audio Manager: `lib/audio-manager.ts`

A singleton class that wraps the Web Audio API. Responsible for:
- Lazily creating an `AudioContext` on first init
- Pre-fetching and decoding all 4 MP3 files into `AudioBuffer` objects
- Resuming the `AudioContext` on first user gesture (iOS Safari requirement)
- Playing alarm sounds and previews via `AudioBufferSourceNode`
- Keeping the `AudioContext` alive during the timer via a silent audio loop (iOS split-screen)
- Re-registering the gesture unlock handler whenever the context is re-suspended (`onstatechange`)
- Queuing sound playback for the next user gesture if `ctx.resume()` fails

```typescript
import type { AlarmSound } from "@/store/timer-store";

class AudioManager {
  private ctx: AudioContext | null = null;
  private buffers = new Map<string, AudioBuffer>();
  private currentSource: AudioBufferSourceNode | null = null;
  private currentStopTimeout: ReturnType<typeof setTimeout> | null = null;
  private _isPlaying = false;
  private initPromise: Promise<void> | null = null;
  private _keepAliveSource: AudioBufferSourceNode | null = null;
  private queuedSound: AlarmSound | null = null;

  async init(): Promise<void> {
    // Creates AudioContext, fetches + decodes all MP3s
    // Sets up onstatechange → re-registers unlock on re-suspension
    // Registers pointerdown/keydown listeners if initially suspended
  }

  private registerUnlockHandler(): void {
    // Registers pointerdown/keydown listener (once)
    // On trigger: resumes ctx + plays queuedSound if any
  }

  startKeepAlive(): void {
    // Creates a 1-sample silent AudioBufferSourceNode with loop: true
    // Keeps AudioContext in "running" state during timer
    // No-op if keepalive already active
  }

  stopKeepAlive(): void {
    // Stops and cleans up the silent loop
  }

  play(sound: AlarmSound): void {
    // Guards: returns early if "none", already playing, or buffer not ready
    // If ctx.state === "suspended":
    //   1. Queue the sound
    //   2. Try ctx.resume() programmatically (works on iOS 16+)
    //   3. If resume succeeds → play immediately, clear queue
    //   4. If resume fails → stays queued for gesture handler
    // If ctx.state === "running": play immediately
  }

  private playInternal(sound: AlarmSound): void {
    // Creates AudioBufferSourceNode at 0.5 volume
    // Auto-stops after per-sound duration
    // Handles onended cleanup
  }

  preview(sound: AlarmSound, durationMs = 3000): void {
    // Stops current playback, plays sound at 0.3 volume for duration
  }

  stop(): void {
    // Stops current alarm/preview playback (does NOT stop keepalive)
  }

  getIsPlaying(): boolean {
    return this._isPlaying;
  }
}

export const audioManager = new AudioManager();
```

### 4. Updated Hook: `hooks/use-timer-alarm.ts`

Purpose: React-free subscription to the timer store for alarm playback. Delegates audio to the shared `AudioManager`.

```typescript
import { useEffect } from "react";
import { useTimerStore } from "@/store/timer-store";
import { audioManager } from "@/lib/audio-manager";

export function useTimerAlarm() {
  useEffect(() => {
    audioManager.init();

    return () => {
      audioManager.stopKeepAlive();
    };
  }, []);

  // Keep AudioContext alive during timer (iOS split-screen defense)
  useEffect(() => {
    const unsub = useTimerStore.subscribe(
      (state) => state.isRunning,
      (isRunning) => {
        if (isRunning) {
          audioManager.startKeepAlive();
        } else {
          audioManager.stopKeepAlive();
        }
      },
    );
    return () => unsub();
  }, []);

  // Play alarm when timer completes
  useEffect(() => {
    const unsub = useTimerStore.subscribe(
      (state) => state.timerJustCompleted,
      (justCompleted) => {
        if (!justCompleted || audioManager.getIsPlaying()) return;

        audioManager.play(useTimerStore.getState().alarmSound);
        useTimerStore.setState({ timerJustCompleted: false });
      },
    );
    return () => unsub();
  }, []);
}
```

#### Integration in component tree

Mount this hook once at the `TimerCard` level alongside `useTimerLogic`:

```typescript
// In Timer-card.tsx:
useTimerLogic();
useTimerAlarm(); // <-- new line
```

### 5. Component Changes — Sound Picker

#### 5.1 New component: `components/dashboard/timer-alarm-picker.tsx`

A sound picker section rendered inside the Timer Settings dialog. Contains:

- A section heading: "Timer Alarm"
- A list of 5 options (none, bell, chime, digital, lofi), each as a selectable row
- Each row shows:
  - A radio-style indicator (selected/unselected circle)
  - The sound name (human-readable: "None", "Bell", "Chime", "Digital", "Lo-fi")
  - A small preview play button (play icon) next to each non-none option
- Preview plays the audio for 3 seconds; stops any currently previewing sound first
- Selecting a sound calls `setAlarmSound(sound)` and closes any preview

```typescript
interface TimerAlarmPickerProps {
  alarmSound: AlarmSound;
  onAlarmSoundChange: (sound: AlarmSound) => void;
}
```

#### 5.2 Timer-card.tsx modifications

- Import `useTimerStore` directly for `alarmSound` and `setAlarmSound` (or add them to `useTimer` hook)
- Add `<TimerAlarmPicker>` inside the settings dialog, below the presets section and above the "Create New Preset" section
- Mount `useTimerAlarm()` alongside `useTimerLogic()`

#### 5.3 `useTimer` hook update

Expose `alarmSound` and `setAlarmSound` from the hook so the component can access them:

```typescript
// In hooks/useTimer.ts — add to returned object:
alarmSound: useTimerStore((s) => s.alarmSound),
setAlarmSound: useTimerStore((s) => s.setAlarmSound),
```

### 6. Audio Preview Functionality

The preview button in the picker delegates to the shared `AudioManager`. Preview plays the sound for 3 seconds at 0.3 volume. Clicking the same button toggles preview off. Clicking a different button stops the current preview and starts the new one.

Implementation lives inside `components/dashboard/timer-alarm-picker.tsx`:

```typescript
const [previewing, setPreviewing] = useState<AlarmSound | null>(null);

const handlePreview = (sound: Exclude<AlarmSound, "none">) => {
  if (previewing === sound) {
    audioManager.stop();
    setPreviewing(null);
    return;
  }
  audioManager.preview(sound, 3000);
  setPreviewing(sound);
};
```

### 7. File Structure

#### Modified files:
| File | Change |
|------|--------|
| `store/timer-store.ts` | Add `AlarmSound` type, `alarmSound` state field, `setAlarmSound` action, localStorage helpers; update `ActiveSession`; update `saveActiveSession`/`restoreSession` calls |
| `hooks/useTimer.ts` | Re-export `alarmSound` and `setAlarmSound` |
| `components/dashboard/Timer-card.tsx` | Import and mount `useTimerAlarm()`, import `<TimerAlarmPicker>`, render it in settings dialog |
| `hooks/use-timer-alarm.ts` | Subscribe to store for timer completion → delegates to `AudioManager` |
| `components/dashboard/timer-alarm-picker.tsx` | Sound picker UI with preview → delegates to `AudioManager` |

#### New files:
| File | Purpose |
|------|---------|
| `lib/audio-manager.ts` | Shared `AudioContext` singleton, gesture unlock, buffer cache, playback/preview methods |

### 8. Data Flow

```
Page load:
  → useTimerAlarm / TimerAlarmPicker mount
    → audioManager.init()
      → new AudioContext() created (suspended on iOS)
      → fetch + decodeAudioData for all 4 MP3s → cached as AudioBuffers
      → onstatechange handler set → re-registers unlock on re-suspension
      → if suspended → registerUnlockHandler() → pointerdown/keydown listener
        → first user gesture → ctx.resume() → audio system unlocked

User selects "Chime" in settings dialog
  → setAlarmSound("chime")
    → set({ alarmSound: "chime" })
    → saveAlarmSound("chime")  // localStorage

User starts timer
  → isRunning = true
  → use-timer-alarm.ts isRunning subscription fires
    → audioManager.startKeepAlive()
      → 1-sample silent buffer, looped, connected to destination
      → AudioContext stays in "running" state

Timer counts down (via useTimerLogic → tick())
  → timeLeft reaches 0, timerJustCompleted = true, isRunning = false
  → isRunning subscription fires → audioManager.stopKeepAlive()
  → timerJustCompleted subscription fires → audioManager.play("chime")
    → ctx.state is "running" (keepalive prevented suspension)
    → AudioBufferSourceNode created from cached buffer
    → source.connect(gain).connect(ctx.destination)
    → source.start()
    → setTimeout(6000ms) → source.stop()

[iOS re-suspension edge case — keepalive bypassed]
  → ctx.state === "suspended" in play()
  → queuedSound = "chime"
  → ctx.resume() attempted:
    → succeeds (iOS 16+) → playInternal() immediately → alarm sounds  ✅
    → fails (iOS < 16) → stays queued → next gesture → alarm sounds ✅

User taps preview button for "Bell"
  → audioManager.preview("bell", 3000)
    → audioManager.stop()  // stop any current playback
    → AudioBufferSourceNode created, gain = 0.3
    → source.start()
    → setTimeout(3000ms) → source.stop()

Page refresh:
  → store initialization calls loadAlarmSound()
    → localStorage.getItem("zenberry_timer_alarm_sound")
    → initial state: alarmSound: "chime"

Page refresh with active session:
  → restoreSession() runs
    → loadActiveSession() returns { ..., alarmSound: "chime" }
    → set({ alarmSound: "chime" })
```

## Edge Cases

### Tab is backgrounded
- The timer uses timestamp-based tracking (`startTimestamp` + `Date.now()`), so `tick()` recovers accurate elapsed time even if the `setInterval` is throttled
- Audio playback via `AudioContext` is not affected by background-tab autoplay policies that block `HTMLAudioElement` — the `AudioContext` is already resumed by user gesture and remains valid
- **Notification API fallback is deliberately out of scope** per user decision

### Multiple alarm fires
- Guarded by `audioManager.getIsPlaying()` in `use-timer-alarm.ts`
- If a second timer completes while an alarm is still playing, `audioManager.play()` returns early
- The subscription fires once because `timerJustCompleted` is a single boolean toggle; the subscription handler immediately resets it to `false`

### "None" selected
- `audioManager.play("none")` returns early at the first guard clause
- No `AudioBufferSourceNode` is created, no playback occurs
- This is the default state for all users

### iOS / iPad autoplay restrictions & split-screen recovery

Three-layer defense against `AudioContext` suspension (in order of reliability):

**Layer 1 — Silent keepalive loop (primary)**
- While the timer is running (`isRunning === true`), `startKeepAlive()` creates a 1-sample silent `AudioBufferSourceNode` with `loop: true` connected to `ctx.destination`
- This keeps the `AudioContext` in `"running"` state, preventing iOS Safari from suspending it even when the tab is in the inactive split-screen pane
- On timer completion, `stopKeepAlive()` is called (via the `isRunning` subscription firing to `false`), immediately followed by `play()` — the context is still `"running"`, so playback succeeds

**Layer 2 — Programmatic `ctx.resume()` in `play()` (secondary)**
- If the context is `"suspended"` when `play()` is called (keepalive bypassed by edge case), `play()` queues the sound via `queuedSound` and calls `ctx.resume()`
- On iOS 16+, `ctx.resume()` from a non-gesture context succeeds if the context was previously unlocked by a user gesture
- If resume succeeds → `playInternal()` fires immediately → alarm sounds

**Layer 3 — Gesture-queued fallback (tertiary)**
- If `ctx.resume()` fails (iOS < 16, or restrictive policy), the sound remains queued in `queuedSound`
- `AudioContext.onstatechange` is set in `init()`: whenever the context transitions to `"suspended"`, `registerUnlockHandler()` is called, adding fresh `pointerdown`/`keydown` listeners
- `registerUnlockHandler()`'s callback drains `queuedSound` when the gesture fires: resumes context → calls `playInternal()` → alarm sounds
- This handles the case where the user switches back to the Zen Berry tab and taps anywhere

**Unsupported browser fallback:**
- If `new AudioContext()` throws or `init()` fails, `ctx` is set to `null` and all `play()`/`preview()`/`startKeepAlive()` calls return early — no audio, no errors

### Audio buffer fetch or decode fails
- `Promise.allSettled` ensures one failed sound doesn't block others
- If a specific sound's buffer is missing, `play()`/`preview()` return early for that sound
- No error toasts, no console noise beyond browser logs

### Crash recovery
- `ActiveSession` interface now includes `alarmSound`
- `saveActiveSession()` serializes the current `alarmSound` value
- `restoreSession()` reads and applies `alarmSound` from the saved session
- If the saved session has no `alarmSound` field (migration from old format), it defaults to `"none"` via the fallback in `loadActiveSession()` or a type guard in `restoreSession()`

## Open Questions

- None — all design decisions are settled above.

## Future Considerations (explicitly out of scope for this iteration)

- Custom sound upload
- Volume slider
- Notification-API-based fallback for background tabs
- Server-side alarm sound preference persistence
