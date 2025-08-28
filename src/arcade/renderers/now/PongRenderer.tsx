import React, { useEffect, useRef } from 'react';
import type { PongState } from '../../games/pong/core';

export function PongRendererNow({ state }: { state: PongState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgb(var(--accent))';
    ctx.beginPath();
    ctx.arc(state.ball.x / state.w * canvas.width, state.ball.y / state.h * canvas.height, state.ball.r, 0, Math.PI*2);
    ctx.fill();
  }, [state]);
  return <canvas ref={canvasRef} width={640} height={360} style={{ width: '100%', height: 'auto' }} />;
}


