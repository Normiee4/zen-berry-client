"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResponsive } from "@/hooks/useResponsive";
import { useTimer } from "@/hooks/useTimer";
import { useTimerLogic } from '@/lib/timer-logic';
import { useTimerStore } from "@/store/timer-store";
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Pause, Play, Plus, Pencil, RotateCcw, Settings, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";


export function TimerCard() {
  useTimerLogic();
  const queryClient = useQueryClient()
  const [loaded, setLoaded] = useState(false)
  const {
    mode,
    timeLeft,
    isRunning,
    presets,
    activePreset,
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
  } = useTimer();

  useEffect(() => {
    const loadTimerState = async () => {
      try {
        const response = await fetch('/api/timer-service');
        if (!response.ok) return;
        const data = await response.json();
        if (data.presets?.length) {
          loadPresets(data.presets);
        }
        if (data.streak && (data.streak.currentStreak > 0 || data.streak.pomodorosToday > 0)) {
          loadStats(data.streak);
        }
      } catch {
        // ignore load failures
      } finally {
        setLoaded(true);
      }
    };

    loadTimerState();
  }, [loadPresets, loadStats]);

  useEffect(() => {
    if (!completedFocusCycle) return;

    const recordCompletion = async () => {
      try {
        const state = useTimerStore.getState()
        const res = await fetch('/api/timer-service', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'recordCompletion',
            durationMinutes: state.currentPreset?.focusMinutes ?? 25,
            presetUsed: state.currentPreset?.name ?? 'Classic Pomodoro',
          }),
        })
        if (res.ok) {
          queryClient.invalidateQueries({ queryKey: ['analytics-summary'] })
          queryClient.invalidateQueries({ queryKey: ['ai-insights-latest'] })
          queryClient.invalidateQueries({ queryKey: ['analytics-milestones'] })
        } else {
          console.error('Failed to record session:', await res.text())
          toast.error('Session not recorded — check your connection')
        }
      } catch (e) {
        console.error('Failed to record session:', e)
        toast.error('Session not recorded — check your connection')
      } finally {
        clearCompletedFocusCycle();
      }
    };

    recordCompletion();
  }, [completedFocusCycle, clearCompletedFocusCycle, queryClient]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && useTimerStore.getState().completedFocusCycle) {
        toast.success('Focus session completed while you were away! 🎉')
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newFocusMinutes, setNewFocusMinutes] = useState(25);
  const [newBreakMinutes, setNewBreakMinutes] = useState(5);

  const [editingPreset, setEditingPreset] = useState<{ id: string; name: string; focusMinutes: number; breakMinutes: number } | null>(null);

  const totalSeconds = useMemo(
    () =>
      (mode === "focus" ? activePreset.focusMinutes : activePreset.breakMinutes) * 60,
    [activePreset, mode]
  );

  const progress = useMemo(() => {
    if (totalSeconds === 0) return 0;
    return Math.round(((totalSeconds - timeLeft) / totalSeconds) * 100);
  }, [timeLeft, totalSeconds]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(timeLeft % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [timeLeft]);

  const { isMobile, isTablet } = useResponsive();
  const chartSize = isMobile ? 180 : isTablet ? 210 : 240;
  const chartCenter = chartSize / 2;
  const chartInnerRadius = chartSize * 0.35;
  const chartOuterRadius = chartSize * 0.45;
  const chartBarSize = isMobile ? 12 : 16;

  const chartData = [
    {
      name: "progress",
      value: progress,
      fill: mode === "focus" ? "#FFCFCF" : "#86A788",
    },
  ];

  const handleEditPreset = async () => {
    if (!editingPreset || !editingPreset.name.trim()) return

    try {
      await fetch('/api/timer-service', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePreset',
          presetId: editingPreset.id,
          name: editingPreset.name,
          focusMinutes: editingPreset.focusMinutes,
          breakMinutes: editingPreset.breakMinutes,
        }),
      })
      updatePreset(editingPreset.id, {
        name: editingPreset.name,
        focusMinutes: editingPreset.focusMinutes,
        breakMinutes: editingPreset.breakMinutes,
      })
      setEditingPreset(null)
      toast.success('Preset updated')
    } catch {
      toast.error('Failed to update preset')
    }
  }

  const handleDeletePreset = async (presetId: string, presetName: string) => {
    try {
      await fetch('/api/timer-service', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deletePreset', presetId }),
      })
      deletePreset(presetId)
      toast.success(`"${presetName}" deleted`)
    } catch {
      toast.error('Failed to delete preset')
    }
  }

  const handleAddPreset = async () => {
    if (!newPresetName.trim()) return;

    const presetPayload = {
      name: newPresetName,
      focusMinutes: newFocusMinutes,
      breakMinutes: newBreakMinutes,
    };

    addPreset(presetPayload);
    setNewPresetName("");
    setNewFocusMinutes(25);
    setNewBreakMinutes(5);

    try {
      await fetch('/api/timer-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(presetPayload),
      });
    } catch {
      // ignore save failure for now
    }
  };

  if (!loaded) {
    return (
      <div className="flex min-h-0 flex-col rounded-3xl bg-strawberry-light/30 p-6 overflow-hidden border border-matcha-dark/20">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-8 w-48 rounded-full" />
          <Skeleton className="size-60 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-col rounded-3xl bg-strawberry-light/30 p-6 overflow-hidden border border-matcha-dark/20">
      {/* Mode Toggle */}
      <div className="mx-auto mb-6 flex gap-2">
        <button
          onClick={() => setMode("focus")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium cursor-pointer transition-colors ${
            mode === "focus"
              ? "bg-matcha text-white"
              : "bg-white/60 text-foreground hover:bg-white/80"
          }`}
        >
          <span className="text-base">🌱</span>
          Focus
        </button>
        <button
          onClick={() => setMode("break")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            mode === "break"
              ? "bg-strawberry text-foreground"
              : "bg-white/60 text-foreground hover:bg-white/80"
          }`}
        >
          <span className="text-base">🍓</span>
          Break
        </button>
      </div>

      {/* Circular Timer */}
      <div className="relative mx-auto mb-4 flex w-full max-w-65 items-center justify-center">
        <RadialBarChart
          width={chartSize}
          height={chartSize}
          cx={chartCenter}
          cy={chartCenter}
          innerRadius={chartInnerRadius}
          outerRadius={chartOuterRadius}
          barSize={chartBarSize}
          data={chartData}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar
            background={{ fill: mode === "focus" ? "#FFE2E2" : "#B8D4B8" }}
            dataKey="value"
            cornerRadius={10}
            angleAxisId={0}
            isAnimationActive={true}
            animationDuration={600}
          />
        </RadialBarChart>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-4xl font-bold text-primary">{formattedTime}</span>
          <span className="mt-1 text-sm text-muted-foreground">
            {mode === "focus" ? "Time to focus" : "Take a break"}
          </span>
        </div>
      </div>

      {/* Matcha Cup Icon */}
      <div className="mx-auto mb-6">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="8" y="12" width="24" height="20" rx="4" fill="#B8D4B8" />
          <rect x="10" y="14" width="20" height="16" rx="3" fill="#86A788" />
          <circle cx="15" cy="22" r="1.5" fill="#2D3A2D" />
          <circle cx="25" cy="22" r="1.5" fill="#2D3A2D" />
          <path
            d="M18 26 Q20 28 22 26"
            stroke="#2D3A2D"
            strokeWidth="1.5"
            strokeLinecap="round"
            fill="none"
          />
          <ellipse cx="20" cy="12" rx="10" ry="2" fill="#B8D4B8" />
        </svg>
      </div>

      {/* Controls */}
      <div className="mx-auto flex flex-wrap items-center justify-center gap-3">
        <Button
          onClick={toggle}
          className="gap-2 rounded-full bg-matcha px-6 text-white hover:bg-matcha/90 cursor-pointer"
        >
          {isRunning ? (
            <>
              <Pause className="size-4" fill="currentColor" />
              Pause
            </>
          ) : (
            <>
              <Play className="size-4" fill="currentColor" />
              Start
            </>
          )}
        </Button>
        <Button
          onClick={reset}
          size="icon"
          variant="outline"
          className="size-10 rounded-full border-border bg-white/60 hover:bg-white cursor-pointer"
          aria-label="Reset timer"
        >
          <RotateCcw className="size-4 text-foreground" />
        </Button>
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="size-10 rounded-full border-border bg-white/60 hover:bg-white cursor-pointer"
            >
              <Settings className="size-4 text-foreground" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white p-0 max-h-[90dvh] overflow-y-auto">
            <DialogHeader className="flex flex-row items-center justify-between border-b border-border p-6 pb-4">
              <DialogTitle className="text-lg font-semibold">Timer Settings</DialogTitle>
            </DialogHeader>

            <div className="p-6 pt-4">
              {/* Presets */}
              <div className="mb-6">
                <h4 className="mb-4 text-sm font-medium text-muted-foreground">Presets</h4>
                <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
                  {presets.map((preset) => (
                    <div
                      key={preset.id}
                      className={`flex items-center rounded-lg border p-4 transition-colors ${
                        activePreset.id === preset.id
                          ? "border-l-4 border-l-matcha border-t-matcha-light/50 border-r-matcha-light/50 border-b-matcha-light/50 bg-matcha-light/20"
                          : "border-border hover:bg-cream/50"
                      }`}
                    >
                      <button
                        onClick={() => setPreset(preset.id)}
                        className="flex-1 text-left"
                      >
                        <span className="font-medium text-foreground">{preset.name}</span>
                        <span className="mt-1 block text-sm text-muted-foreground">
                          {preset.focusMinutes}min focus / {preset.breakMinutes}min break
                        </span>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setEditingPreset({
                              id: preset.id,
                              name: preset.name,
                              focusMinutes: preset.focusMinutes,
                              breakMinutes: preset.breakMinutes,
                            })
                          }
                          className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-matcha-light/30 hover:text-matcha transition-colors"
                          title="Edit preset"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {!preset.isDefault && (
                          <button
                            onClick={() => handleDeletePreset(preset.id, preset.name)}
                            className="flex size-8 items-center justify-center rounded-full text-red-400 hover:bg-red-100 transition-colors"
                            title="Delete preset"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Create New Preset */}
              <div className="rounded-lg border border-border p-4">
                <h4 className="mb-4 font-medium text-foreground">Create New Preset</h4>
                <div className="mb-4">
                  <Label htmlFor="preset-name" className="mb-2 block text-sm text-muted-foreground">
                    Preset Name
                  </Label>
                  <Input
                    id="preset-name"
                    placeholder="My Custom Timer"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="border-border bg-white"
                  />
                </div>
                <div className="mb-4 grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="focus-min" className="mb-2 block text-sm text-muted-foreground">
                      Focus (minutes)
                    </Label>
                    <Input
                      id="focus-min"
                      type="number"
                      value={newFocusMinutes}
                      onChange={(e) => setNewFocusMinutes(Number(e.target.value))}
                      className="border-border bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="break-min" className="mb-2 block text-sm text-muted-foreground">
                      Break (minutes)
                    </Label>
                    <Input
                      id="break-min"
                      type="number"
                      value={newBreakMinutes}
                      onChange={(e) => setNewBreakMinutes(Number(e.target.value))}
                      className="border-border bg-white"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddPreset}
                  className="w-full bg-matcha-light text-matcha hover:bg-matcha-light/80"
                >
                  <Plus className="mr-2 size-4" />
                  Add Preset
                </Button>
              </div>

              {/* Edit Preset Dialog */}
              <Dialog open={editingPreset !== null} onOpenChange={(open) => { if (!open) setEditingPreset(null) }}>
                <DialogContent className="max-w-md bg-white p-0 max-h-[90dvh] overflow-y-auto">
                  <DialogHeader className="flex flex-row items-center justify-between border-b border-border p-6 pb-4">
                    <DialogTitle className="text-lg font-semibold">Edit Preset</DialogTitle>
                  </DialogHeader>
                  <div className="p-6 pt-4">
                    <div className="mb-4">
                      <Label className="mb-2 block text-sm text-muted-foreground">Preset Name</Label>
                      <Input
                        value={editingPreset?.name ?? ''}
                        onChange={(e) => setEditingPreset((prev) => prev ? { ...prev, name: e.target.value } : null)}
                        className="border-border bg-white"
                      />
                    </div>
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="mb-2 block text-sm text-muted-foreground">Focus (minutes)</Label>
                        <Input
                          type="number"
                          value={editingPreset?.focusMinutes ?? 25}
                          onChange={(e) => setEditingPreset((prev) => prev ? { ...prev, focusMinutes: Number(e.target.value) } : null)}
                          className="border-border bg-white"
                        />
                      </div>
                      <div>
                        <Label className="mb-2 block text-sm text-muted-foreground">Break (minutes)</Label>
                        <Input
                          type="number"
                          value={editingPreset?.breakMinutes ?? 5}
                          onChange={(e) => setEditingPreset((prev) => prev ? { ...prev, breakMinutes: Number(e.target.value) } : null)}
                          className="border-border bg-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setEditingPreset(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditPreset}
                        className="flex-1 bg-matcha hover:bg-matcha/90 text-white"
                      >
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}