/**
 * SUMMARY
 * Era context/provider: loads schedule (or uses VITE_FORCE_ERA) to expose the
 * active era, schedule, next flip info, and a flip overlay trigger. Applies
 * body[data-era] and theme classes on change.
 */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { loadEraSchedule, getActiveEra } from '../../services/schedule';

export type EraId = 'terminal-os' | 'os-91' | 'now-os';

export type EraContextValue = {
  eraId: EraId;
  schedule: { id: string; start: string; end: string }[];
  nextFlipMs: number | null;
  nextEraId: string | null;
  isForced: boolean;
  flipping: boolean;
  refreshSchedule: () => Promise<void>;
  setEraForDev?: (id: EraId) => void;
};

const EraContext = createContext<EraContextValue | null>(null);

export function useEra(): EraContextValue {
  const ctx = useContext(EraContext);
  if (!ctx) throw new Error('useEra must be used within EraProvider');
  return ctx;
}

export function EraProvider(props: { children: React.ReactNode }): JSX.Element {
  const scheduleUrl = import.meta.env.VITE_ERA_SCHEDULE_URL ?? '/era-schedule.json';
  const forcedEnv = (import.meta.env.VITE_FORCE_ERA as EraId | undefined) ?? undefined;
  const isForced = Boolean(forcedEnv);

  const [eraId, setEraId] = useState<EraId>((forcedEnv as EraId) ?? 'terminal-os');
  const [schedule, setSchedule] = useState<{ id: string; start: string; end: string }[]>([]);
  const [nextFlipMs, setNextFlipMs] = useState<number | null>(null);
  const [nextEraId, setNextEraId] = useState<string | null>(null);
  const [flipping, setFlipping] = useState<boolean>(false);
  const tickRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);

  const compute = () => {
    if (schedule.length === 0) {
      setNextFlipMs(null);
      setNextEraId(null);
      if (!isForced) setEraId('terminal-os');
      return;
    }
    const { active, next, msUntilFlip } = getActiveEra(new Date(), schedule);
    if (!isForced) setEraId((active?.id as EraId) ?? 'terminal-os');
    setNextFlipMs(msUntilFlip);
    setNextEraId(next?.id ?? null);
  };

  const refreshSchedule = async () => {
    try {
      const s = await loadEraSchedule(scheduleUrl);
      setSchedule(s);
    } catch {
      // leave previous schedule; next compute will keep prior state
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await refreshSchedule();
      if (!cancelled) compute();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleUrl]);

  // Recompute when schedule changes
  useEffect(() => {
    compute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schedule, isForced]);

  // 1s tick to update countdown; 60s poll to refresh schedule
  useEffect(() => {
    tickRef.current = window.setInterval(() => {
      if (isForced) return; // still show badge but we won't auto flip
      if (schedule.length === 0) return;
      const { msUntilFlip } = getActiveEra(new Date(), schedule);
      setNextFlipMs(msUntilFlip);
    }, 1000);
    pollRef.current = window.setInterval(() => {
      void refreshSchedule();
    }, 60000);
    return () => {
      if (tickRef.current) window.clearInterval(tickRef.current);
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleUrl, schedule, isForced]);

  // Auto flip when reaching zero (not when forced)
  useEffect(() => {
    if (isForced) return;
    if (nextFlipMs != null && nextFlipMs <= 0 && nextEraId) {
      setFlipping(true);
      const prefersReduced = typeof window !== 'undefined' && 'matchMedia' in window && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const timeout = window.setTimeout(() => {
        setEraId(nextEraId as EraId);
        setFlipping(false);
        compute();
      }, prefersReduced ? 0 : 900);
      return () => window.clearTimeout(timeout);
    }
  }, [nextFlipMs, nextEraId, isForced]);

  // Apply theme tokens and data attributes
  useEffect(() => {
    const cls = eraId === 'terminal-os' ? 'theme-terminal' : eraId === 'os-91' ? 'theme-os91' : 'theme-now';
    document.body.classList.remove('theme-terminal', 'theme-os91', 'theme-now');
    document.body.classList.add(cls);
    document.body.dataset.era = eraId;
  }, [eraId]);

  const setEraForDev = (id: EraId) => {
    if (!isForced) return;
    setEraId(id);
  };

  const value = useMemo<EraContextValue>(
    () => ({ eraId, schedule, nextFlipMs, nextEraId, isForced, flipping, refreshSchedule, setEraForDev }),
    [eraId, schedule, nextFlipMs, nextEraId, isForced, flipping]
  );

  return <EraContext.Provider value={value}>{props.children}</EraContext.Provider>;
}


