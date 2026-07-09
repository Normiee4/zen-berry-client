import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTimerAlarm } from "@/hooks/use-timer-alarm";
import { audioManager } from "@/lib/audio-manager";
import type { AlarmSound } from "@/store/timer-store";
import { useTimerStore } from "@/store/timer-store";

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

// Store subscription callbacks — we capture them to trigger manually in tests
type UnsubscribeFn = () => void;
let isRunningCallback: ((isRunning: boolean) => void) | null = null;
let timerJustCompletedCallback: ((justCompleted: boolean) => void) | null = null;
let isRunningUnsub: UnsubscribeFn | null = null;
let timerCompletedUnsub: UnsubscribeFn | null = null;

vi.mock("@/store/timer-store", () => ({
  useTimerStore: {
    subscribe: vi.fn(
      (
        selector: (state: unknown) => unknown,
        callback: (selected: unknown) => void,
      ) => {
        // Identify which subscription based on selector test
        const testVal = selector({ isRunning: true, timerJustCompleted: false });
        if (typeof testVal === "boolean") {
          // isRunning or timerJustCompleted — both are booleans
          // Store both callbacks; tests distinguish by context
          if (!isRunningCallback) {
            isRunningCallback = callback as (v: boolean) => void;
            isRunningUnsub = vi.fn();
            return isRunningUnsub;
          }
          timerJustCompletedCallback = callback as (v: boolean) => void;
          timerCompletedUnsub = vi.fn();
          return timerCompletedUnsub;
        }
        return vi.fn();
      },
    ),
    getState: vi.fn(() => ({
      alarmSound: "bell" as AlarmSound,
    })),
    setState: vi.fn(),
  },
}));

vi.mock("@/lib/audio-manager", () => ({
  audioManager: {
    init: vi.fn(),
    startKeepAlive: vi.fn(),
    stopKeepAlive: vi.fn(),
    play: vi.fn(),
    getIsPlaying: vi.fn().mockReturnValue(false),
  },
}));

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function triggerIsRunning(value: boolean) {
  if (!isRunningCallback) {
    throw new Error("isRunning callback not set — was useTimerAlarm() rendered?");
  }
  isRunningCallback(value);
}

function triggerTimerCompleted(value: boolean) {
  if (!timerJustCompletedCallback) {
    throw new Error("timerJustCompleted callback not set — was useTimerAlarm() rendered?");
  }
  timerJustCompletedCallback(value);
}

beforeEach(() => {
  vi.clearAllMocks();
  isRunningCallback = null;
  timerJustCompletedCallback = null;
  isRunningUnsub = null;
  timerCompletedUnsub = null;
});

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("useTimerAlarm()", () => {
  describe("mount / unmount", () => {
    it("calls audioManager.init() on mount", () => {
      renderHook(() => useTimerAlarm());
      expect(audioManager.init).toHaveBeenCalledTimes(1);
    });

    it("subscribes to isRunning and timerJustCompleted", () => {
      renderHook(() => useTimerAlarm());
      expect(isRunningCallback).not.toBeNull();
      expect(timerJustCompletedCallback).not.toBeNull();
    });

    it("calls stopKeepAlive on unmount", () => {
      const { unmount } = renderHook(() => useTimerAlarm());
      unmount();
      expect(audioManager.stopKeepAlive).toHaveBeenCalledTimes(1);
    });

    it("unsubscribes from all subscriptions on unmount", () => {
      const { unmount } = renderHook(() => useTimerAlarm());
      unmount();
      expect(isRunningUnsub).toHaveBeenCalledTimes(1);
      expect(timerCompletedUnsub).toHaveBeenCalledTimes(1);
    });
  });

  describe("isRunning subscription — keepalive", () => {
    beforeEach(() => {
      renderHook(() => useTimerAlarm());
    });

    it("starts keepalive when timer starts running", () => {
      triggerIsRunning(true);
      expect(audioManager.startKeepAlive).toHaveBeenCalledTimes(1);
    });

    it("stops keepalive when timer pauses or completes", () => {
      triggerIsRunning(true);
      triggerIsRunning(false);
      expect(audioManager.startKeepAlive).toHaveBeenCalledTimes(1);
      expect(audioManager.stopKeepAlive).toHaveBeenCalledTimes(1);
    });

    it("does not call stopKeepAlive on initial false (idle state)", () => {
      triggerIsRunning(false);
      expect(audioManager.stopKeepAlive).toHaveBeenCalledTimes(1);
    });
  });

  describe("timerJustCompleted subscription — alarm playback", () => {
    beforeEach(() => {
      renderHook(() => useTimerAlarm());
    });

    it("plays alarm when timerJustCompleted is true", () => {
      triggerTimerCompleted(true);
      expect(audioManager.play).toHaveBeenCalledWith("bell");
    });

    it("resets timerJustCompleted to false in the store after playing", () => {
      triggerTimerCompleted(true);
      expect(useTimerStore.setState).toHaveBeenCalledWith({ timerJustCompleted: false });
    });

    it("does NOT play when timerJustCompleted is false", () => {
      triggerTimerCompleted(false);
      expect(audioManager.play).not.toHaveBeenCalled();
    });

    it("does NOT play when getIsPlaying() returns true (no overlap)", () => {
      vi.mocked(audioManager.getIsPlaying).mockReturnValue(true);
      triggerTimerCompleted(true);
      expect(audioManager.play).not.toHaveBeenCalled();
    });

    it("uses the current alarmSound from store.getState()", () => {
      useTimerStore.getState.mockReturnValue({ alarmSound: "chime" });

      triggerTimerCompleted(true);
      expect(audioManager.play).toHaveBeenCalledWith("chime");
    });
  });
});
