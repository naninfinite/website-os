/**
 * SUMMARY
 * Mobile Home: renders either a list or grid of app launchers based on the
 * active era profile. Opens apps full-page via callback.
 */
import React from 'react';
import type { AppId } from '../app-registry/types';
import { appMetas } from '../app-registry';

export function MobileHome(props: { mode: 'list' | 'grid'; onOpen: (appId: AppId) => void }): JSX.Element {
  const { mode, onOpen } = props;
  const common = 'rounded bg-foreground/10 hover:bg-foreground/20 p-3 text-left';
  return (
    <div className="p-3">
      {mode === 'list' ? (
        <div className="flex flex-col gap-2">
          {appMetas.map((m) => (
            <button key={m.id} className={common} onClick={() => onOpen(m.id as AppId)}>
              <div className="font-medium">{m.title}</div>
              <div className="text-xs opacity-70">{m.id}</div>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {appMetas.map((m) => (
            <button key={m.id} className={`${common} aspect-square flex items-end`} onClick={() => onOpen(m.id as AppId)}>
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


