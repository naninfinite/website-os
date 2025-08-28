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
      },
    });
    e.start();
    return () => e.stop();
  }, [game, pongState, snakeState, paused]);

  return (
    <div className="p-4 arcade">
      <h1 className="text-lg font-semibold">Arcade.EXE</h1>
      <div className="mt-3 flex gap-3">
        <div className="w-48 arcade-side">
          <button className="block w-full mb-2 px-3 py-2 rounded" onClick={() => setGame('pong')}>Pong</button>
          <button className="block w-full mb-2 px-3 py-2 rounded" onClick={() => setGame('snake')}>Snake</button>
        </div>
        <div className="flex-1 arcade-stage">{renderer}</div>
      </div>
    </div>
  );
}


