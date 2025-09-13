/**
 * SUMMARY
 * Text-only OG Dock with app labels. Shows active app state and wires actions
 * to the OG window manager: open, focus, minimize/restore.
 */
import React from 'react';
import { OG_PANELS } from './panels';
import { useOgWindows } from './WindowManagerOG';
import styles from './styles/Desktop.module.scss';

export const DockOG: React.FC = () => {
  const { windows, openWindow, restoreApp, focusWindow } = useOgWindows();

  const handleClick = (panelId: typeof OG_PANELS[number]['id'], exe: string) => {
    const existing = windows.find(w => w.app === panelId);
    if (!existing) {
      openWindow(panelId, exe);
      return;
    }
    if (existing.status === 'minimized') {
      restoreApp(panelId);
      return;
    }
    // already open
    focusWindow(existing.id);
  };

  return (
    <nav className={styles.dock} aria-label="OG Dock">
      {OG_PANELS.map(p => {
        const existing = windows.find(w => w.app === p.id);
        const isActive = !!existing;
        const isMin = existing?.status === 'minimized';
        return (
          <button
            key={p.id}
            className={isActive ? styles.dockItemActive : styles.dockItem}
            aria-pressed={isActive}
            data-minimized={isMin ? 'true' : 'false'}
            onClick={() => handleClick(p.id, p.exeName)}
          >
            {p.label}
          </button>
        );
      })}
    </nav>
  );
};


