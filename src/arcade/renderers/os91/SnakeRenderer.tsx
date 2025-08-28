import React, { useEffect, useRef } from 'react';
import type { SnakeState } from '../../games/snake/core';

export function SnakeRendererOs91({ state }: { state: SnakeState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cell = 8;
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0, state.w * cell, state.h * cell);
    ctx.fillStyle = 'lime';
    state.snake.forEach((s) => ctx.fillRect(s.x * cell, s.y * cell, cell, cell));
    ctx.fillStyle = 'red';
    ctx.fillRect(state.food.x * cell, state.food.y * cell, cell, cell);
  }, [state]);
  return <canvas ref={canvasRef} width={state.w * 8} height={state.h * 8} style={{ imageRendering: 'pixelated', width: '100%', height: 'auto' }} />;
}


