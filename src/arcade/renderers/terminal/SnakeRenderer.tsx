import React, { useCallback } from 'react';
import type { SnakeState } from '../../games/snake/core';
import { TerminalPixelCanvas } from './TerminalPixelCanvas';

export function SnakeRendererTerminal({ state }: { state: SnakeState }) {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    const cell = 10;
    // snake
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--arcade-fg') || '#7CFF9E';
    state.snake.forEach((seg, i) => {
      ctx.fillRect(seg.x * cell, seg.y * cell, cell, cell);
    });
    // food as plus sign
    const f = state.food;
    ctx.fillRect(f.x * cell, f.y * cell, cell, cell);
    ctx.fillRect(f.x * cell - cell, f.y * cell, cell, cell);
    ctx.fillRect(f.x * cell + cell, f.y * cell, cell, cell);
    ctx.fillRect(f.x * cell, f.y * cell - cell, cell, cell);
    ctx.fillRect(f.x * cell, f.y * cell + cell, cell, cell);
  }, [state]);
  return (
    <div className="terminal-frame terminal-pixel" role="img" aria-label={`Snake score ${state.score}`}>
      <TerminalPixelCanvas width={state.w} height={state.h} cell={10} draw={draw} border={true} />
    </div>
  );
}


