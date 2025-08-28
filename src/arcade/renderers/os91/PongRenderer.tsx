import React, { useEffect, useRef } from 'react';
import type { PongState } from '../../games/pong/core';

export function PongRendererOs91({ state }: { state: PongState }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0,0,W,H);
    ctx.fillStyle = 'white';
    ctx.fillRect(state.ball.x / state.w * W - state.ball.r, state.ball.y / state.h * H - state.ball.r, state.ball.r*2, state.ball.r*2);
  }, [state]);
  return <canvas ref={canvasRef} width={240} height={160} style={{ imageRendering: 'pixelated', width: '100%', height: 'auto' }} />;
}


