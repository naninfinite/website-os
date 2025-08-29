import React, { useEffect, useMemo, useState } from 'react';
import { createEngine } from './core/engine';
import type { GameId, ArcadeInput } from './types';
import { init as initPong, update as updatePong, type PongState } from './games/pong/core';
import { init as initSnake, step as stepSnake, type SnakeState } from './games/snake/core';
import { PongRendererTerminal } from './renderers/terminal/PongRenderer';
import { SnakeRendererTerminal } from './renderers/terminal/SnakeRenderer';
import { PongRendererOs91 } from './renderers/os91/PongRenderer';
import { SnakeRendererOs91 } from './renderers/os91/SnakeRenderer';
import { PongRendererNow } from './renderers/now/PongRenderer';
import { SnakeRendererNow } from './renderers/now/SnakeRenderer';
import { useEra } from '../shell/era/EraContext';

export function ArcadeSurface({ initialGame = 'pong' as GameId }: { initialGame?: GameId }) {
  const { eraId } = useEra();
  const [game, setGame] = useState<GameId>(initialGame);
  const [pong, setPong] = useState<PongState>(() => initPong(320, 180));
  const [snake, setSnake] = useState<SnakeState>(() => initSnake(32, 24, 1));
  const [started, setStarted] = useState<boolean>(false);
  const [cpuP2, setCpuP2] = useState<boolean>(false);
  const pressedRef = React.useRef<{ up?: boolean; down?: boolean; left?: boolean; right?: boolean }>({});

  const engine = useMemo(() => {
    return createEngine({
      update: (dtMs: number, inputs: ArcadeInput[] = []) => {
        if (!started) return;
        // pressed keys (continuous)
        const p = pressedRef.current;
        const held: ArcadeInput[] = [];
        if (p.up) held.push({ type: 'dir', dir: 'U' });
        if (p.down) held.push({ type: 'dir', dir: 'D' });
        if (p.left) held.push({ type: 'dir', dir: 'L' });
        if (p.right) held.push({ type: 'dir', dir: 'R' });
        const queue = [...inputs, ...held];
        // process inputs
        for (const inp of queue) {
          if (inp.type === 'dir') {
            if (game === 'pong') {
              setPong((s) => updatePong(s, { p1Up: inp.dir === 'U', p1Down: inp.dir === 'D' }, dtMs));
            } else {
              setSnake((s) => stepSnake(s, { dir: inp.dir }));
            }
          }
        }
        // passive CPU for P2 when enabled
        if (game === 'pong' && cpuP2) setPong((s) => ({ ...s, p2: { ...s.p2, ai: true } }));
        // run regular tick
        if (game === 'pong') setPong((s) => updatePong(s, {}, dtMs));
        if (game === 'snake') setSnake((s) => stepSnake(s, {}));
      },
      render: () => {},
    });
  }, [game, started, cpuP2]);

  useEffect(() => {
    (window as any).__arcadeEngine = engine;
    return () => { engine.stop(); delete (window as any).__arcadeEngine; };
  }, [engine]);

  // keyboard handlers when focused
  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'w':
      case 'ArrowUp': pressedRef.current.up = true; break;
      case 's':
      case 'ArrowDown': pressedRef.current.down = true; break;
      case 'a':
      case 'ArrowLeft': pressedRef.current.left = true; break;
      case 'd':
      case 'ArrowRight': pressedRef.current.right = true; break;
      case 'p': engine.setPaused(true); setStarted(false); break;
      case 'r':
        setPong(initPong(320,180));
        setSnake(initSnake(32,24,1));
        break;
    }
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'w':
      case 'ArrowUp': pressedRef.current.up = false; break;
      case 's':
      case 'ArrowDown': pressedRef.current.down = false; break;
      case 'a':
      case 'ArrowLeft': pressedRef.current.left = false; break;
      case 'd':
      case 'ArrowRight': pressedRef.current.right = false; break;
    }
  };

  // choose renderer
  const stage = useMemo(() => {
    const r = eraId === 'terminal-os' ? 'terminal' : eraId === 'os-91' ? 'os91' : 'now';
    if (game === 'pong') {
      if (r === 'terminal') return <PongRendererTerminal state={pong} />;
      if (r === 'os91') return <PongRendererOs91 state={pong} />;
      return <PongRendererNow state={pong} />;
    }
    if (r === 'terminal') return <SnakeRendererTerminal state={snake} />;
    if (r === 'os91') return <SnakeRendererOs91 state={snake} />;
    return <SnakeRendererNow state={snake} />;
  }, [game, pong, snake, eraId]);

  return (
    <div className="arcade-surface" tabIndex={0} onKeyDown={onKeyDown} onKeyUp={onKeyUp}>
      <div className="arcade-toolbar">
        <button onClick={() => setGame('pong')}>Pong</button>
        <button onClick={() => setGame('snake')}>Snake</button>
        <button onClick={() => { if (!started) { engine.start(); setStarted(true); } }}>Start</button>
        <button onClick={() => { engine.setPaused(true); setStarted(false); }}>Pause</button>
        <button onClick={() => { setPong(initPong(320,180)); setSnake(initSnake(32,24,1)); }}>Reset</button>
        <label className="ml-2 text-xs inline-flex items-center gap-1">
          <input type="checkbox" checked={cpuP2} onChange={(e) => setCpuP2(e.target.checked)} /> CPU for P2
        </label>
      </div>
      <div className="arcade-viewport">
        {started ? stage : <div className="text-sm opacity-70">Press Start to play</div>}
      </div>
    </div>
  );
}

export default ArcadeSurface;
