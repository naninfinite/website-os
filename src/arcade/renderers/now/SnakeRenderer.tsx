import React, { useEffect, useRef } from 'react';
import type { SnakeState } from '../../games/snake/core';

export function SnakeRendererNow({ state }: { state: SnakeState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cell = Math.max(6, Math.floor(canvas.width / state.w));
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgb(var(--text))';
    state.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? 'rgb(var(--accent))' : 'rgb(var(--text))';
      ctx.fillRect(s.x * cell, s.y * cell, cell-1, cell-1);
    });
    ctx.fillStyle = 'rgb(var(--accent))';
    ctx.fillRect(state.food.x * cell, state.food.y * cell, cell-1, cell-1);
  }, [state]);
  return <canvas ref={canvasRef} width={640} height={360} style={{ width: '100%', height: 'auto' }} />;
}


