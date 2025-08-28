/**
 * SUMMARY
 * Desktop taskbar: shows running windows, indicates focused, and toggles the
 * Launcher. Accessible buttons with focus rings.
 */
import React from 'react';
import { useEra } from './era/EraContext';
import { useWindowing } from './windowing/WindowManager';

export function Taskbar(props: { onToggleLauncher: () => void }): JSX.Element {
  const { windows, activeId, restoreWindow, focusWindow, minimizeWindow } = useWindowing();
  const { isForced, userPrefs } = useEra();
  return (
    <div className="absolute bottom-0 left-0 right-0 p-2 flex gap-2 bg-foreground/5 border-t border-foreground/10 pointer-events-auto">
      <button
        className="px-3 py-1 rounded bg-foreground/10 hover:bg-foreground/20 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
        onClick={props.onToggleLauncher}
        aria-label="Open launcher"
      >
        ◻︎
      </button>
      {!isForced && userPrefs.devEraOverride ? (
        <div className="px-2 py-1 text-xs rounded bg-foreground/10" aria-label="Preview era active">Preview: {userPrefs.devEraOverride}</div>
      ) : null}
      {windows.map((w) => (
        <button
          key={w.id}
          className={`px-3 py-1 rounded ${
            activeId === w.id && !w.minimized ? 'bg-foreground/20' : 'bg-foreground/10'
          } hover:bg-foreground/20 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]`}
          onClick={() => (w.minimized ? restoreWindow(w.id) : focusWindow(w.id))}
          onDoubleClick={() => (w.minimized ? restoreWindow(w.id) : minimizeWindow(w.id))}
          aria-pressed={activeId === w.id && !w.minimized}
          aria-label={`${w.title} ${w.minimized ? 'minimized' : 'open'}`}
          title={w.title}
        >
          <span className="text-xs">{w.title}</span>
        </button>
      ))}
    </div>
  );
}


