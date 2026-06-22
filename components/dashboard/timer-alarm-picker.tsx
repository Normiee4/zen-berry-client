"use client";

import { useState, useRef } from "react";
import { Volume2, VolumeX } from "lucide-react";
import type { AlarmSound } from "@/store/timer-store";

const SOUND_OPTIONS: { value: AlarmSound; label: string }[] = [
  { value: "none", label: "None" },
  { value: "bell", label: "Bell" },
  { value: "chime", label: "Chime" },
  { value: "digital", label: "Digital" },
  { value: "lofi", label: "Lo-fi" },
];

const AUDIO_FILES: Record<Exclude<AlarmSound, "none">, string> = {
  bell: "/audio/bell_alarm.mp3",
  chime: "/audio/chime_alarm.mp3",
  digital: "/audio/digital_alarm.mp3",
  lofi: "/audio/lofi_alarm.mp3",
};

interface TimerAlarmPickerProps {
  alarmSound: AlarmSound;
  onAlarmSoundChange: (sound: AlarmSound) => void;
}

export function TimerAlarmPicker({ alarmSound, onAlarmSoundChange }: TimerAlarmPickerProps) {
  const [previewing, setPreviewing] = useState<AlarmSound | null>(null);
  const previewRef = useRef<HTMLAudioElement | null>(null);
  const previewTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePreview = (sound: Exclude<AlarmSound, "none">) => {
    if (previewTimerRef.current) {
      clearTimeout(previewTimerRef.current);
      previewTimerRef.current = null;
    }
    if (previewRef.current) {
      previewRef.current.pause();
      previewRef.current.currentTime = 0;
      previewRef.current = null;
    }
    if (previewing === sound) {
      setPreviewing(null);
      return;
    }
    const src = AUDIO_FILES[sound];
    if (!src) return;
    const audio = new Audio(src);
    audio.volume = 0.3;
    previewRef.current = audio;
    audio.play().catch(() => {
      setPreviewing(null);
    });
    setPreviewing(sound);
    previewTimerRef.current = setTimeout(() => {
      if (previewRef.current) {
        previewRef.current.pause();
        previewRef.current.currentTime = 0;
        previewRef.current = null;
      }
      setPreviewing(null);
    }, 3000);
  };

  return (
    <div className="mb-6">
      <h4 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Volume2 className="size-4" />
        Timer Alarm
      </h4>
      <div className="flex flex-col gap-2">
        {SOUND_OPTIONS.map((option) => (
          <div
            key={option.value}
            className={`flex items-center rounded-lg border p-4 transition-colors ${
              alarmSound === option.value
                ? "border-l-4 border-l-matcha border-t-matcha-light/50 border-r-matcha-light/50 border-b-matcha-light/50 bg-matcha-light/20"
                : "border-border hover:bg-cream/50"
            }`}
          >
            <button
              onClick={() => onAlarmSoundChange(option.value)}
              className="flex-1 text-left"
            >
              {option.value !== "none" && (
                <Volume2 className="mr-2 inline size-3.5 text-muted-foreground/60" />
              )}
              <span className="font-medium text-foreground">{option.label}</span>
            </button>
            {option.value !== "none" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreview(option.value as Exclude<AlarmSound, "none">);
                }}
                className="flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-matcha-light/30 hover:text-matcha transition-colors"
                title={previewing === option.value ? "Stop preview" : "Preview sound"}
                aria-label={previewing === option.value ? "Stop preview" : "Preview sound"}
              >
                {previewing === option.value ? (
                  <VolumeX className="size-4" />
                ) : (
                  <Volume2 className="size-4" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
