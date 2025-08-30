import React, { useCallback } from 'react';
import type { PongState } from '../../games/pong/core';
import { TerminalPixelCanvas } from './TerminalPixelCanvas';

export function PongRendererTerminal({ state }: { state: PongState }) {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.imageSmoothingEnabled = false;
    // midline dotted
    const cols = Math.floor(state.w);
    const rows = Math.floor(state.h);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--arcade-fg') || '#7CFF9E';
    for (let y = 0; y < rows; y += 2) {
      ctx.fillRect(Math.floor(cols / 2), y, 1, 1);
    }
    // paddles
    const p1x = 1; const p2x = cols - 2;
    const p1y = Math.floor(state.p1.y / state.h * rows);
    const p2y = Math.floor(state.p2.y / state.h * rows);
    const pH = Math.max(1, Math.floor(state.p1.h / state.h * rows));
    ctx.fillRect(p1x, p1y, 1, pH);
    ctx.fillRect(p2x, p2y, 1, pH);
    // ball
    const bx = Math.floor(state.ball.x / state.w * cols);
    const by = Math.floor(state.ball.y / state.h * rows);
    ctx.fillRect(bx, by, 1, 1);
    // scores (simple 5x3 numerals)
    drawDigit(ctx, state.p1.score % 10, 1, 1, 1);
    drawDigit(ctx, state.p2.score % 10, cols - 4, 1, 1);
  }, [state]);
  return (
    <div className="terminal-frame terminal-pixel" role="img" aria-label={`Pong score ${state.p1.score} to ${state.p2.score}`}>
      <TerminalPixelCanvas width={state.w} height={state.h} draw={draw} border={true} />
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


