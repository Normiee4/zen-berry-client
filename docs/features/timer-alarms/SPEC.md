# Feature: Timer Alarms

- Type: new
- Status: new
- Created: 2026-06-22
- Updated: 2026-06-22

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
- [ ] Audio playback uses the `HTMLAudioElement` API; no new external audio libraries are added
- [ ] Audio files are served from `/audio/<name>_alarm.mp3` via Next.js public directory
- [ ] All new/modified files follow kebab-case naming and use named exports (except `page.tsx`)
- [ ] No new dependencies beyond existing ones

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

### 3. New Hook: `hooks/use-timer-alarm.ts`

Purpose: React-free subscription to the timer store for alarm playback. Uses store's `subscribe` method directly (not inside a React component render cycle, to avoid state-flush timing issues).

```typescript
import { useTimerStore, type AlarmSound } from "@/store/timer-store";

const AUDIO_FILES: Record<Exclude<AlarmSound, "none">, string> = {
  bell: "/audio/bell_alarm.mp3",
  chime: "/audio/chime_alarm.mp3",
  digital: "/audio/digital_alarm.mp3",
  lofi: "/audio/lofi_alarm.mp3",
};

const ALARM_DURATION_MS = 4000; // 4 seconds
let isPlaying = false;
let currentAudio: HTMLAudioElement | null = null;

function playAlarm(sound: AlarmSound) {
  if (sound === "none" || isPlaying) return;

  const src = AUDIO_FILES[sound];
  if (!src) return;

  isPlaying = true;
  const audio = new Audio(src);
  currentAudio = audio;
  audio.volume = 0.5;
  audio.play().catch(() => {
    // Auto-play may fail (browser policy) — fail silently
    isPlaying = false;
    currentAudio = null;
  });

  setTimeout(() => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    isPlaying = false;
  }, ALARM_DURATION_MS);
}

export function useTimerAlarm() {
  // Subscribe to store changes — fires when timer completes
  React.useEffect(() => {
    const unsub = useTimerStore.subscribe(
      (state) => ({ timeLeft: state.timeLeft, isRunning: state.isRunning, alarmSound: state.alarmSound }),
      ({ timeLeft, isRunning, alarmSound }) => {
        if (timeLeft <= 0 && !isRunning && alarmSound !== "none") {
          playAlarm(alarmSound);
        }
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

### 4. Component Changes — Sound Picker

#### 4.1 New component: `components/dashboard/timer-alarm-picker.tsx`

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

#### 4.2 Timer-card.tsx modifications

- Import `useTimerStore` directly for `alarmSound` and `setAlarmSound` (or add them to `useTimer` hook)
- Add `<TimerAlarmPicker>` inside the settings dialog, below the presets section and above the "Create New Preset" section
- Mount `useTimerAlarm()` alongside `useTimerLogic()`

#### 4.3 `useTimer` hook update

Expose `alarmSound` and `setAlarmSound` from the hook so the component can access them:

```typescript
// In hooks/useTimer.ts — add to returned object:
alarmSound: useTimerStore((s) => s.alarmSound),
setAlarmSound: useTimerStore((s) => s.setAlarmSound),
```

### 5. Audio Preview Functionality

The preview button in the picker creates a temporary `HTMLAudioElement`, plays the file for 3 seconds, then stops. If the user presses play on a different sound while one is previewing, stop the current preview first.

Implementation lives inside `components/dashboard/timer-alarm-picker.tsx`:

```typescript
const [previewing, setPreviewing] = useState<AlarmSound | null>(null);
const previewRef = useRef<HTMLAudioElement | null>(null);

const handlePreview = (sound: Exclude<AlarmSound, "none">) => {
  // Stop any current preview
  if (previewRef.current) {
    previewRef.current.pause();
    previewRef.current.currentTime = 0;
  }
  if (previewing === sound) {
    setPreviewing(null);
    return;
  }
  const audio = new Audio(AUDIO_FILES[sound]);
  audio.volume = 0.3;
  previewRef.current = audio;
  audio.play();
  setPreviewing(sound);
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
    if (previewRef.current === audio) {
      previewRef.current = null;
      setPreviewing(null);
    }
  }, 3000);
};
```

### 6. File Structure

#### Modified files:
| File | Change |
|------|--------|
| `store/timer-store.ts` | Add `AlarmSound` type, `alarmSound` state field, `setAlarmSound` action, localStorage helpers; update `ActiveSession`; update `saveActiveSession`/`restoreSession` calls |
| `hooks/useTimer.ts` | Re-export `alarmSound` and `setAlarmSound` |
| `components/dashboard/Timer-card.tsx` | Import and mount `useTimerAlarm()`, import `<TimerAlarmPicker>`, render it in settings dialog |

#### New files:
| File | Purpose |
|------|---------|
| `hooks/use-timer-alarm.ts` | Subscribe to store for timer completion → playback logic |
| `components/dashboard/timer-alarm-picker.tsx` | Sound picker UI with preview buttons |

### 7. Data Flow

```
User selects "Chime" in settings dialog
  → setAlarmSound("chime")
    → set({ alarmSound: "chime" })
    → saveAlarmSound("chime")  // localStorage

Timer counts down (via useTimerLogic → tick())
  → timeLeft reaches 0, isRunning flips to false
  → use-timer-alarm.ts subscription fires
    → alarmSound !== "none" → playAlarm("chime")
      → new Audio("/audio/chime_alarm.mp3").play()
      → setTimeout(4000ms) → audio.pause()

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
- `HTMLAudioElement.play()` returns a promise that rejects if the browser blocks autoplay for background tabs. The `catch()` handler swallows this silently — no error surface
- **Notification API fallback is deliberately out of scope** per user decision

### Multiple alarm fires
- Guarded by the `isPlaying` module-level flag in `use-timer-alarm.ts`
- If a second timer completes while an alarm is still playing, `playAlarm` returns early
- The subscription fires once because the transition (`isRunning` → `false`, `timeLeft` → `0`) is a single event — rapid toggling could re-trigger but the flag prevents overlap

### "None" selected
- `playAlarm("none")` returns early at the first guard clause
- No audio object is created, no timeout is set
- This is the default state for all users

### Crash recovery
- `ActiveSession` interface now includes `alarmSound`
- `saveActiveSession()` serializes the current `alarmSound` value
- `restoreSession()` reads and applies `alarmSound` from the saved session
- If the saved session has no `alarmSound` field (migration from old format), it defaults to `"none"` via the fallback in `loadActiveSession()` or a type guard in `restoreSession()`

### Audio file missing or fails to load
- `audio.play()` returns a rejected promise if the file fails to load (404, network error). The `.catch()` handler swallows this — no error toast, no console noise beyond what the browser logs
- The `isPlaying` flag is reset inside the `.catch()` to avoid getting stuck

## Open Questions

- None — all design decisions are settled above.

## Future Considerations (explicitly out of scope for this iteration)

- Custom sound upload
- Volume slider
- Notification-API-based fallback for background tabs
- Server-side alarm sound preference persistence
