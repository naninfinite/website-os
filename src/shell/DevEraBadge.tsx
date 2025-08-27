/**
 * SUMMARY
 * Small dev-only badge that shows the current era in the corner.
 */
import React from 'react';
import { useEra } from './era/EraContext';

export function DevEraBadge(): JSX.Element | null {
  if (!import.meta.env.DEV) return null;
  const { eraId } = useEra();
  return (
    <div className="fixed bottom-2 right-2 px-2 py-1 rounded-token bg-foreground/10 text-xs">
      era: {eraId}
    </div>
  );
}


