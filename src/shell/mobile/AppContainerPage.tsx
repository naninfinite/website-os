/**
 * SUMMARY
 * Mobile container that renders a single app full-page with a simple top bar
 * and back button. Uses appRegistry to render the app component.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { getAppMeta, appRegistry } from '../../shell/appRegistry';
import { layoutProfiles } from '../../themes/layoutProfiles';
import { useEra } from '../era/EraContext';

// Framer Motion is optional dev dep; dynamically import to avoid hard dependency
let motion: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  motion = require('framer-motion');
} catch {
  motion = null;
}

export function AppContainerPage(props: { appId: string; onBack: () => void }): JSX.Element {
  const { appId, onBack } = props;
  const meta = getAppMeta(appId);
  const reg = appRegistry[appId];
  const { eraId } = useEra();
  const profile = layoutProfiles[eraId].mobile;

  const gestureEnabled = profile.gestureDismiss === true && motion;

  const content = (
    <div className="min-h-dvh flex flex-col" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <header className="sticky top-0 z-10 mobile-header">
        <div className="flex items-center gap-2 px-3 py-3 border-b border-foreground/10 bg-foreground/5" style={{ paddingTop: 'env(safe-area-inset-top, 12px)' }}>
          <button className="px-3 py-2 rounded bg-foreground/10" onClick={onBack} aria-label="Back">
            ←
          </button>
          <span className="text-sm font-medium">{meta?.title ?? appId}</span>
        </div>
      </header>
      <main className="flex-1 overflow-auto mobile-content">
        {reg ? <reg.component /> : <div className="p-4 text-sm">Unknown app: {appId}</div>}
      </main>
    </div>
  );

  if (!gestureEnabled) return content;

  // Motion wrapper with vertical drag to dismiss + scrim opacity driven by y
  const MotionDiv = motion.motion.div;
  const y = motion.useMotionValue(0);
  const opacity = motion.useTransform(y, [0, 200], [0, 0.35], { clamp: true });
  const scrimRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const unsub = opacity.on('change', (v: number) => {
      scrimRef.current?.style.setProperty('--scrim-opacity', String(v));
    });
    return () => unsub();
  }, [opacity]);

  const prefersReduced = useMemo(
    () => (typeof window !== 'undefined' && 'matchMedia' in window ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false),
    []
  );

  return (
    <div className="mobile-gesture-root">
      <div ref={scrimRef} className="app-scrim" aria-hidden="true" />
      <MotionDiv
        drag={prefersReduced ? false : 'y'}
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.15}
        onDragEnd={(_, info) => {
          const distance = (info.offset?.y as number) ?? 0;
          const vy = (info.velocity?.y as number) ?? 0;
          const shouldClose = distance > 120 || vy > 0.6;
          if (shouldClose) {
            motion.animate(y, typeof window !== 'undefined' ? window.innerHeight : 0, { duration: prefersReduced ? 0 : 0.18 }).then(() => {
              onBack();
              y.set(0);
              scrimRef.current?.style.setProperty('--scrim-opacity', '0');
            });
          } else {
            motion.animate(y, 0, { duration: prefersReduced ? 0 : 0.18 });
          }
        }}
        style={{ willChange: 'transform', y }}
        className="mobile-gesture-card"
      >
        {content}
      </MotionDiv>
    </div>
  );
}


