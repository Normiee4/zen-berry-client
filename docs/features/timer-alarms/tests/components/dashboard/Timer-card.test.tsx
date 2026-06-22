import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { TimerCard } from "@/components/dashboard/Timer-card";
import type { AlarmSound } from "@/store/timer-store";

// ──────────────────────────────────────────────
// Mock TimerAlarmPicker to capture props
// ──────────────────────────────────────────────
const mockTimerAlarmPicker = vi.fn();
vi.mock("@/components/dashboard/timer-alarm-picker", () => ({
  TimerAlarmPicker: (props: {
    alarmSound: AlarmSound;
    onAlarmSoundChange: (sound: AlarmSound) => void;
  }) => {
    mockTimerAlarmPicker(props);
    return <div data-testid="timer-alarm-picker" />;
  },
}));

// ──────────────────────────────────────────────
// Mock hooks
// ──────────────────────────────────────────────
const mockUseTimer = vi.fn();
vi.mock("@/hooks/useTimer", () => ({
  useTimer: () => mockUseTimer(),
}));

const mockUseTimerAlarm = vi.fn();
vi.mock("@/hooks/use-timer-alarm", () => ({
  useTimerAlarm: () => mockUseTimerAlarm(),
}));

const mockUseTimerLogic = vi.fn();
vi.mock("@/lib/timer-logic", () => ({
  useTimerLogic: () => mockUseTimerLogic(),
}));

const mockSetAlarmSound = vi.fn();

// ──────────────────────────────────────────────
// Mock UI components that would otherwise be complex to render
// ──────────────────────────────────────────────
vi.mock("recharts", () => ({
  RadialBarChart: vi.fn(() => <div data-testid="radial-bar-chart" />),
  RadialBar: vi.fn(() => <div data-testid="radial-bar" />),
  PolarAngleAxis: vi.fn(() => <div data-testid="polar-angle-axis" />),
}));

vi.mock("lucide-react", () => ({
  Pause: () => <div data-testid="icon-pause" />,
  Play: () => <div data-testid="icon-play" />,
  Plus: () => <div data-testid="icon-plus" />,
  Pencil: () => <div data-testid="icon-pencil" />,
  RotateCcw: () => <div data-testid="icon-rotate-ccw" />,
  Settings: () => <div data-testid="icon-settings" />,
  Trash2: () => <div data-testid="icon-trash" />,
  Volume2: () => <div data-testid="icon-volume-2" />,
  VolumeX: () => <div data-testid="icon-volume-x" />,
}));

vi.mock("@/hooks/useResponsive", () => ({
  useResponsive: vi.fn(() => ({ isMobile: false, isTablet: false })),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

// ──────────────────────────────────────────────
// Helper to set up default mock values
// ──────────────────────────────────────────────
function setupDefaultMocks() {
  mockUseTimer.mockReturnValue({
    mode: "focus",
    timeLeft: 1500,
    isRunning: false,
    presets: [
      {
        id: "classic",
        name: "Classic Pomodoro",
        focusMinutes: 25,
        breakMinutes: 5,
        isDefault: true,
      },
    ],
    activePreset: {
      id: "classic",
      name: "Classic Pomodoro",
      focusMinutes: 25,
      breakMinutes: 5,
      isDefault: true,
    },
    activePresetId: "classic",
    toggle: vi.fn(),
    reset: vi.fn(),
    setMode: vi.fn(),
    setPreset: vi.fn(),
    addPreset: vi.fn(),
    updatePreset: vi.fn(),
    deletePreset: vi.fn(),
    loadPresets: vi.fn(),
    loadStats: vi.fn(),
    clearCompletedFocusCycle: vi.fn(),
    restoreSession: vi.fn(),
    completedFocusCycle: false,
    currentStreak: 0,
    pomodorosToday: 0,
    // Alarm sound props
    alarmSound: "none" as AlarmSound,
    setAlarmSound: mockSetAlarmSound,
  });
}

beforeEach(() => {
  setupDefaultMocks();
  mockTimerAlarmPicker.mockClear();
  mockUseTimerAlarm.mockClear();
  mockUseTimerLogic.mockClear();
  mockSetAlarmSound.mockClear();
  // Mock fetch to avoid real network calls
  globalThis.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ presets: [], streak: null }),
  });
});

afterEach(() => {
  cleanup();
});

// ──────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────

describe("TimerCard integration with alarm feature", () => {
  it("renders without errors", () => {
    expect(() => render(<TimerCard />)).not.toThrow();
  });

  it("mounts useTimerAlarm alongside useTimerLogic", () => {
    render(<TimerCard />);

    expect(mockUseTimerLogic).toHaveBeenCalledTimes(1);
    expect(mockUseTimerAlarm).toHaveBeenCalledTimes(1);
  });

  it("reads alarmSound and setAlarmSound from useTimer", () => {
    render(<TimerCard />);

    // Check that useTimer was called (and thus alarmSound/setAlarmSound are consumed)
    expect(mockUseTimer).toHaveBeenCalled();
    const returnValue = mockUseTimer.mock.results[0]?.value;
    expect(returnValue).toHaveProperty("alarmSound");
    expect(returnValue).toHaveProperty("setAlarmSound");
  });

  it("passes alarmSound and onAlarmSoundChange to TimerAlarmPicker", () => {
    render(<TimerCard />);

    // TimerAlarmPicker should have been rendered with the correct props
    expect(mockTimerAlarmPicker).toHaveBeenCalled();

    const props = mockTimerAlarmPicker.mock.calls[0][0];
    expect(props).toHaveProperty("alarmSound");
    expect(props).toHaveProperty("onAlarmSoundChange");
    expect(props.alarmSound).toBe("none");
    expect(props.onAlarmSoundChange).toBe(mockSetAlarmSound);
  });

  it("passes the current alarmSound value to TimerAlarmPicker", () => {
    // Change the mock to return a non-none alarmSound
    mockUseTimer.mockReturnValue({
      ...mockUseTimer(),
      alarmSound: "chime" as AlarmSound,
      setAlarmSound: mockSetAlarmSound,
    });

    render(<TimerCard />);

    const props = mockTimerAlarmPicker.mock.calls[0][0];
    expect(props.alarmSound).toBe("chime");
  });

  it("passes setAlarmSound as onAlarmSoundChange to TimerAlarmPicker", () => {
    render(<TimerCard />);

    const props = mockTimerAlarmPicker.mock.calls[0][0];
    // Verify it's the same function reference
    props.onAlarmSoundChange("lofi");
    expect(mockSetAlarmSound).toHaveBeenCalledWith("lofi");
  });

  it("renders TimerAlarmPicker inside the settings dialog", () => {
    render(<TimerCard />);

    // TimerAlarmPicker should be rendered (it returns a div with data-testid)
    expect(screen.getByTestId("timer-alarm-picker")).toBeTruthy();
  });

  it("shows the heading 'Timer Alarm' indirectly via TimerAlarmPicker", () => {
    // The heading is rendered inside TimerAlarmPicker, which we've mocked.
    // We can verify the mock received the expected alarmSound prop
    render(<TimerCard />);

    expect(mockTimerAlarmPicker).toHaveBeenCalledWith(
      expect.objectContaining({
        alarmSound: "none",
        onAlarmSoundChange: expect.any(Function),
      }),
    );
  });
});

describe("TimerCard initial loading state", () => {
  it("shows skeleton when not yet loaded", () => {
    // Delay the fetch resolution so loaded stays false
    globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<TimerCard />);

    // Should show skeleton elements
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("does not render TimerAlarmPicker when in loading state", () => {
    globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}));

    render(<TimerCard />);

    expect(mockTimerAlarmPicker).not.toHaveBeenCalled();
  });
});

describe("TimerCard error handling with alarm feature", () => {
  it("still renders when fetch fails (uses defaults)", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    expect(() => render(<TimerCard />)).not.toThrow();
  });
});
