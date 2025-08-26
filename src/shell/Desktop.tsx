/**
 * SUMMARY
 * Desktop shell placeholder. Centers big label and demonstrates token usage.
 */
import React from 'react';
import type { Era } from '../themes/layoutProfiles';

export function Desktop(props: { era: Era }): JSX.Element {
  return (
    <div className="min-h-dvh grid place-items-center" style={{ backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text))' }}>
      <div className="text-center">
        <div style={{ fontSize: 24, fontWeight: 600 }}>Desktop shell (ERA: {props.era})</div>
        <div style={{ opacity: 0.7, marginTop: 8 }}>layoutProfiles + shell baseline</div>
      </div>
    </div>
  );
}


