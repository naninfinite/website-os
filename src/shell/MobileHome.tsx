/**
 * SUMMARY
 * Mobile home placeholder. Renders list or grid of placeholder apps depending
 * on profile.homeMode.
 */
import React from 'react';
import type { Era, MobileProfile } from '../themes/layoutProfiles';

const PLACEHOLDER_APPS = ['About', 'Projects', 'Gallery', 'Settings', 'Connect', 'Arcade', 'Dimension'];

export function MobileHome(props: { era: Era; profile: MobileProfile }): JSX.Element {
  const { profile } = props;
  const common = {
    backgroundColor: 'rgb(var(--surface-2))',
    color: 'rgb(var(--text))',
    borderRadius: 'var(--radius)',
    padding: '12px',
  } as React.CSSProperties;

  return (
    <div style={{ padding: 12 }}>
      {profile.homeMode === 'list' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PLACEHOLDER_APPS.map((name) => (
            <div key={name} style={common}>
              {name}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12 }}>
          {PLACEHOLDER_APPS.map((name) => (
            <div key={name} style={{ ...common, aspectRatio: '1 / 1', display: 'flex', alignItems: 'flex-end' }}>
              <div style={{ fontSize: 12, opacity: 0.9 }}>{name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


