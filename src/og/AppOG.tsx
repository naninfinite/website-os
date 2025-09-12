/**
 * SUMMARY
 * OG App: Landing -> AppShell + Desktop (OG). Reduced-motion friendly fade.
 */
import React, { useEffect, useState } from 'react';
import { AppShell } from './AppShell';
import { Landing } from './Landing';
import { DesktopOG } from './Desktop';

export default function AppOG(): JSX.Element {
  const [phase, setPhase] = useState<'landing' | 'desktop'>('landing');
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.documentElement.style.transition = 'opacity 200ms ease';
    return () => { document.documentElement.style.transition = ''; };
  }, []);
  return (
    <AppShell>
      {phase === 'landing' ? (
        <Landing onEnter={() => setPhase('desktop')} />
      ) : (
        <DesktopOG />
      )}
    </AppShell>
  );
}
