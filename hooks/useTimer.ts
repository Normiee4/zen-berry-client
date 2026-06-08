import { useTimerStore } from "@/store/timer-store"

export function useTimer() {
  const {
    mode,
    timeLeft,
    isRunning,
    presets,
    activePresetId,
    toggle,
    reset,
    setMode,
    setPreset,
    addPreset,
    updatePreset,
    deletePreset,
    loadPresets,
    loadStats,
    completedFocusCycle,
    clearCompletedFocusCycle,
    restoreSession,
    currentStreak,
    pomodorosToday,
  } = useTimerStore()

  return {
    // State
    mode,
    timeLeft,
    isRunning,
    presets,
    activePresetId,
    currentStreak,
    pomodorosToday,
    completedFocusCycle,
    // Computed (optional, but keeps component simple)
    activePreset: presets.find((p) => p.id === activePresetId) || presets[0],
    // Actions
    toggle,
    reset,
    setMode,
    setPreset,
    addPreset,
    updatePreset,
    deletePreset,
    loadPresets,
    loadStats,
    restoreSession,
    clearCompletedFocusCycle,
  }
}