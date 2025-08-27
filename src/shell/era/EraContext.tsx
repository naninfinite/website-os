/**
 * SUMMARY
 * Era context/provider: loads schedule (or uses VITE_FORCE_ERA) to expose the
 * active era and next flip info. Applies body[data-era] and theme classes on
 * change.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadEraSchedule, getActiveEra } from '../../services/schedule';

export type EraId = 'terminal-os' | 'os-91' | 'now-os';

export type EraContextValue = {
  eraId: EraId;
  next?: string | null;
  msUntilFlip?: number | null;
};

const EraContext = createContext<EraContextValue | null>(null);

export function useEra(): EraContextValue {
  const ctx = useContext(EraContext);
  if (!ctx) throw new Error('useEra must be used within EraProvider');
  return ctx;
}

export function EraProvider(props: { children: React.ReactNode }): JSX.Element {
  const scheduleUrl = import.meta.env.VITE_ERA_SCHEDULE_URL ?? '/era-schedule.json';
  const forced = (import.meta.env.VITE_FORCE_ERA as EraId | undefined) ?? undefined;
  const [eraId, setEraId] = useState<EraId>((forced as EraId) ?? 'terminal-os');
  const [msUntilFlip, setMsUntilFlip] = useState<number | null>(null);
  const [next, setNext] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (forced) {
        setEraId(forced);
        setMsUntilFlip(null);
        setNext(null);
        return;
      }
      try {
        const schedule = await loadEraSchedule(scheduleUrl);
        if (cancelled) return;
        const now = new Date();
        const { active, next, msUntilFlip } = getActiveEra(now, schedule);
        setEraId((active?.id as EraId) ?? 'terminal-os');
        setMsUntilFlip(msUntilFlip);
        setNext(next?.id ?? null);
      } catch {
        if (!cancelled) {
          setEraId('terminal-os');
          setMsUntilFlip(null);
          setNext(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scheduleUrl, forced]);

  useEffect(() => {
    // Apply theme tokens and data attributes
    const cls = eraId === 'terminal-os' ? 'theme-terminal' : eraId === 'os-91' ? 'theme-os91' : 'theme-now';
    document.body.classList.remove('theme-terminal', 'theme-os91', 'theme-now');
    document.body.classList.add(cls);
    document.body.dataset.era = eraId;
    return () => {
      // no-op cleanup on unmount
    };
  }, [eraId]);

  const value = useMemo<EraContextValue>(() => ({ eraId, next, msUntilFlip }), [eraId, next, msUntilFlip]);

  return <EraContext.Provider value={value}>{props.children}</EraContext.Provider>;
}


