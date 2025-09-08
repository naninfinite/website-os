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

export function CountdownBadge(props: { variant?: 'badge' | 'inline' } = {}): JSX.Element | null {
  /**
   * SUMMARY
   * Countdown badge/label that shows the next era and remaining time. Default
   * renders as a fixed "badge" in the corner; when `variant="inline"` it
   * renders inline for embedding in headers (e.g., HomeDashboard header card).
   * Uses EraProvider context and supports manual refresh on click.
   */
  const { variant = 'badge' } = props;
  const { eraId, nextEraId, nextFlipMs, isForced, refreshSchedule } = useEra();
  const [justRefreshed, setJustRefreshed] = useState(false);

  const label = useMemo(() => {
    if (isForced) return `Dev: ${eraId} (override)`;
    if (!nextEraId || nextFlipMs == null) return null;
    return `Next: ${nextEraId} in ${formatRemaining(nextFlipMs)}`;
  }, [isForced, eraId, nextEraId, nextFlipMs]);

  if (!label) return null;

  if (variant === 'inline') {
    return (
      <button
        className="text-xs px-2 py-1 rounded bg-foreground/10 hover:bg-foreground/20 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
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



