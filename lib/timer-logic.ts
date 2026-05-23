import { useEffect } from 'react';
import { useTimerStore } from '../store/timer-store';

export function useTimerLogic() {
  const isRunning = useTimerStore((state) => state.isRunning);
  const tick = useTimerStore((state) => state.tick);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      tick();
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);
}