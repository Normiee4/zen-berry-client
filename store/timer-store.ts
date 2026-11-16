import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type TimerMode = "focus" | "break";

export type AlarmSound = "none" | "bell" | "chime" | "digital" | "lofi";

export interface TimerPreset {
  id: string;
  name: string;
  focusMinutes: number;
  breakMinutes: number;
  isDefault?: boolean;
}

const PRESETS_STORAGE_KEY = "zenberry_timer_presets";
const STREAK_STORAGE_KEY = "zenberry_timer_streak";
const ACTIVE_SESSION_KEY = "zenberry_active_session";
const ALARM_SOUND_KEY = "zenberry_timer_alarm_sound";
const CUMULATIVE_FOCUS_KEY = "zenberry_cumulative_focus";
const MIT_PROGRESS_KEY = "zenberry_mit_progress";

interface CumulativeFocusData {
  consecutiveFocusSeconds: number;
  snoozedUntilSeconds: number | null;
  date: string;
}

function loadCumulativeFocus(): { consecutiveFocusSeconds: number; snoozedUntilSeconds: number | null } {
  if (typeof window === "undefined") return { consecutiveFocusSeconds: 0, snoozedUntilSeconds: null };
  try {
    const stored = localStorage.getItem(CUMULATIVE_FOCUS_KEY);
    if (!stored) return { consecutiveFocusSeconds: 0, snoozedUntilSeconds: null };
    const parsed: CumulativeFocusData = JSON.parse(stored);
    if (parsed.date === getTodayDate()) {
      return {
        consecutiveFocusSeconds: parsed.consecutiveFocusSeconds ?? 0,
        snoozedUntilSeconds: parsed.snoozedUntilSeconds ?? null,
      };
    }
    return { consecutiveFocusSeconds: 0, snoozedUntilSeconds: null };
  } catch {
    return { consecutiveFocusSeconds: 0, snoozedUntilSeconds: null };
  }
}

function saveCumulativeFocus(consecutiveFocusSeconds: number, snoozedUntilSeconds: number | null) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      CUMULATIVE_FOCUS_KEY,
      JSON.stringify({
        consecutiveFocusSeconds,
        snoozedUntilSeconds,
        date: getTodayDate(),
      })
    );
  } catch {
    // ignore write failures
  }
}

interface MITProgressData {
  count: number;
  date: string;
}

function loadMITProgress(): number {
  if (typeof window === "undefined") return 0;
  try {
    const stored = localStorage.getItem(MIT_PROGRESS_KEY);
    if (!stored) return 0;
    const parsed: MITProgressData = JSON.parse(stored);
    if (parsed.date === getTodayDate()) {
      return parsed.count ?? 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

function saveMITProgress(count: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      MIT_PROGRESS_KEY,
      JSON.stringify({
        count,
        date: getTodayDate(),
      })
    );
  } catch {
    // ignore write failures
  }
}

interface ActiveSession {
  startTimestamp: number;
  initialDuration: number;
  mode: TimerMode;
  isRunning: boolean;
  activePresetId: string;
  focusTimeLeft: number;
  breakTimeLeft: number;
  alarmSound: AlarmSound;
}

function loadPresetsFromStorage(): TimerPreset[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function savePresetsToStorage(presets: TimerPreset[]) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets))
  } catch {
    // ignore write failures
  }
}

function saveStreakToStorage(currentStreak: number, pomodorosToday: number, lastPomodoroDate: string | null) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify({
      date: getTodayDate(),
      currentStreak,
      pomodorosToday,
      lastPomodoroDate: lastPomodoroDate?.slice(0, 10) ?? null,
    }))
  } catch {
    // ignore write failures
  }
}

function saveActiveSession(session: ActiveSession) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore write failures
  }
}

function loadActiveSession(): ActiveSession | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(ACTIVE_SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function clearActiveSession() {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY)
  } catch {
    // ignore write failures
  }
}

function loadAlarmSound(): AlarmSound {
  if (typeof window === "undefined") return "none";
  try {
    const stored = localStorage.getItem(ALARM_SOUND_KEY);
    const valid = ["none", "bell", "chime", "digital", "lofi"];
    return stored && valid.includes(stored) ? (stored as AlarmSound) : "none";
  } catch {
    return "none";
  }
}

function saveAlarmSound(sound: AlarmSound) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ALARM_SOUND_KEY, sound);
  } catch {
    // ignore write failures
  }
}

const sanitizeMode = (m: string): TimerMode => m === "focus" || m === "break" ? m : "focus";

type TimerState = {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  currentPreset: TimerPreset | null;

  // Timestamp-based timing (prevents tab throttling issues)
  startTimestamp: number | null;
  initialDuration: number;

  // Presets
  presets: TimerPreset[];
  activePresetId: string;

  // Mode-preserved remaining time
  focusTimeLeft: number;
  breakTimeLeft: number;
  focusWasStarted: boolean;
  breakWasStarted: boolean;

  // Streak state
  currentStreak: number;
  pomodorosToday: number;
  lastPomodoroDate: string | null;
  completedFocusCycle: boolean;
  completedBreakCycle: boolean;
  showBreakReminder: boolean;
  alarmSound: AlarmSound;
  timerJustCompleted: boolean;

  // Cumulative focus tracking (burnout prevention)
  consecutiveFocusSeconds: number;
  snoozedUntilSeconds: number | null;
  consecutiveBreakSeconds: number;
  needsBreak: boolean;

  // MIT progress tracking for Matcha Cup
  completedMITTodayCount: number;

  // Actions
  start: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  tick: () => void;
  setMode: (mode: TimerMode) => void;
  setPreset: (presetId: string) => void;
  addPreset: (preset: Omit<TimerPreset, "id"> | TimerPreset) => void;
  updatePreset: (presetId: string, updates: Partial<TimerPreset>) => void;
  deletePreset: (presetId: string) => void;
  loadPresets: (presets: TimerPreset[]) => void;
  loadStats: (stats: {
    currentStreak: number;
    pomodorosToday: number;
    lastPomodoroDate: string | null;
  }) => void;
  clearCompletedFocusCycle: () => void;
  clearCompletedBreakCycle: () => void;
  setAlarmSound: (sound: AlarmSound) => void;
  restoreSession: () => void;
  takeBreak: () => void;
  snoozeBreakReminder: (minutes?: number) => void;
  resetConsecutiveFocus: () => void;
  incrementCompletedMIT: () => void;
  decrementCompletedMIT: () => void;
  setCompletedMITTodayCount: (count: number) => void;
};

const defaultPresets: TimerPreset[] = [
  { id: "classic", name: "Classic Pomodoro", focusMinutes: 25, breakMinutes: 5, isDefault: true },
  { id: "deep", name: "Deep Work", focusMinutes: 50, breakMinutes: 10, isDefault: true },
  { id: "sprint", name: "Quick Sprint", focusMinutes: 15, breakMinutes: 3, isDefault: true },
];

const getTodayDate = () => new Date().toISOString().slice(0, 10);
const getYesterdayDate = () => new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const initialPresets = (() => {
  const stored = loadPresetsFromStorage();
  if (stored.length === 0) return defaultPresets;
  const storedIds = new Set(stored.map(p => p.id));
  const missingDefaults = defaultPresets.filter(p => !storedIds.has(p.id));
  return [...missingDefaults, ...stored];
})();

const initialCumulative = loadCumulativeFocus();
const initialMITCount = loadMITProgress();

export const useTimerStore = create<TimerState>()(
  subscribeWithSelector((set, get) => ({
    mode: "focus",
    timeLeft: 25 * 60,
    isRunning: false,
    currentPreset: initialPresets[0],
    presets: initialPresets,
    activePresetId: "classic",
    focusTimeLeft: 25 * 60,
    breakTimeLeft: 5 * 60,
    focusWasStarted: false,
    breakWasStarted: false,

    currentStreak: 0,
    pomodorosToday: 0,
    lastPomodoroDate: null,
    completedFocusCycle: false,
    completedBreakCycle: false,
    showBreakReminder: false,
    alarmSound: loadAlarmSound(),
    timerJustCompleted: false,

    // Cumulative focus & break tracking
    consecutiveFocusSeconds: initialCumulative.consecutiveFocusSeconds,
    snoozedUntilSeconds: initialCumulative.snoozedUntilSeconds,
    consecutiveBreakSeconds: 0,
    needsBreak:
      initialCumulative.consecutiveFocusSeconds >= 5400 &&
      initialCumulative.consecutiveFocusSeconds >= (initialCumulative.snoozedUntilSeconds ?? 0),

    // MIT progress
    completedMITTodayCount: initialMITCount,

    // Timestamp-based tracking
    startTimestamp: null,
    initialDuration: 25 * 60,

    start: () => {
      const { timeLeft, mode } = get();
      const now = Date.now();
      set({
        isRunning: true,
        startTimestamp: now,
        initialDuration: timeLeft,
        focusWasStarted: mode === "focus" ? true : get().focusWasStarted,
        breakWasStarted: mode === "break" ? true : get().breakWasStarted,
        timerJustCompleted: false,
      });
      const s = { ...get(), isRunning: true, startTimestamp: now, initialDuration: timeLeft };
      saveActiveSession({
        startTimestamp: now,
        initialDuration: timeLeft,
        mode: s.mode,
        isRunning: true,
        activePresetId: s.activePresetId,
        focusTimeLeft: s.focusTimeLeft,
        breakTimeLeft: s.breakTimeLeft,
        alarmSound: get().alarmSound,
      });
    },

    pause: () => set((state) => {
      if (!state.isRunning || !state.startTimestamp) {
        return { isRunning: false };
      }
      const elapsed = Math.floor((Date.now() - state.startTimestamp) / 1000);
      const remaining = Math.max(0, state.initialDuration - elapsed);
      clearActiveSession();
      return {
        isRunning: false,
        timeLeft: remaining,
        startTimestamp: null,
        timerJustCompleted: false,
      };
    }),

    toggle: () => {
      const state = get();
      if (state.isRunning) {
        const elapsed = Math.floor((Date.now() - state.startTimestamp!) / 1000);
        const remaining = Math.max(0, state.initialDuration - elapsed);
        clearActiveSession();
        set({
          isRunning: false,
          timeLeft: remaining,
          startTimestamp: null,
          timerJustCompleted: false,
        });
      } else {
        const now = Date.now();
        set({
          isRunning: true,
          startTimestamp: now,
          initialDuration: state.timeLeft,
          timerJustCompleted: false,
        });
        const updated = { ...get(), isRunning: true, startTimestamp: now, initialDuration: state.timeLeft };
        saveActiveSession({
          startTimestamp: now,
          initialDuration: state.timeLeft,
          mode: updated.mode,
          isRunning: true,
          activePresetId: updated.activePresetId,
          focusTimeLeft: updated.focusTimeLeft,
          breakTimeLeft: updated.breakTimeLeft,
          alarmSound: get().alarmSound,
        });
      }
    },

    reset: () => set((state) => {
      const focusSeconds = state.currentPreset
        ? state.currentPreset.focusMinutes * 60
        : 0;
      const breakSeconds = state.currentPreset
        ? state.currentPreset.breakMinutes * 60
        : 0;
      const totalSeconds = state.mode === "focus" ? focusSeconds : breakSeconds;
      clearActiveSession();
      return {
        timeLeft: totalSeconds,
        focusTimeLeft: focusSeconds,
        breakTimeLeft: breakSeconds,
        focusWasStarted: false,
        breakWasStarted: false,
        isRunning: false,
        completedFocusCycle: false,
        completedBreakCycle: false,
        showBreakReminder: false,
        startTimestamp: null,
        initialDuration: totalSeconds,
        timerJustCompleted: false,
      };
    }),

    tick: () => set((state) => {
      if (!state.isRunning || !state.startTimestamp) {
        return state;
      }

      const now = Date.now();
      const elapsed = Math.floor((now - state.startTimestamp) / 1000);
      const newTimeLeft = Math.max(0, state.initialDuration - elapsed);

      // Cumulative focus tracking (burnout prevention)
      let nextFocusSeconds = state.consecutiveFocusSeconds;
      let nextBreakSeconds = state.consecutiveBreakSeconds;
      let nextSnoozed = state.snoozedUntilSeconds;
      let nextNeedsBreak = state.needsBreak;

      if (state.mode === "focus") {
        nextFocusSeconds += 1;
        nextBreakSeconds = 0;
        nextNeedsBreak =
          nextFocusSeconds >= 5400 &&
          nextFocusSeconds >= (nextSnoozed ?? 0);
        saveCumulativeFocus(nextFocusSeconds, nextSnoozed);
      } else {
        nextBreakSeconds += 1;
        if (nextBreakSeconds >= 180) {
          nextFocusSeconds = 0;
          nextSnoozed = null;
          nextNeedsBreak = false;
          saveCumulativeFocus(0, null);
        }
      }

      if (newTimeLeft <= 0) {
        clearActiveSession();
        const wasFocusMode = state.mode === "focus";
        const newMode = wasFocusMode ? "break" : "focus";
        const focusSeconds = state.currentPreset
          ? state.currentPreset.focusMinutes * 60
          : 0;
        const breakSeconds = state.currentPreset
          ? state.currentPreset.breakMinutes * 60
          : 0;
        const newTotalSeconds = newMode === "focus" ? focusSeconds : breakSeconds;

        if (wasFocusMode) {
          const today = getTodayDate();
          const yesterday = getYesterdayDate();
          let streak = state.currentStreak;
          let todayCount = state.pomodorosToday;

          if ((state.lastPomodoroDate?.slice(0, 10) ?? null) === today) {
            todayCount += 1;
            streak = Math.max(1, state.currentStreak);
          } else {
            todayCount = 1;
            streak = state.lastPomodoroDate === yesterday ? Math.max(1, state.currentStreak + 1) : 1;
          }

          saveStreakToStorage(streak, todayCount, today)

          return {
            mode: newMode,
            timeLeft: newTotalSeconds,
            focusTimeLeft: focusSeconds,
            breakTimeLeft: breakSeconds,
            focusWasStarted: false,
            breakWasStarted: false,
            isRunning: false,
            currentStreak: streak,
            pomodorosToday: todayCount,
            lastPomodoroDate: today,
            completedFocusCycle: true,
            completedBreakCycle: false,
            showBreakReminder: true,
            startTimestamp: null,
            initialDuration: newTotalSeconds,
            timerJustCompleted: true,
            consecutiveFocusSeconds: nextFocusSeconds,
            consecutiveBreakSeconds: 0,
            snoozedUntilSeconds: nextSnoozed,
            needsBreak: nextNeedsBreak,
          };
        }

        return {
          mode: newMode,
          timeLeft: newTotalSeconds,
          focusTimeLeft: focusSeconds,
          breakTimeLeft: breakSeconds,
          focusWasStarted: false,
          breakWasStarted: false,
          isRunning: false,
          completedFocusCycle: false,
          completedBreakCycle: true,
          showBreakReminder: false,
          startTimestamp: null,
          initialDuration: newTotalSeconds,
          timerJustCompleted: true,
          consecutiveFocusSeconds: nextFocusSeconds,
          consecutiveBreakSeconds: nextBreakSeconds,
          snoozedUntilSeconds: nextSnoozed,
          needsBreak: nextNeedsBreak,
        };
      }

      const saveField = state.mode === "focus" ? "focusTimeLeft" : "breakTimeLeft";
      return {
        timeLeft: newTimeLeft,
        [saveField]: newTimeLeft,
        completedFocusCycle: false,
        timerJustCompleted: false,
        consecutiveFocusSeconds: nextFocusSeconds,
        consecutiveBreakSeconds: nextBreakSeconds,
        snoozedUntilSeconds: nextSnoozed,
        needsBreak: nextNeedsBreak,
      };
    }),

    setMode: (mode: TimerMode) => {
      const { currentPreset, mode: prevMode, timeLeft } = get();
      if (!currentPreset) return;

      const saveField = prevMode === "focus" ? "focusTimeLeft" : "breakTimeLeft";
      const targetFull = (mode === "focus" ? currentPreset.focusMinutes : currentPreset.breakMinutes) * 60;
      const prevWasStarted = prevMode === "focus" ? get().focusWasStarted : get().breakWasStarted;

      const newTimeLeft = prevWasStarted ? targetFull : (mode === "focus" ? get().focusTimeLeft : get().breakTimeLeft);

      set({
        [saveField]: timeLeft,
        mode,
        timeLeft: newTimeLeft,
        isRunning: false,
        completedFocusCycle: false,
        startTimestamp: null,
        initialDuration: targetFull,
        focusWasStarted: false,
        breakWasStarted: false,
        timerJustCompleted: false,
      });
    },

    setPreset: (presetId: string) => {
      const { presets, mode } = get();
      const preset = presets.find((p) => p.id === presetId);
      if (!preset) return;

      const focusSeconds = preset.focusMinutes * 60;
      const breakSeconds = preset.breakMinutes * 60;
      const newTotalSeconds = mode === "focus" ? focusSeconds : breakSeconds;
      set({
        activePresetId: presetId,
        currentPreset: preset,
        timeLeft: newTotalSeconds,
        focusTimeLeft: focusSeconds,
        breakTimeLeft: breakSeconds,
        focusWasStarted: false,
        breakWasStarted: false,
        isRunning: false,
        completedFocusCycle: false,
        startTimestamp: null,
        initialDuration: newTotalSeconds,
        timerJustCompleted: false,
      });
    },

    addPreset: (presetData) => set((state) => {
      const id = "id" in presetData && presetData.id ? presetData.id : "custom-" + Date.now();
      const newPreset: TimerPreset = { ...presetData, id } as TimerPreset;

      const newTotalSeconds = (state.mode === "focus" ? newPreset.focusMinutes : newPreset.breakMinutes) * 60;
      const updatedPresets = [...state.presets, newPreset];
      savePresetsToStorage(updatedPresets);

      return {
        presets: updatedPresets,
        activePresetId: newPreset.id,
        currentPreset: newPreset,
        timeLeft: newTotalSeconds,
        isRunning: false,
        completedFocusCycle: false,
        startTimestamp: null,
        initialDuration: newTotalSeconds,
        timerJustCompleted: false,
      };
    }),

    updatePreset: (presetId: string, updates: Partial<TimerPreset>) => set((state) => {
      const updatedPresets = state.presets.map((preset) =>
        preset.id === presetId ? { ...preset, ...updates } : preset
      );
      savePresetsToStorage(updatedPresets);

      const updatedPreset = updatedPresets.find((p) => p.id === presetId);
      if (!updatedPreset) return { presets: updatedPresets };

      const newTotalSeconds = (state.mode === "focus" ? updatedPreset.focusMinutes : updatedPreset.breakMinutes) * 60;

      return {
        presets: updatedPresets,
        currentPreset: updatedPreset,
        timeLeft: newTotalSeconds,
        isRunning: false,
        completedFocusCycle: false,
        startTimestamp: null,
        initialDuration: newTotalSeconds,
        timerJustCompleted: false,
      };
    }),

    deletePreset: (presetId: string) => set((state) => {
      const filteredPresets = state.presets.filter((p) => p.id !== presetId);
      if (filteredPresets.length === 0) return { presets: filteredPresets };
      savePresetsToStorage(filteredPresets);

      const newActiveId = state.activePresetId === presetId
        ? filteredPresets[0].id
        : state.activePresetId;

      const newCurrentPreset = filteredPresets.find((p) => p.id === newActiveId) || filteredPresets[0];
      const newTotalSeconds = (state.mode === "focus" ? newCurrentPreset.focusMinutes : newCurrentPreset.breakMinutes) * 60;

      return {
        presets: filteredPresets,
        activePresetId: newActiveId,
        currentPreset: newCurrentPreset,
        timeLeft: newTotalSeconds,
        isRunning: false,
        completedFocusCycle: false,
        startTimestamp: null,
        initialDuration: newTotalSeconds,
        timerJustCompleted: false,
      };
    }),

    loadPresets: (presets) => set((state) => {
      const normalized = presets.map((p) => ({
        id: p.id,
        name: p.name,
        focusMinutes: p.focusMinutes ?? 0,
        breakMinutes: p.breakMinutes ?? 0,
        isDefault: p.isDefault ?? false,
      }));
      const storedPresets = loadPresetsFromStorage();
      const apiIds = new Set(normalized.map((p) => p.id));
      const missingFromApi = storedPresets.filter((p) => !apiIds.has(p.id) && !p.isDefault);
      const mergedPresets = [...normalized, ...missingFromApi];
      savePresetsToStorage([...normalized, ...missingFromApi]);
      const selectedPreset = normalized[0] ?? state.currentPreset ?? mergedPresets[0];

      const newTotalSeconds = (state.mode === "focus" ? selectedPreset.focusMinutes : selectedPreset.breakMinutes) * 60;

      return {
        presets: mergedPresets,
        activePresetId: selectedPreset.id,
        currentPreset: selectedPreset,
        timeLeft: newTotalSeconds,
        isRunning: false,
        completedFocusCycle: false,
        startTimestamp: null,
        initialDuration: newTotalSeconds,
        timerJustCompleted: false,
      };
    }),

    loadStats: (stats) => {
      const normalized = {
        currentStreak: stats.currentStreak,
        pomodorosToday: stats.pomodorosToday,
        lastPomodoroDate: stats.lastPomodoroDate?.slice(0, 10) ?? null,
      }
      saveStreakToStorage(normalized.currentStreak, normalized.pomodorosToday, normalized.lastPomodoroDate)
      return set(normalized)
    },

    clearCompletedFocusCycle: () => set({ completedFocusCycle: false, timerJustCompleted: false }),
    clearCompletedBreakCycle: () => set({ completedBreakCycle: false }),

    setAlarmSound: (sound: AlarmSound) => {
      saveAlarmSound(sound);
      return set({ alarmSound: sound });
    },

    restoreSession: () => {
      const saved = loadActiveSession()
      if (!saved) return

      const elapsed = Math.floor((Date.now() - saved.startTimestamp) / 1000)
      const remaining = saved.initialDuration - elapsed

      if (remaining <= 0) {
        clearActiveSession()
        return
      }

      const preset = get().presets.find(p => p.id === saved.activePresetId)
        ?? get().currentPreset

      set({
        mode: sanitizeMode(saved.mode),
        timeLeft: Math.max(0, remaining),
        isRunning: saved.isRunning,
        startTimestamp: saved.isRunning ? saved.startTimestamp : null,
        initialDuration: saved.initialDuration,
        activePresetId: saved.activePresetId,
        currentPreset: preset,
        focusTimeLeft: saved.focusTimeLeft,
        breakTimeLeft: saved.breakTimeLeft,
        focusWasStarted: saved.focusTimeLeft > 0,
        breakWasStarted: saved.breakTimeLeft > 0,
        timerJustCompleted: false,
      })

      // If the saved session has alarmSound, reapply it
      if (saved.alarmSound) {
        set({ alarmSound: saved.alarmSound })
      }
    },

    takeBreak: () => {
      const { currentPreset, presets } = get();
      const preset = currentPreset ?? presets[0];
      const breakSeconds = (preset?.breakMinutes ?? 5) * 60;
      clearActiveSession();
      saveCumulativeFocus(0, null);
      const now = Date.now();
      set({
        mode: "break",
        timeLeft: breakSeconds,
        breakTimeLeft: breakSeconds,
        initialDuration: breakSeconds,
        startTimestamp: now,
        isRunning: true,
        consecutiveFocusSeconds: 0,
        snoozedUntilSeconds: null,
        consecutiveBreakSeconds: 0,
        needsBreak: false,
        timerJustCompleted: false,
      });
      saveActiveSession({
        startTimestamp: now,
        initialDuration: breakSeconds,
        mode: "break",
        isRunning: true,
        activePresetId: preset?.id ?? "classic",
        focusTimeLeft: get().focusTimeLeft,
        breakTimeLeft: breakSeconds,
        alarmSound: get().alarmSound,
      });
    },

    snoozeBreakReminder: (minutes = 15) => {
      const { consecutiveFocusSeconds } = get();
      const snoozedUntil = consecutiveFocusSeconds + minutes * 60;
      saveCumulativeFocus(consecutiveFocusSeconds, snoozedUntil);
      set({
        snoozedUntilSeconds: snoozedUntil,
        needsBreak: false,
      });
    },

    resetConsecutiveFocus: () => {
      saveCumulativeFocus(0, null);
      set({
        consecutiveFocusSeconds: 0,
        snoozedUntilSeconds: null,
        consecutiveBreakSeconds: 0,
        needsBreak: false,
      });
    },

    incrementCompletedMIT: () => {
      const current = get().completedMITTodayCount;
      const next = current + 1;
      saveMITProgress(next);
      set({ completedMITTodayCount: next });
    },

    decrementCompletedMIT: () => {
      const current = get().completedMITTodayCount;
      const next = Math.max(0, current - 1);
      saveMITProgress(next);
      set({ completedMITTodayCount: next });
    },

    setCompletedMITTodayCount: (count: number) => {
      const safeCount = Math.max(0, count);
      saveMITProgress(safeCount);
      set({ completedMITTodayCount: safeCount });
    },
  }))
);
