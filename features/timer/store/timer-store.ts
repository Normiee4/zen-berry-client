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

  type TimerState = {
    // Current timer state
    mode: TimerMode;
    timeLeft: number;
    isRunning: boolean;
    currentPreset: TimerPreset | null;

    // Presets
    presets: TimerPreset[];
    activePresetId: string;

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

  export const useTimerStore = create<TimerState>()(
    subscribeWithSelector((set, get) => ({
      // Initial state
      mode: "focus",
      timeLeft: 25 * 60, // 25 minutes in seconds
      isRunning: false,
      currentPreset: defaultPresets[0],
      presets: defaultPresets,
      activePresetId: "classic",
      currentStreak: 0,
      pomodorosToday: 0,
      lastPomodoroDate: null,
      completedFocusCycle: false,

      // Actions
      start: () => set({ isRunning: true }),

      pause: () => set({ isRunning: false }),

      toggle: () => set((state) => ({ isRunning: !state.isRunning })),

      reset: () => set((state) => {
        const totalSeconds = state.currentPreset
          ? (state.mode === "focus" ? state.currentPreset.focusMinutes : state.currentPreset.breakMinutes) * 60
          : 0;
        return { timeLeft: totalSeconds, isRunning: false, completedFocusCycle: false };
      }),

      tick: () => set((state) => {
        if (state.timeLeft <= 1) {
          const wasFocusMode = state.mode === "focus"
          const newMode = wasFocusMode ? "break" : "focus";
          const newTotalSeconds = state.currentPreset
            ? (newMode === "focus" ? state.currentPreset.focusMinutes : state.currentPreset.breakMinutes) * 60
            : 0;

          if (wasFocusMode) {
            const today = getTodayDate();
            const yesterday = getYesterdayDate();
            let streak = state.currentStreak;
            let todayCount = state.pomodorosToday;

            if (state.lastPomodoroDate === today) {
              todayCount += 1;
            } else {
              todayCount = 1;
              streak = state.lastPomodoroDate === yesterday ? Math.max(1, state.currentStreak + 1) : 1;
            }

            return {
              mode: newMode,
              timeLeft: newTotalSeconds,
              isRunning: false,
              currentStreak: streak,
              pomodorosToday: todayCount,
              lastPomodoroDate: today,
              completedFocusCycle: true,
            };
          }

          return {
            mode: newMode,
            timeLeft: newTotalSeconds,
            isRunning: false,
            completedFocusCycle: false,
          };
        }

        return { timeLeft: state.timeLeft - 1, completedFocusCycle: false };
      }),

      setMode: (mode: TimerMode) => {
        const { currentPreset } = get();
        if (!currentPreset) return;

        const newTotalSeconds = (mode === "focus" ? currentPreset.focusMinutes : currentPreset.breakMinutes) * 60;
        set({ mode, timeLeft: newTotalSeconds, isRunning: false, completedFocusCycle: false });
      },

      setPreset: (presetId: string) => {
        const { presets } = get();
        const preset = presets.find((p) => p.id === presetId);
        if (!preset) return;

        const newTotalSeconds = (get().mode === "focus" ? preset.focusMinutes : preset.breakMinutes) * 60;
        set({
          activePresetId: presetId,
          currentPreset: preset,
          timeLeft: newTotalSeconds,
          isRunning: false,
          completedFocusCycle: false,
        });
      },

      addPreset: (presetData) => set((state) => {
        const newPreset: TimerPreset = {
          ...presetData,
          id: "id" in presetData && presetData.id ? presetData.id : `custom-${Date.now()}`,
        } as TimerPreset;

        return {
          presets: [...state.presets, newPreset],
          activePresetId: newPreset.id,
          currentPreset: newPreset,
          timeLeft: (state.mode === "focus" ? newPreset.focusMinutes : newPreset.breakMinutes) * 60,
          isRunning: false,
          completedFocusCycle: false,
        };
      }),

      updatePreset: (presetId: string, updates: Partial<TimerPreset>) => set((state) => {
        const updatedPresets = state.presets.map((preset) =>
          preset.id === presetId ? { ...preset, ...updates } : preset
        );

        const updatedPreset = updatedPresets.find((p) => p.id === presetId);
        if (!updatedPreset) return { presets: updatedPresets };

        const newTotalSeconds = (state.mode === "focus" ? updatedPreset.focusMinutes : updatedPreset.breakMinutes) * 60;

        return {
          presets: updatedPresets,
          currentPreset: updatedPreset,
          timeLeft: newTotalSeconds,
          isRunning: false,
          completedFocusCycle: false,
        };
      }),

      deletePreset: (presetId: string) => set((state) => {
        const filteredPresets = state.presets.filter((p) => p.id !== presetId);
        if (filteredPresets.length === 0) return { presets: filteredPresets };

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
        };
      }),

      loadPresets: (presets) => set((state) => {
        const mergedPresets = [...defaultPresets, ...presets];
        const selectedPreset = presets[0] ?? state.currentPreset ?? mergedPresets[0];

        return {
          presets: mergedPresets,
          activePresetId: selectedPreset.id,
          currentPreset: selectedPreset,
          timeLeft: (state.mode === "focus" ? selectedPreset.focusMinutes : selectedPreset.breakMinutes) * 60,
          isRunning: false,
          completedFocusCycle: false,
        };
      }),

      loadStats: (stats) => set({
        currentStreak: stats.currentStreak,
        pomodorosToday: stats.pomodorosToday,
        lastPomodoroDate: stats.lastPomodoroDate,
      }),

      clearCompletedFocusCycle: () => set({ completedFocusCycle: false }),
    }))
  );