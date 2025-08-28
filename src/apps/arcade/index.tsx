/**
 * SUMMARY
 * Arcade.EXE: launcher for local games (Pong, Snake). Deterministic cores live
 * under src/arcade/games; renderers switch per era under src/arcade/renderers.
 */
import React, { useMemo, useState } from 'react';
import { useEra } from '../../shell/era/EraContext';
import { PongRendererTerminal } from '../../arcade/renderers/terminal/PongRenderer';
import { SnakeRendererTerminal } from '../../arcade/renderers/terminal/SnakeRenderer';
import { init as initPong, update as updatePong, type PongState } from '../../arcade/games/pong/core';
import { init as initSnake, step as stepSnake, type SnakeState } from '../../arcade/games/snake/core';
import { createEngine } from '../../arcade/core/engine';

export default function ArcadeApp(): JSX.Element {
  const { eraId } = useEra();
  const [game, setGame] = useState<'pong' | 'snake'>('pong');
  const [pongState, setPongState] = useState<PongState | null>(() => initPong(320, 180));
  const [snakeState, setSnakeState] = useState<SnakeState | null>(() => initSnake(32, 24, 1));
  const [paused, setPaused] = useState(false);
  const { userPrefs, updatePrefs } = useEra();
  const [fps, setFps] = useState(0);
  const [ups, setUps] = useState(0);

  const renderer = useMemo(() => {
    if (game === 'pong') return <PongRendererTerminal state={pongState ?? initPong(320,180)} />;
    return <SnakeRendererTerminal state={snakeState ?? initSnake(32,24,1)} />;
  }, [game, pongState, snakeState, eraId]);

  // simple engine hook to step pong/snake
  React.useEffect(() => {
    const e = createEngine({
      update: (dtMs) => {
        if (paused) return;
        if (game === 'pong' && pongState) setPongState((s) => (s ? updatePong(s, {}, dtMs) : s));
        if (game === 'snake' && snakeState) setSnakeState((s) => (s ? stepSnake(s, {}) : s));
        setUps((u) => Math.min(999, u + 1));
      },
      render: () => setFps((f) => Math.min(999, f + 1)),
    });
    e.start();
    return () => e.stop();
  }, [game, pongState, snakeState, paused]);

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
          <button className="block w-full mb-2 px-3 py-2 rounded" onClick={() => setGame('pong')}>Pong</button>
          <button className="block w-full mb-2 px-3 py-2 rounded" onClick={() => setGame('snake')}>Snake</button>
          <div className="mt-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={userPrefs.showArcadeFps === true} onChange={(e) => updatePrefs({ showArcadeFps: e.target.checked })} />
              <span className="text-xs">Show FPS/UPS</span>
            </label>
          </div>
        </div>
        <div className="flex-1 arcade-stage">{renderer}</div>
      </div>
      {userPrefs.showArcadeFps ? <div className="arcade-fps">UPS: {ups} FPS: {fps}</div> : null}
    </div>
  );
}


