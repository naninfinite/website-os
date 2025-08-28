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
  resetEraPreview?: () => void;
  userPrefs: {
    theme: 'light' | 'dark' | 'auto';
    reducedMotion: boolean; // legacy
    respectReducedMotion?: boolean; // when true (default), follow OS prefers-reduced-motion
    highContrast: boolean;
    gestureDismiss: boolean;
    wallpaper: string | null;
    devEraOverride?: EraId | null; // preview override when not forced
    showArcadeFps?: boolean;
  };
  updatePrefs: (partial: Partial<{
    theme: 'light' | 'dark' | 'auto';
    reducedMotion: boolean;
    respectReducedMotion?: boolean;
    highContrast: boolean;
    gestureDismiss: boolean;
    wallpaper: string | null;
    devEraOverride?: EraId | null;
    showArcadeFps?: boolean;
  }>) => void;
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
  const [userPrefs, setUserPrefs] = useState<{
    theme: 'light' | 'dark' | 'auto';
    reducedMotion: boolean;
    respectReducedMotion?: boolean;
    highContrast: boolean;
    gestureDismiss: boolean;
    wallpaper: string | null;
    devEraOverride?: EraId | null;
    showArcadeFps?: boolean;
  }>(() => {
    try {
      const rawNew = localStorage.getItem('website-os:settings');
      const rawOld = localStorage.getItem('websiteos:prefs');
      const raw = rawNew ?? rawOld;
      if (!raw) return { theme: 'auto', reducedMotion: false, respectReducedMotion: true, highContrast: false, gestureDismiss: true, wallpaper: null, devEraOverride: null };
      const parsed = JSON.parse(raw) as any;
      return {
        theme: parsed?.theme === 'light' || parsed?.theme === 'dark' ? parsed.theme : 'auto',
        reducedMotion: Boolean(parsed?.reducedMotion),
        respectReducedMotion: parsed?.respectReducedMotion !== false,
        highContrast: Boolean(parsed?.highContrast),
        gestureDismiss: parsed?.gestureDismiss !== false,
        wallpaper: typeof parsed?.wallpaper === 'string' ? parsed.wallpaper : null,
        devEraOverride: (parsed?.devEraOverride === 'terminal-os' || parsed?.devEraOverride === 'os-91' || parsed?.devEraOverride === 'now-os') ? parsed.devEraOverride : null,
        showArcadeFps: Boolean(parsed?.showArcadeFps),
      };
    } catch {
      return { theme: 'auto', reducedMotion: false, respectReducedMotion: true, highContrast: false, gestureDismiss: true, wallpaper: null, devEraOverride: null, showArcadeFps: false };
    }
  });

  const compute = () => {
    if (schedule.length === 0) {
      setNextFlipMs(null);
      setNextEraId(null);
      if (!isForced) setEraId(userPrefs.devEraOverride ?? 'terminal-os');
      return;
    }
    const { active, next, msUntilFlip } = getActiveEra(new Date(), schedule);
    if (!isForced) setEraId(((userPrefs.devEraOverride ?? active?.id) as EraId) ?? 'terminal-os');
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
  }, [schedule, isForced, userPrefs.devEraOverride]);

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

  // Apply user preferences to body
  useEffect(() => {
    // theme override
    if (userPrefs.theme === 'auto') {
      delete document.body.dataset.theme;
    } else {
      document.body.dataset.theme = userPrefs.theme;
    }
    // motion: respectReducedMotion controls whether we follow OS preference; legacy reducedMotion forces reduction
    try {
      const prefersReduced = typeof window !== 'undefined' && 'matchMedia' in window && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const effectiveReduced = userPrefs.reducedMotion || (userPrefs.respectReducedMotion !== false ? prefersReduced : false);
      document.body.dataset.reduceMotion = effectiveReduced ? 'true' : 'false';
      document.body.classList.toggle('reduced-motion', effectiveReduced);
    } catch {
      // fallback: use legacy flag
      document.body.dataset.reduceMotion = userPrefs.reducedMotion ? 'true' : 'false';
      document.body.classList.toggle('reduced-motion', !!userPrefs.reducedMotion);
    }
    // contrast
    document.body.classList.toggle('high-contrast', !!userPrefs.highContrast);
    // wallpaper classes
    document.body.classList.remove('wallpaper-crt', 'wallpaper-os91', 'wallpaper-now');
    if (userPrefs.wallpaper) document.body.classList.add(`wallpaper-${userPrefs.wallpaper}`);
    try {
      localStorage.setItem('website-os:settings', JSON.stringify(userPrefs));
    } catch {
      // ignore
    }
  }, [userPrefs]);

  const updatePrefs: EraContextValue['updatePrefs'] = (partial) => {
    setUserPrefs((prev) => ({ ...prev, ...partial }));
  };

  const setEraForDev = (id: EraId) => {
    if (isForced) return; // when forced by env, preview is disabled
    setUserPrefs((prev) => ({ ...prev, devEraOverride: id }));
    setEraId(id);
  };

  const resetEraPreview = () => {
    setUserPrefs((prev) => ({ ...prev, devEraOverride: null }));
    compute();
  };

  const value = useMemo<EraContextValue>(
    () => ({ eraId, schedule, nextFlipMs, nextEraId, isForced, flipping, refreshSchedule, setEraForDev, resetEraPreview, userPrefs, updatePrefs }),
    [eraId, schedule, nextFlipMs, nextEraId, isForced, flipping, userPrefs]
  );

  return <EraContext.Provider value={value}>{props.children}</EraContext.Provider>;
}


