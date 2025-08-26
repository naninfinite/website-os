/**
 * SUMMARY
 * Desktop shell container that hosts the WindowManager MVP. Visual chrome and
 * per-era desktop details will be added in later sprints.
 */
import React from 'react';
import type { Era } from '../themes/layoutProfiles';
import { WindowManager } from './windowing/WindowManager';

export function Desktop(props: { era: Era }): JSX.Element {
  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text))' }}>
      <WindowManager />
    </div>
  );
}


