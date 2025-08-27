/**
 * SUMMARY
 * Mobile Home: renders either a list or grid of app launchers based on the
 * active era profile. Uses appRegistry and opens apps full-page via callback.
 */
import React, { useMemo } from 'react';
import { getAllApps } from '../../shell/appRegistry';
import { useEra } from '../era/EraContext';
import { layoutProfiles, type Era as EraId } from '../../themes/layoutProfiles';

export function MobileHome(props: { mode: 'list' | 'grid'; onOpen: (appId: string) => void }): JSX.Element {
  const { mode, onOpen } = props;
  const { eraId } = useEra();
  const profile = useMemo(() => layoutProfiles[eraId as EraId], [eraId]);
  const apps = getAllApps();
  const common = 'rounded bg-foreground/10 hover:bg-foreground/20 text-left flex items-center';
  const minHeightStyle = { minHeight: 44 } as const;
  return (
    <div className="p-3" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {(mode ?? profile.mobile.homeMode) === 'list' ? (
        <div className="flex flex-col gap-2">
          {apps.map((m) => (
            <button key={m.id} className={common} onClick={() => onOpen(m.id)} style={minHeightStyle}>
              <div className="px-3">
                <div className="font-medium">{m.title}</div>
                <div className="text-xs opacity-70">{m.id}</div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {apps.map((m) => (
            <button key={m.id} className={`${common} aspect-square flex items-end`} onClick={() => onOpen(m.id)} style={{ padding: 12 }}>
              <div className="text-xs">
                <div className="font-medium">{m.title}</div>
                <div className="opacity-70">{m.id}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


