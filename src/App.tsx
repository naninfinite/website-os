/**
 * SUMMARY
 * Root App for Sprint 1. Provides EraProvider, renders Desktop vs Mobile, and
 * shows a countdown + reboot overlay.
 */
import React, { useMemo, useState } from 'react';
import { CountdownBadge } from './components/CountdownBadge';
import { Desktop } from './shell/Desktop';
import { useIsMobile } from './shell/useIsMobile';
import { layoutProfiles, type Era as EraId } from './themes/layoutProfiles';
import { RebootOverlay } from './shell/RebootOverlay';
import { MobileHome } from './shell/mobile/Home';
import { AppContainerPage } from './shell/mobile/AppContainerPage';
import { EraProvider, useEra } from './shell/era/EraContext';
import { DevEraBadge } from './shell/DevEraBadge';

function AppInner(): JSX.Element {
  const { eraId } = useEra();
  const [rebooting, setRebooting] = useState<boolean>(false);
  const [mobileApp, setMobileApp] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const profile = useMemo(() => layoutProfiles[eraId as EraId], [eraId]);

  return (
    <div>
      <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ opacity: 0.8 }}>Era: {eraId}</div>
      </div>
      {isMobile ? (
        mobileApp ? (
          <AppContainerPage appId={mobileApp} onBack={() => setMobileApp(null)} />
        ) : (
          <MobileHome mode={profile.mobile.homeMode} onOpen={(id) => setMobileApp(id)} />
        )
      ) : (
        <Desktop era={eraId as EraId} />
      )}
      {/* Global UI */}
      <CountdownBadge />
      {rebooting ? <RebootOverlay /> : null}
      <DevEraBadge />
    </div>
  );
}

export function App(): JSX.Element {
  return (
    <EraProvider>
      <AppInner />
    </EraProvider>
  );
}


