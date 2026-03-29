import { create } from "zustand";

type TimerState = {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  tick: () => void;
};

export const useTimerStore = create<TimerState>((set) => ({
  time: 1500, // 25 mins default
  isRunning: false,

  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  reset: () => set({ time: 1500, isRunning: false }),

  tick: () =>
    set((state) => ({
      time: state.time > 0 ? state.time - 1 : 0,
    })),
}));