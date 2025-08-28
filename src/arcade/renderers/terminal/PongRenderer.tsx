import React from 'react';
import type { PongState } from '../../games/pong/core';

export function PongRendererTerminal({ state }: { state: PongState }) {
  const w = Math.max(40, Math.floor(state.w / 8));
  const h = Math.max(20, Math.floor(state.h / 12));
  const grid: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = '';
    for (let x = 0; x < w; x++) {
      row += ' ';
    }
    grid.push(row.split('').join(''));
  }
  // naive mapping
  const ballX = Math.floor(state.ball.x / state.w * w);
  const ballY = Math.floor(state.ball.y / state.h * h);
  grid[ballY] = replaceAt(grid[ballY], ballX, 'o');
  const p1x = 1;
  const p2x = w - 2;
  const p1y = Math.floor(state.p1.y / state.h * h);
  const p2y = Math.floor(state.p2.y / state.h * h);
  grid[p1y] = replaceAt(grid[p1y], p1x, '|');
  grid[p2y] = replaceAt(grid[p2y], p2x, '|');

  return (
    <pre aria-label="Pong" className="terminal-arcade">
      {grid.join('\n')}
    </pre>
  );
}

function replaceAt(s: string, i: number, ch: string) {
  if (i < 0 || i >= s.length) return s;
  return s.substring(0, i) + ch + s.substring(i + 1);
}


