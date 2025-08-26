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


