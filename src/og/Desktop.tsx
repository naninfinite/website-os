/**
 * SUMMARY
 * OG Desktop: 2x2 grid (ME / YOU / THIRD / CONNECT) and a StatusBar with clock.
 * Accessible focus rings preserved via CSS; no advanced apps mounted.
 */
import React, { useEffect, useState } from 'react';
import styles from './styles/Desktop.module.scss';
import { OG_PANELS } from './panels';
import { useOgWindows } from './WindowManagerOG';

function useClock(): string {
  const [now, setNow] = useState<Date>(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now.toLocaleTimeString();
}

export function DesktopOG(): JSX.Element {
  const time = useClock();
  const {openWindow} = useOgWindows();
  
  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        {OG_PANELS.map(panel => (
          <button
            key={panel.id}
            className={styles.card}
            onClick={() => openWindow(panel.id, panel.exeName)}
            aria-label={`Open ${panel.exeName}`}
          >
            {panel.label}
          </button>
        ))}
      </div>
      <footer className={styles.statusBar} role="status" aria-live="polite">
        <div>READY</div>
        <div>{time}</div>
      </footer>
    </div>
  );
}
