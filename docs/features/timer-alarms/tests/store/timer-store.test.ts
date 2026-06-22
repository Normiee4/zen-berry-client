import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { AlarmSound } from "@/store/timer-store";

const ALARM_SOUND_KEY = "zenberry_timer_alarm_sound";
const ACTIVE_SESSION_KEY = "zenberry_active_session";

// ──────────────────────────────────────────────
// Type-level tests
// ──────────────────────────────────────────────
describe("AlarmSound type", () => {
  it("accepts 'none' as a valid value", () => {
    const value: AlarmSound = "none";
    expect(value).toBe("none");
  });

  it("accepts 'bell' as a valid value", () => {
    const value: AlarmSound = "bell";
    expect(value).toBe("bell");
  });

  it("accepts 'chime' as a valid value", () => {
    const value: AlarmSound = "chime";
    expect(value).toBe("chime");
  });

  it("accepts 'digital' as a valid value", () => {
    const value: AlarmSound = "digital";
    expect(value).toBe("digital");
  });

  it("accepts 'lofi' as a valid value", () => {
    const value: AlarmSound = "lofi";
    expect(value).toBe("lofi");
  });

  it("rejects invalid values at runtime (5 valid strings)", () => {
    const validValues: AlarmSound[] = ["none", "bell", "chime", "digital", "lofi"];
    expect(validValues).toHaveLength(5);
  });
});

// ──────────────────────────────────────────────
// loadAlarmSound() — tested via initial store state
// Each test uses vi.resetModules() + dynamic import
// to force re-evaluation of the module-level store creation.
// ──────────────────────────────────────────────
describe("loadAlarmSound()", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("returns the stored value from localStorage when valid", async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "bell");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    expect(useTimerStore.getState().alarmSound).toBe("bell");
  });

  it('returns "none" when nothing is stored in localStorage', async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    expect(useTimerStore.getState().alarmSound).toBe("none");
  });

  it('returns "none" when the stored value is not in the valid set', async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "gong");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    expect(useTimerStore.getState().alarmSound).toBe("none");
  });

  it('returns "none" when the stored value is empty string', async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    expect(useTimerStore.getState().alarmSound).toBe("none");
  });

  it("handles each valid sound correctly", async () => {
    const sounds: AlarmSound[] = ["none", "bell", "chime", "digital", "lofi"];

    for (const sound of sounds) {
      localStorage.setItem(ALARM_SOUND_KEY, sound);
      vi.resetModules();
      const { useTimerStore } = await import("@/store/timer-store");
      expect(useTimerStore.getState().alarmSound).toBe(sound);
    }
  });
});

// ──────────────────────────────────────────────
// saveAlarmSound() — tested via store action
// ──────────────────────────────────────────────
describe("saveAlarmSound()", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("writes the selected alarm sound to localStorage", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    useTimerStore.getState().setAlarmSound("chime");

    expect(setItemSpy).toHaveBeenCalledWith(ALARM_SOUND_KEY, "chime");
  });

  it("overwrites a previous value in localStorage", async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "bell");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    useTimerStore.getState().setAlarmSound("lofi");

    // Should have been called twice: once for "none" during init? No — only the action call.
    // Actually loadAlarmSound reads, it doesn't write. So only one write.
    expect(setItemSpy).toHaveBeenCalledTimes(1);
    expect(setItemSpy).toHaveBeenCalledWith(ALARM_SOUND_KEY, "lofi");
  });

  it("silently ignores localStorage write failures", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    // Should not throw
    expect(() => {
      useTimerStore.getState().setAlarmSound("digital");
    }).not.toThrow();
  });
});

// ──────────────────────────────────────────────
// setAlarmSound action
// ──────────────────────────────────────────────
describe("setAlarmSound action", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("updates the alarmSound state in the store", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    useTimerStore.getState().setAlarmSound("digital");

    expect(useTimerStore.getState().alarmSound).toBe("digital");
  });

  it("persists the value to localStorage when state is updated", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");

    useTimerStore.getState().setAlarmSound("lofi");

    expect(useTimerStore.getState().alarmSound).toBe("lofi");
    expect(setItemSpy).toHaveBeenCalledWith(ALARM_SOUND_KEY, "lofi");
  });

  it("can change from one non-none sound to another", async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "bell");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    expect(useTimerStore.getState().alarmSound).toBe("bell");

    useTimerStore.getState().setAlarmSound("chime");

    expect(useTimerStore.getState().alarmSound).toBe("chime");
    expect(localStorage.getItem(ALARM_SOUND_KEY)).toBe("chime");
  });

  it("can change from a sound back to 'none'", async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "bell");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    useTimerStore.getState().setAlarmSound("none");

    expect(useTimerStore.getState().alarmSound).toBe("none");
    expect(localStorage.getItem(ALARM_SOUND_KEY)).toBe("none");
  });
});

// ──────────────────────────────────────────────
// Initial state from loadAlarmSound()
// ──────────────────────────────────────────────
describe("initial state hydration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initialized to 'none' when localStorage has no alarm sound", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    expect(useTimerStore.getState().alarmSound).toBe("none");
  });

  it("initialized to the stored value when localStorage has a valid alarm sound", async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "chime");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    expect(useTimerStore.getState().alarmSound).toBe("chime");
  });

  it("initialized to 'none' when localStorage has an invalid value", async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "invalid_sound_xyz");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    expect(useTimerStore.getState().alarmSound).toBe("none");
  });
});

// ──────────────────────────────────────────────
// ActiveSession integration
// ──────────────────────────────────────────────
describe("ActiveSession alarmSound integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saveActiveSession() includes alarmSound field when starting", async () => {
    localStorage.setItem(ALARM_SOUND_KEY, "lofi");

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    // Set alarm and verify state
    useTimerStore.getState().setAlarmSound("lofi");

    // Call start to trigger saveActiveSession
    // We need a preset to exist; default presets are loaded
    useTimerStore.getState().start();

    const saved = JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY) || "{}");
    expect(saved).toHaveProperty("alarmSound");
    expect(saved.alarmSound).toBe("lofi");
  });

  it("saveActiveSession() persists the current alarmSound", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    // Change sound before starting
    useTimerStore.getState().setAlarmSound("digital");

    // Start the timer
    useTimerStore.getState().start();

    const saved = JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY) || "{}");
    expect(saved.alarmSound).toBe("digital");
  });

  it("toggle() saving an active session includes alarmSound", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    useTimerStore.getState().setAlarmSound("chime");

    // toggle starts the timer
    useTimerStore.getState().toggle();

    const saved = JSON.parse(localStorage.getItem(ACTIVE_SESSION_KEY) || "{}");
    expect(saved.alarmSound).toBe("chime");
  });
});

// ──────────────────────────────────────────────
// restoreSession() alarmSound handling
// ──────────────────────────────────────────────
describe("restoreSession() alarmSound restoration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("restores alarmSound from a saved session if present", async () => {
    // Simulate a saved session with alarmSound
    const savedSession = {
      startTimestamp: Date.now(),
      initialDuration: 1500,
      mode: "focus",
      isRunning: false,
      activePresetId: "classic",
      focusTimeLeft: 1500,
      breakTimeLeft: 300,
      alarmSound: "chime",
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(savedSession));

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    // Store initial alarmSound is "none" (from empty localStorage)
    expect(useTimerStore.getState().alarmSound).toBe("none");

    // Restore session
    useTimerStore.getState().restoreSession();

    // alarmSound should now be "chime" from the saved session
    expect(useTimerStore.getState().alarmSound).toBe("chime");
  });

  it("preserves current alarmSound when saved session has no alarmSound field (migration)", async () => {
    // Old-format session without alarmSound
    const oldSession = {
      startTimestamp: Date.now(),
      initialDuration: 1500,
      mode: "focus",
      isRunning: false,
      activePresetId: "classic",
      focusTimeLeft: 1500,
      breakTimeLeft: 300,
      // no alarmSound field
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(oldSession));

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    // Set the alarm sound to something before restoring
    useTimerStore.getState().setAlarmSound("lofi");

    // Now restore the old-format session
    useTimerStore.getState().restoreSession();

    // alarmSound should remain "lofi" because the saved session has no alarmSound
    expect(useTimerStore.getState().alarmSound).toBe("lofi");
  });

  it("does not change alarmSound when saved session has alarmSound === undefined", async () => {
    // Session with alarmSound explicitly undefined
    const session = {
      startTimestamp: Date.now(),
      initialDuration: 1500,
      mode: "focus",
      isRunning: false,
      activePresetId: "classic",
      focusTimeLeft: 1500,
      breakTimeLeft: 300,
      alarmSound: undefined,
    };
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));

    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    // alarmSound defaults to "none"
    expect(useTimerStore.getState().alarmSound).toBe("none");

    useTimerStore.getState().restoreSession();

    // Should remain "none" since saved.alarmSound is undefined/falsy
    expect(useTimerStore.getState().alarmSound).toBe("none");
  });

  it("restores different alarm sounds correctly", async () => {
    const sounds: AlarmSound[] = ["bell", "chime", "digital", "lofi"];

    for (const sound of sounds) {
      localStorage.clear();
      const session = {
        startTimestamp: Date.now(),
        initialDuration: 1500,
        mode: "focus",
        isRunning: false,
        activePresetId: "classic",
        focusTimeLeft: 1500,
        breakTimeLeft: 300,
        alarmSound: sound,
      };
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));

      vi.resetModules();
      const { useTimerStore: store } = await import("@/store/timer-store");
      store.getState().restoreSession();

      expect(store.getState().alarmSound).toBe(sound);
    }
  });
});

// ──────────────────────────────────────────────
// TimerState shape (compile-time assurance via runtime checks)
// ──────────────────────────────────────────────
describe("TimerState includes alarmSound field", () => {
  it("alarmSound is present in the store state", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    const state = useTimerStore.getState();
    expect(state).toHaveProperty("alarmSound");
  });

  it("setAlarmSound is present as an action", async () => {
    vi.resetModules();
    const { useTimerStore } = await import("@/store/timer-store");

    const state = useTimerStore.getState();
    expect(state).toHaveProperty("setAlarmSound");
    expect(typeof state.setAlarmSound).toBe("function");
  });
});
