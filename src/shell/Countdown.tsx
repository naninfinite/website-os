/**
 * SUMMARY
 * Countdown placeholder for Chunk 1. Reads VITE_ERA_SCHEDULE_URL and renders
 * a simple badge. Accepts { currentEra, onEraFlip } but does not flip yet.
 */
import React, { useEffect, useState } from 'react';
import type { Era } from '../themes/layoutProfiles';

export function Countdown(props: { currentEra: Era; onEraFlip?: (nextEra: Era) => void }): JSX.Element {
  const url = import.meta.env.VITE_ERA_SCHEDULE_URL ?? '/era-schedule.json';
  const [visibleUrl, setVisibleUrl] = useState<string>('');
  useEffect(() => {
    // For now, we just show the URL; network logic comes later.
    setVisibleUrl(String(url));
  }, [url]);

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-token bg-surface-2" style={{ color: 'rgb(var(--text))' }}>
      <span>T-minus…</span>
      <span style={{ opacity: 0.7 }}>(schedule: {visibleUrl})</span>
    </div>
  );
}


