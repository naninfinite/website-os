import React, { useCallback } from 'react';
import type { PongState } from '../../games/pong/core';
import { TerminalPixelCanvas } from './TerminalPixelCanvas';

export function PongRendererTerminal({ state }: { state: PongState }) {
  const cell = 10;
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.imageSmoothingEnabled = false;
    // midline dotted
    const cols = Math.floor(state.w);
    const rows = Math.floor(state.h);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--arcade-fg') || '#7CFF9E';
    for (let y = 0; y < rows; y += 2) {
      ctx.fillRect(Math.floor(cols / 2) * cell, y * cell, 1, cell);
    }
    // paddles
    const pWidth = Math.max(1, Math.floor(state.paddle.w / (state.w / cols)));
    const p1x = cell; const p2x = (cols - 2) * cell;
    const p1y = Math.floor(state.p1.y / state.h * rows) * cell;
    const p2y = Math.floor(state.p2.y / state.h * rows) * cell;
    const pH = Math.max(cell, Math.floor(state.p1.h / state.h * rows) * cell);
    ctx.fillRect(p1x, p1y, cell, pH);
    ctx.fillRect(p2x, p2y, cell, pH);
    // ball
    const bx = Math.floor(state.ball.x / state.w * cols) * cell;
    const by = Math.floor(state.ball.y / state.h * rows) * cell;
    ctx.fillRect(bx, by, cell, cell);
    // scores (simple 5x3 numerals)
    drawDigit(ctx, state.p1.score % 10, 1 * cell, 1 * cell, cell);
    drawDigit(ctx, state.p2.score % 10, (cols - 4) * cell, 1 * cell, cell);
  }, [state]);
  return (
    <div className="terminal-frame terminal-pixel" role="img" aria-label={`Pong score ${state.p1.score} to ${state.p2.score}`}>
      <TerminalPixelCanvas width={state.w} height={state.h} cell={cell} draw={draw} border={true} />
    </div>
  );
}

function drawDigit(ctx: CanvasRenderingContext2D, n: number, x: number, y: number, cell: number) {
  const font: Record<number, string[]> = {
    0: ['111', '101', '101', '101', '111'],
    1: ['010', '110', '010', '010', '111'],
    2: ['111', '001', '111', '100', '111'],
    3: ['111', '001', '111', '001', '111'],
    4: ['101', '101', '111', '001', '001'],
    5: ['111', '100', '111', '001', '111'],
    6: ['111', '100', '111', '101', '111'],
    7: ['111', '001', '010', '100', '100'],
    8: ['111', '101', '111', '101', '111'],
    9: ['111', '101', '111', '001', '111'],
  };
  const rows = font[n];
  if (!rows) return;
  rows.forEach((row, ry) => {
    row.split('').forEach((ch, cx) => {
      if (ch === '1') ctx.fillRect(x + cx * cell, y + ry * cell, cell, cell);
    });
  });
}


