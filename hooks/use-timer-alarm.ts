import { useEffect } from "react";
import { useTimerStore } from "@/store/timer-store";
import { audioManager } from "@/lib/audio-manager";

export function useTimerAlarm() {
  useEffect(() => {
    audioManager.init();

    return () => {
      audioManager.stopKeepAlive();
    };
  }, []);

  useEffect(() => {
    const unsub = useTimerStore.subscribe(
      (state) => state.isRunning,
      (isRunning) => {
        if (isRunning) {
          audioManager.startKeepAlive();
        } else {
          audioManager.stopKeepAlive();
        }
      },
    );
    return () => unsub();
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
