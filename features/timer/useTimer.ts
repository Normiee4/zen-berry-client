import { useTimerStore } from "@/features/timer/store/timer-store"

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
  } = useTimerStore()

  return {
    // State
    mode,
    timeLeft,
    isRunning,
    presets,
    activePresetId,
    // Computed (optional, but keeps component simple)
    activePreset: presets.find(p => p.id === activePresetId) || presets[0],
    // Actions
    toggle,
    reset,
    setMode,
    setPreset,
    addPreset,
  }
}