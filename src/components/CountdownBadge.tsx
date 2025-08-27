/**
 * SUMMARY
 * Countdown badge that shows next era and remaining time. Supports refresh and
 * dev override display. Uses EraProvider context.
 */
import React, { useMemo, useState } from 'react';
import { useEra } from '../shell/era/EraContext';

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const dd = Math.floor(total / 86400);
  const hh = Math.floor((total % 86400) / 3600).toString().padStart(2, '0');
  const mm = Math.floor((total % 3600) / 60).toString().padStart(2, '0');
  const ss = Math.floor(total % 60).toString().padStart(2, '0');
  return dd > 0 ? `${dd}d ${hh}:${mm}:${ss}` : `${hh}:${mm}:${ss}`;
}

export function CountdownBadge(): JSX.Element | null {
  const { eraId, nextEraId, nextFlipMs, isForced, refreshSchedule } = useEra();
  const [justRefreshed, setJustRefreshed] = useState(false);

  const label = useMemo(() => {
    if (isForced) return `Dev: ${eraId} (override)`;
    if (!nextEraId || nextFlipMs == null) return null;
    return `Next: ${nextEraId} in ${formatRemaining(nextFlipMs)}`;
  }, [isForced, eraId, nextEraId, nextFlipMs]);

  if (!label) return null;

  return (
    <button
      className="countdown-badge"
      aria-label="Refresh schedule"
      onClick={async () => {
        await refreshSchedule();
        setJustRefreshed(true);
        window.setTimeout(() => setJustRefreshed(false), 800);
      }}
      title="Click to refresh schedule"
    >
      {justRefreshed ? 'Refreshed ✓ ' : ''}{label}
    </button>
  );
}

/**
 * SUMMARY
 * Small countdown badge showing remaining time (hh:mm:ss). Emits flip via
 * provided callback when countdown hits zero.
 */
import React from 'react';
import { useCountdown } from '../hooks/useCountdown';

export function CountdownBadge(props: { targetEpochMs: number | null; onFlip?: () => void }): JSX.Element | null {
  const { targetEpochMs, onFlip } = props;
  const { remainingMs } = useCountdown(targetEpochMs, { onEraFlip: onFlip });
  if (remainingMs == null) return null;

  const total = Math.ceil(remainingMs / 1000);
  const hours = Math.floor(total / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor((total % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const seconds = Math.floor(total % 60)
    .toString()
    .padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-foreground/10 px-3 py-1 text-xs">
      <span className="opacity-70">Era flips in</span>
      <span className="font-mono tabular-nums">{hours}:{minutes}:{seconds}</span>
    </div>
  );
}


