/**
 * SUMMARY
 * Root App for Chunk 1. Manages current era, detects mobile, computes layout
 * profile, sets body[data-era], and renders Desktop vs Mobile shell with a
 * Countdown placeholder.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Countdown } from './shell/Countdown';
import { Desktop } from './shell/Desktop';
import { MobileHome } from './shell/MobileHome';
import { useIsMobile } from './shell/useIsMobile';
import { layoutProfiles, getActiveEra, type Era } from './themes/layoutProfiles';

export function App(): JSX.Element {
  const [era, setEra] = useState<Era>(() => getActiveEra());
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
        <Countdown currentEra={era} onEraFlip={(next) => setEra(next)} />
      </div>
      {isMobile ? (
        <MobileHome era={era} profile={profile.mobile} />
      ) : (
        <Desktop era={era} />
      )}
    </div>
  );
}


