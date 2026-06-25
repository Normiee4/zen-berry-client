import { useEffect } from "react";
import { useTimerStore } from "@/store/timer-store";
import { audioManager } from "@/lib/audio-manager";

export function useTimerAlarm() {
  useEffect(() => {
    audioManager.init();
  }, []);

  useEffect(() => {
    const unsub = useTimerStore.subscribe(
      (state) => state.timerJustCompleted,
      (justCompleted) => {
        if (!justCompleted || audioManager.getIsPlaying()) return;

        audioManager.play(useTimerStore.getState().alarmSound);
        useTimerStore.setState({ timerJustCompleted: false });
      },
    );
    return () => unsub();
  }, []);
}
