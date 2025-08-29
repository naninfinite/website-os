/**
 * SUMMARY
 * Arcade.EXE: launcher for local games (Pong, Snake). Deterministic cores live
 * under src/arcade/games; renderers switch per era under src/arcade/renderers.
 */
import React, { useMemo, useState } from 'react';
import { useEra } from '../../shell/era/EraContext';
import ArcadeSurface from '../../arcade';

export default function ArcadeApp(): JSX.Element {
  const { eraId } = useEra();
  const [game, setGame] = useState<'pong' | 'snake'>('pong');
  const [paused, setPaused] = useState(false);
  const { userPrefs, updatePrefs } = useEra();

  // ArcadeSurface mounts the engine and renders stage

  // simple FPS/UPS counters decay
  React.useEffect(() => {
    const id = setInterval(() => { setFps(0); setUps(0); }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="p-4 arcade">
      <h1 className="text-lg font-semibold">Arcade.EXE</h1>
      <div className="mt-3 flex gap-3">
        <div className="w-48 arcade-side">
          <ArcadeSurface initialGame={game} />
        </div>
      </div>
      {/* Mobile controls overlay (auto via CSS coarse pointer or user setting) */}
      {(userPrefs.showMobileControls === 'on' || (userPrefs.showMobileControls === 'auto' && matchMedia && matchMedia('(pointer:coarse)').matches)) ? (
        <div className="mobile-controls" role="region" aria-label="Arcade touch controls" style={{ touchAction: 'none' }}>
          <div className="dpad" aria-hidden={false}>
            <button aria-label="Up" onPointerDown={() => (window as any).__arcadeEngine?.sendInput?.({ type: 'dir', dir: 'U' })} onPointerUp={() => {}} >↑</button>
            <button aria-label="Left" onPointerDown={() => (window as any).__arcadeEngine?.sendInput?.({ type: 'dir', dir: 'L' })}>←</button>
            <button aria-label="Right" onPointerDown={() => (window as any).__arcadeEngine?.sendInput?.({ type: 'dir', dir: 'R' })}>→</button>
            <button aria-label="Down" onPointerDown={() => (window as any).__arcadeEngine?.sendInput?.({ type: 'dir', dir: 'D' })}>↓</button>
          </div>
          <div className="actions" role="group" aria-label="Actions">
            <button aria-label="A" onPointerDown={() => (window as any).__arcadeEngine?.sendInput?.({ type: 'action', id: 'A' })}>A</button>
            <button aria-label="B" onPointerDown={() => (window as any).__arcadeEngine?.sendInput?.({ type: 'action', id: 'B' })}>B</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}


