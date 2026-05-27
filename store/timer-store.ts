import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type TimerMode = "focus" | "break";

export interface TimerPreset {
  id: string;
  name: string;
  focusMinutes: number;
  breakMinutes: number;
  isDefault?: boolean;
}

const PRESETS_STORAGE_KEY = "zenberry_timer_presets";
const STREAK_STORAGE_KEY = "zenberry_timer_streak";

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

    // Timestamp-based tracking
    startTimestamp: null,
    initialDuration: 25 * 60,

    start: () => {
      const { timeLeft, mode } = get();
      set({ 
        isRunning: true, 
        startTimestamp: Date.now(),
        initialDuration: timeLeft,
        focusWasStarted: mode === "focus" ? true : get().focusWasStarted,
        breakWasStarted: mode === "break" ? true : get().breakWasStarted,
      });
    },

    pause: () => set((state) => {
      if (!state.isRunning || !state.startTimestamp) {
        return { isRunning: false };
      }
      const elapsed = Math.floor((Date.now() - state.startTimestamp) / 1000);
      const remaining = Math.max(0, state.initialDuration - elapsed);
      return { 
        isRunning: false, 
        timeLeft: remaining,
        startTimestamp: null 
      };
    }),

    toggle: () => {
      const state = get();
      if (state.isRunning) {
        const elapsed = Math.floor((Date.now() - state.startTimestamp!) / 1000);
        const remaining = Math.max(0, state.initialDuration - elapsed);
        set({ 
          isRunning: false, 
          timeLeft: remaining,
          startTimestamp: null 
        });
      } else {
        set({ 
          isRunning: true, 
          startTimestamp: Date.now(),
          initialDuration: state.timeLeft 
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
      return { 
        timeLeft: totalSeconds,
        focusTimeLeft: focusSeconds,
        breakTimeLeft: breakSeconds,
        focusWasStarted: false,
        breakWasStarted: false,
        isRunning: false, 
        completedFocusCycle: false,
        startTimestamp: null,
        initialDuration: totalSeconds
      };
    }),

    tick: () => set((state) => {
      if (!state.isRunning || !state.startTimestamp) {
        return state;
      }

      const now = Date.now();
      const elapsed = Math.floor((now - state.startTimestamp) / 1000);
      const newTimeLeft = Math.max(0, state.initialDuration - elapsed);

      if (newTimeLeft <= 0) {
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
            startTimestamp: null,
            initialDuration: newTotalSeconds,
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
          startTimestamp: null,
          initialDuration: newTotalSeconds,
        };
      }

      const saveField = state.mode === "focus" ? "focusTimeLeft" : "breakTimeLeft";
      return { timeLeft: newTimeLeft, [saveField]: newTimeLeft, completedFocusCycle: false };
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
      });
    },

    addPreset: (presetData) => set((state) => {
      const newPreset: TimerPreset = {
        ...presetData,
        id: "id" in presetData && presetData.id ? presetData.id : `custom-${Date.now()}`,
      } as TimerPreset;

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

    clearCompletedFocusCycle: () => set({ completedFocusCycle: false }),
  }))
);