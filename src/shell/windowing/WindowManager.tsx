/**
 * SUMMARY
 * Minimal WindowManager for desktop: maintains a list of open windows and
 * renders their contents stacked. Drag/resize is deferred to later sprints.
 */
import React, { useState } from 'react';
import { AppStub } from '../app-registry';
import type { AppId } from '../app-registry/types';

export type WindowSpec = { id: string; appId: AppId; title: string };

export function WindowManager(): JSX.Element {
  const [windows, setWindows] = useState<WindowSpec[]>([]);

  const openApp = (id: AppId) => {
    const spec: WindowSpec = { id: `${id}-${Date.now()}`, appId: id, title: id };
    setWindows((w) => [...w, spec]);
  };

  const closeWindow = (id: string) => setWindows((w) => w.filter((win) => win.id !== id));

  return (
    <div className="h-full w-full relative">
      <div className="p-2 flex gap-2">
        {(['about', 'projects', 'gallery', 'settings', 'connect', 'arcade', 'dimension'] as AppId[]).map(
          (app) => (
            <button
              key={app}
              className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20"
              onClick={() => openApp(app)}
            >
              {app}
            </button>
          )
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {windows.map((win, idx) => (
          <div
            key={win.id}
            className="absolute left-8 top-20 w-[min(80vw,900px)] bg-background/95 border border-foreground/20 shadow-lg pointer-events-auto"
            style={{ zIndex: 10 + idx }}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b border-foreground/10 bg-foreground/5">
              <span className="text-sm font-medium">{win.title}</span>
              <button className="text-sm opacity-70 hover:opacity-100" onClick={() => closeWindow(win.id)}>
                ✕
              </button>
            </div>
            <AppStub id={win.appId} />
          </div>
        ))}
      </div>
    </div>
  );
}


