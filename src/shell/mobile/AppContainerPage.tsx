/**
 * SUMMARY
 * Mobile container that renders a single app full-page with a simple top bar
 * and back button. Uses appRegistry to render the app component.
 */
import React from 'react';
import { getAppMeta, appRegistry } from '../../shell/appRegistry';

export function AppContainerPage(props: { appId: string; onBack: () => void }): JSX.Element {
  const { appId, onBack } = props;
  const meta = getAppMeta(appId);
  const reg = appRegistry[appId];
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="flex items-center gap-2 px-3 py-2 border-b border-foreground/10 bg-foreground/5">
        <button className="px-2 py-1 rounded bg-foreground/10" onClick={onBack} aria-label="Back">
          ←
        </button>
        <span className="text-sm font-medium">{meta.title}</span>
      </header>
      <main className="flex-1 overflow-auto">
        {reg ? <reg.component /> : <div className="p-4 text-sm">Unknown app: {appId}</div>}
      </main>
    </div>
  );
}


