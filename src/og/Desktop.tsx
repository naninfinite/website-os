/**
 * SUMMARY
 * OG Desktop: 2x2 grid (ME / YOU / THIRD / CONNECT) and a StatusBar with clock.
 * Accessible focus rings preserved via CSS; no advanced apps mounted.
 */
import React, { useEffect, useState } from 'react';
import styles from './styles/Desktop.module.scss';

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
  return (
    <div className={styles.root}>
      <div className={styles.grid}>
        <div className={styles.card} aria-label="ME">ME</div>
        <div className={styles.card} aria-label="YOU">YOU</div>
        <div className={styles.card} aria-label="THIRD">THIRD</div>
        <div className={styles.card} aria-label="CONNECT">CONNECT</div>
      </div>
      <footer className={styles.statusBar} role="status" aria-live="polite">
        <div>READY</div>
        <div>{time}</div>
      </footer>
    </div>
  );
}
