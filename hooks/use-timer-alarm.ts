import { useEffect, useRef } from "react";
import { useTimerStore, type AlarmSound } from "@/store/timer-store";

const AUDIO_FILES: Record<Exclude<AlarmSound, "none">, string> = {
  bell: "/audio/bell_alarm.mp3",
  chime: "/audio/chime_alarm.mp3",
  digital: "/audio/digital_alarm.mp3",
  lofi: "/audio/lofi_alarm.mp3",
};

const ALARM_DURATIONS: Record<Exclude<AlarmSound, "none">, number> = {
  bell: 6000,
  chime: 4000,
  digital: 4000,
  lofi: 9000,
};

const MAX_ALARM_DURATION_MS = Math.max(...Object.values(ALARM_DURATIONS));

function playAlarm(sound: AlarmSound) {
  if (sound === "none") return;
  const src = AUDIO_FILES[sound];
  if (!src) return;
  const duration = ALARM_DURATIONS[sound];

  const audio = new Audio(src);
  audio.volume = 0.5;
  audio.play().catch(() => {});

  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, duration);
}

export function useTimerAlarm() {
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const unsub = useTimerStore.subscribe(
      (state) => state.timerJustCompleted,
      (justCompleted) => {
        if (!justCompleted || isPlayingRef.current) return;

        isPlayingRef.current = true;
        playAlarm(useTimerStore.getState().alarmSound);
        useTimerStore.setState({ timerJustCompleted: false });

        setTimeout(() => {
          isPlayingRef.current = false;
        }, MAX_ALARM_DURATION_MS);
      },
    );
    return () => unsub();
  }, []);
}
