import React, { useCallback } from 'react';
import type { SnakeState } from '../../games/snake/core';
import { TerminalPixelCanvas } from './TerminalPixelCanvas';

export function SnakeRendererTerminal({ state }: { state: SnakeState }) {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    // snake
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--arcade-fg') || '#7CFF9E';
    state.snake.forEach((seg) => {
      ctx.fillRect(seg.x, seg.y, 1, 1);
    });
    // food as plus sign
    const f = state.food;
    ctx.fillRect(f.x, f.y, 1, 1);
    ctx.fillRect(f.x - 1, f.y, 1, 1);
    ctx.fillRect(f.x + 1, f.y, 1, 1);
    ctx.fillRect(f.x, f.y - 1, 1, 1);
    ctx.fillRect(f.x, f.y + 1, 1, 1);
  }, [state]);
  return (
    <div className="terminal-frame terminal-pixel" role="img" aria-label={`Snake score ${state.score}`}>
      <TerminalPixelCanvas width={state.w} height={state.h} draw={draw} border={true} />
    </div>
  );
}


