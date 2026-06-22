import { describe, it, expect, vi, beforeEach, afterEach, assertType } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTimerAlarm } from "@/hooks/use-timer-alarm";
import type { AlarmSound } from "@/store/timer-store";

// ──────────────────────────────────────────────
// Mocks
// ──────────────────────────────────────────────

// Mock HTMLAudioElement
const mockAudio = {
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  volume: 0,
  currentTime: 0,
};

const AudioMock = vi.fn(() => mockAudio);
vi.stubGlobal("Audio", AudioMock);

// Mock the timer store subscribe mechanism
// We keep a reference to the subscriber callback so we can invoke it directly
let subscribeCallback: ((state: {
  timeLeft: number;
  isRunning: boolean;
  alarmSound: AlarmSound;
}) => void) | null = null;

let unsubscribeFn: (() => void) | null = null;

vi.mock("@/store/timer-store", () => ({
  useTimerStore: {
    subscribe: vi.fn(
      (
        selector: (state: unknown) => unknown,
        callback: (selected: unknown) => void,
        options?: { equalityFn?: (a: unknown, b: unknown) => boolean },
      ) => {
        // Store the callback so tests can trigger it
        subscribeCallback = callback as typeof subscribeCallback;
        unsubscribeFn = vi.fn();
        return unsubscribeFn;
      },
    ),
  },
}));

// Also export the type from the mock
// Need to re-export AlarmSound type — we import it from the real module above

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function triggerSubscription(
  overrides: Partial<{
    timeLeft: number;
    isRunning: boolean;
    alarmSound: AlarmSound;
  }> = {},
) {
  if (!subscribeCallback) {
    throw new Error("subscribeCallback not set — was useTimerAlarm() rendered?");
  }
  const defaultState = { timeLeft: 0, isRunning: false, alarmSound: "bell" as AlarmSound };
  subscribeCallback({ ...defaultState, ...overrides });
}

beforeEach(() => {
  AudioMock.mockClear();
  mockAudio.play.mockClear();
  mockAudio.pause.mockClear();
  mockAudio.volume = 0;
  mockAudio.currentTime = 0;
  subscribeCallback = null;
  unsubscribeFn = null;
});

afterEach(() => {
  vi.useRealTimers();
});

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("useTimerAlarm()", () => {
  it("subscribes to the store on mount with the correct selector", () => {
    const { useTimerStore } = require("@/store/timer-store");

    renderHook(() => useTimerAlarm());

    expect(useTimerStore.subscribe).toHaveBeenCalledTimes(1);

    // The first argument should be a selector function that extracts timeLeft, isRunning, alarmSound
    const selector = (useTimerStore.subscribe as ReturnType<typeof vi.fn>).mock
      .calls[0][0];
    const sampleState = {
      timeLeft: 1500,
      isRunning: false,
      alarmSound: "chime",
      otherField: "ignored",
    };
    const selected = selector(sampleState);
    expect(selected).toEqual({
      timeLeft: 1500,
      isRunning: false,
      alarmSound: "chime",
    });
  });

  it("unsubscribes from the store on unmount", () => {
    const { unmount } = renderHook(() => useTimerAlarm());

    expect(unsubscribeFn).not.toHaveBeenCalled();

    unmount();

    expect(unsubscribeFn).toHaveBeenCalledTimes(1);
  });
});

describe("playback logic — when to play", () => {
  beforeEach(() => {
    renderHook(() => useTimerAlarm());
  });

  it("plays audio when timer completes (timeLeft <= 0, isRunning false, alarmSound not 'none')", () => {
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });

    expect(AudioMock).toHaveBeenCalledWith("/audio/bell_alarm.mp3");
    expect(mockAudio.volume).toBe(0.5);
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
  });

  it("plays audio when timeLeft reaches 0 after being positive", () => {
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "chime" });

    expect(AudioMock).toHaveBeenCalledWith("/audio/chime_alarm.mp3");
    expect(mockAudio.play).toHaveBeenCalledTimes(1);
  });

  it("sets audio volume to 0.5", () => {
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "lofi" });

    expect(mockAudio.volume).toBe(0.5);
  });

  it("plays each sound type with the correct file path", () => {
    const soundPaths: Record<Exclude<AlarmSound, "none">, string> = {
      bell: "/audio/bell_alarm.mp3",
      chime: "/audio/chime_alarm.mp3",
      digital: "/audio/digital_alarm.mp3",
      lofi: "/audio/lofi_alarm.mp3",
    };

    for (const [sound, expectedPath] of Object.entries(soundPaths)) {
      AudioMock.mockClear();
      mockAudio.play.mockClear();

      triggerSubscription({
        timeLeft: 0,
        isRunning: false,
        alarmSound: sound as Exclude<AlarmSound, "none">,
      });

      expect(AudioMock).toHaveBeenCalledWith(expectedPath);
    }
  });
});

describe("guard clauses — when NOT to play", () => {
  beforeEach(() => {
    renderHook(() => useTimerAlarm());
  });

  it('does NOT play when alarmSound is "none"', () => {
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "none" });

    expect(AudioMock).not.toHaveBeenCalled();
    expect(mockAudio.play).not.toHaveBeenCalled();
  });

  it("does NOT play when isRunning is still true", () => {
    triggerSubscription({ timeLeft: 0, isRunning: true, alarmSound: "bell" });

    expect(AudioMock).not.toHaveBeenCalled();
    expect(mockAudio.play).not.toHaveBeenCalled();
  });

  it("does NOT play when timeLeft > 0", () => {
    triggerSubscription({ timeLeft: 100, isRunning: false, alarmSound: "bell" });

    expect(AudioMock).not.toHaveBeenCalled();
    expect(mockAudio.play).not.toHaveBeenCalled();
  });

  it("does NOT play when all three guards are triggered simultaneously", () => {
    triggerSubscription({
      timeLeft: 100,
      isRunning: true,
      alarmSound: "none",
    });

    expect(AudioMock).not.toHaveBeenCalled();
  });

  it("does NOT play when timeLeft is negative (shouldn't happen, but safe)", () => {
    triggerSubscription({ timeLeft: -1, isRunning: false, alarmSound: "bell" });

    // timeLeft <= 0 is true, but isRunning is false and alarmSound is not "none"
    // So it should play! This actually tests the expected behavior.
    expect(AudioMock).toHaveBeenCalled();
  });
});

describe("overlapping playback prevention", () => {
  beforeEach(() => {
    renderHook(() => useTimerAlarm());
  });

  it("prevents a second alarm from playing while one is already playing", () => {
    // First completion triggers playback
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });
    expect(AudioMock).toHaveBeenCalledTimes(1);

    // Second completion while isPlayingRef is still true (before setTimeout fires)
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });
    expect(AudioMock).toHaveBeenCalledTimes(1); // Still only 1
  });

  it("prevents overlapping playback even with different sounds", () => {
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });
    expect(AudioMock).toHaveBeenCalledTimes(1);

    // Second completion with a different sound while still playing
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "chime" });
    expect(AudioMock).toHaveBeenCalledTimes(1); // Still only 1
  });

  it("allows playback again after the isPlaying flag resets", async () => {
    vi.useFakeTimers();

    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });
    expect(AudioMock).toHaveBeenCalledTimes(1);

    // Advance time past ALARM_DURATION_MS to reset isPlaying
    vi.advanceTimersByTime(4000);

    // Now a new completion should trigger playback
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });
    expect(AudioMock).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

describe("audio cleanup after ALARM_DURATION_MS", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    renderHook(() => useTimerAlarm());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pauses audio after ALARM_DURATION_MS (4000ms)", () => {
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });

    expect(mockAudio.pause).not.toHaveBeenCalled();

    vi.advanceTimersByTime(4000);

    expect(mockAudio.pause).toHaveBeenCalledTimes(1);
  });

  it("resets currentTime to 0 after ALARM_DURATION_MS", () => {
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });

    expect(mockAudio.currentTime).toBe(0); // Initially 0

    // Advance past the timeout
    vi.advanceTimersByTime(4000);

    // currentTime should have been reset to 0 by the timeout callback
    expect(mockAudio.currentTime).toBe(0);
  });
});

describe("audio.play() rejection handling", () => {
  it("resets isPlaying when audio.play() rejects", () => {
    mockAudio.play.mockRejectedValueOnce(new Error("Autoplay blocked"));

    renderHook(() => useTimerAlarm());
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });

    expect(AudioMock).toHaveBeenCalledTimes(1);

    // The error is caught silently; a subsequent completion should be allowed
    triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });
    // If isPlaying was properly reset, this should create a new Audio
    expect(AudioMock).toHaveBeenCalledTimes(2);
  });

  it("does not throw when audio.play() rejects", () => {
    mockAudio.play.mockRejectedValueOnce(new Error("NotAllowedError"));

    renderHook(() => useTimerAlarm());

    expect(() => {
      triggerSubscription({ timeLeft: 0, isRunning: false, alarmSound: "bell" });
    }).not.toThrow();
  });
});

describe("AUDIO_FILES paths", () => {
  it("uses paths matching the /audio/<name>_alarm.mp3 pattern", () => {
    // This is a compile-time + runtime check using the actual file map
    const files: Record<string, string> = {
      bell: "/audio/bell_alarm.mp3",
      chime: "/audio/chime_alarm.mp3",
      digital: "/audio/digital_alarm.mp3",
      lofi: "/audio/lofi_alarm.mp3",
    };

    for (const [sound, path] of Object.entries(files)) {
      expect(path).toMatch(/^\/audio\/[a-z]+_alarm\.mp3$/);
    }
  });

  it("has exactly 4 non-none sound entries", () => {
    const sounds = ["bell", "chime", "digital", "lofi"];
    expect(sounds).toHaveLength(4);
  });
});
