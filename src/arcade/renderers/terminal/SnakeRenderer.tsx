import React from 'react';
import type { SnakeState } from '../../games/snake/core';

export function SnakeRendererTerminal({ state }: { state: SnakeState }) {
  const w = state.w;
  const h = state.h;
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    let row = '';
    for (let x = 0; x < w; x++) row += '·';
    rows.push(row);
  }
  const head = state.snake[0];
  rows[head.y] = replaceAt(rows[head.y], head.x, '@');
  for (let i = 1; i < state.snake.length; i++) {
    const s = state.snake[i];
    rows[s.y] = replaceAt(rows[s.y], s.x, 'o');
  }
  rows[state.food.y] = replaceAt(rows[state.food.y], state.food.x, '*');
  return (
    <pre aria-label="Snake" className="terminal-arcade">{rows.join('\n')}</pre>
  );
}

function replaceAt(s: string, i: number, ch: string) {
  if (i < 0 || i >= s.length) return s;
  return s.substring(0, i) + ch + s.substring(i + 1);
}


