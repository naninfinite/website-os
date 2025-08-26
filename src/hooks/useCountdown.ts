/**
 * SUMMARY
 * React hook providing countdown to era flip. Polls time with interval and
 * invokes onEraFlip when time reaches zero or passes. Purely client-side.
 */
import { useEffect, useRef, useState } from 'react';

export function useCountdown(targetEpochMs: number | null, opts?: { onEraFlip?: () => void; tickMs?: number }) {
  const tickMs = opts?.tickMs ?? 1000;
  const onEraFlip = opts?.onEraFlip;
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const firedRef = useRef(false);

  useEffect(() => {
    if (targetEpochMs == null) {
      setRemainingMs(null);
      return;
    }
    firedRef.current = false;
    const update = () => {
      const now = Date.now();
      const remain = Math.max(0, targetEpochMs - now);
      setRemainingMs(remain);
      if (remain <= 0 && !firedRef.current) {
        firedRef.current = true;
        onEraFlip?.();
      }
    };
    update();
    const id = window.setInterval(update, tickMs);
    return () => window.clearInterval(id);
  }, [targetEpochMs, tickMs, onEraFlip]);

  return { remainingMs } as const;
}


