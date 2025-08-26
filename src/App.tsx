/**
 * SUMMARY
 * Root App for Sprint 1. Tracks active era, applies body[data-era], and renders
 * Desktop (WindowManager MVP) vs Mobile full-page app container.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Countdown } from './shell/Countdown';
import { Desktop } from './shell/Desktop';
import { useIsMobile } from './shell/useIsMobile';
import { layoutProfiles, getActiveEra, type Era } from './themes/layoutProfiles';
import { RebootOverlay } from './shell/RebootOverlay';
import { MobileHome } from './shell/mobile/Home';
import { AppContainerPage } from './shell/mobile/AppContainerPage';
import type { AppId } from './shell/app-registry/types';

export function App(): JSX.Element {
  const [era, setEra] = useState<Era>(() => getActiveEra());
  const [rebooting, setRebooting] = useState<boolean>(false);
  const [mobileApp, setMobileApp] = useState<AppId | null>(null);
  const isMobile = useIsMobile();
  const profile = useMemo(() => layoutProfiles[era], [era]);

  useEffect(() => {
    document.body.dataset.era = era;
    return () => { delete document.body.dataset.era; };
  }, [era]);

  return (
    <div>
      <div style={{ padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ opacity: 0.8 }}>Era: {era}</div>
        <Countdown
          currentEra={era}
          onEraFlip={(next) => {
            setRebooting(true);
            window.setTimeout(() => {
              setEra(next);
              setRebooting(false);
            }, 3000);
          }}
        />
      </div>
      {isMobile ? (
        mobileApp ? (
          <AppContainerPage appId={mobileApp} onBack={() => setMobileApp(null)} />
        ) : (
          <MobileHome mode={profile.mobile.homeMode} onOpen={(id) => setMobileApp(id)} />
        )
      ) : (
        <Desktop era={era} />
      )}
      {rebooting ? <RebootOverlay /> : null}
    </div>
  );
}


