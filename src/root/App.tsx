/**
 * SUMMARY
 * Temporary root shell placeholder. Verifies Vite+React scaffold works. Later
 * replaced by era-aware shell + layout profiles. Avoid era logic here.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { loadEraSchedule, getActiveEra } from '../services/schedule';
import { CountdownBadge } from '../components/CountdownBadge';
import { layoutProfiles, type EraId } from '../shell/layoutProfiles';
import { WindowManager } from '../shell/windowing/WindowManager';
import { MobileHome } from '../shell/mobile/Home';
import { AppContainerPage } from '../shell/mobile/AppContainerPage';
import type { AppId } from '../shell/app-registry/types';

export function App(): JSX.Element {
  const scheduleUrl = import.meta.env.VITE_ERA_SCHEDULE_URL ?? '/era-schedule.json';
  const [nextFlipMs, setNextFlipMs] = useState<number | null>(null);
  const [activeEraId, setActiveEraId] = useState<EraId | null>(null);
  const [mobileApp, setMobileApp] = useState<AppId | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const schedule = await loadEraSchedule(scheduleUrl);
        if (cancelled) return;
        const { active, msUntilFlip } = getActiveEra(new Date(), schedule);
        setActiveEraId((active?.id as EraId) ?? null);
        setNextFlipMs(msUntilFlip != null ? Date.now() + msUntilFlip : null);
      } catch (err) {
        // Silently ignore here; the shell will surface errors later.
        setActiveEraId(null);
        setNextFlipMs(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scheduleUrl]);

  const handleFlip = () => {
    // Placeholder: real implementation will trigger reboot overlay and reload
    // era shell skin without full refresh.
    setActiveEraId((prev) => prev);
  };

  const isMobile = typeof window !== 'undefined' && matchMedia('(max-width: 768px)').matches;
  const mobileHomeMode = activeEraId ? layoutProfiles[activeEraId].mobile.homeMode : 'list';

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="p-3 flex items-center justify-between">
        <div className="text-sm opacity-70">Active era: {activeEraId ?? 'unknown'}</div>
        <CountdownBadge targetEpochMs={nextFlipMs} onFlip={handleFlip} />
      </div>
      {isMobile ? (
        mobileApp ? (
          <AppContainerPage appId={mobileApp} onBack={() => setMobileApp(null)} />
        ) : (
          <MobileHome mode={mobileHomeMode} onOpen={(id) => setMobileApp(id)} />
        )
      ) : (
        <WindowManager />
      )}
    </div>
  );
}


