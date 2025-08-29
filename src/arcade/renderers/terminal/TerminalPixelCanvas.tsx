import React, { useEffect, useRef } from 'react';

export function TerminalPixelCanvas(props: {
  width: number;
  height: number;
  cell: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
  border?: boolean;
  ariaLabel?: string;
}): JSX.Element {
  const { width, height, cell, draw, border, ariaLabel } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingEnabled = false;
    // clear bg
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--arcade-bg') || '#000';
    ctx.fillRect(0, 0, width * cell, height * cell);
    // set fg
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--arcade-fg') || '#7CFF9E';
    // optional border frame (1-cell inset)
    if (border) {
      ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--arcade-fg') || '#7CFF9E';
      ctx.lineWidth = Math.max(1, Math.floor(cell / 6));
      ctx.strokeRect(0.5 * ctx.lineWidth, 0.5 * ctx.lineWidth, width * cell - ctx.lineWidth, height * cell - ctx.lineWidth);
    }
    draw(ctx);
  }, [width, height, cell, draw, border]);

  return (
    <canvas
      ref={canvasRef}
      className="terminal-pixel"
      width={width * cell}
      height={height * cell}
      role="img"
      aria-label={ariaLabel}
      style={{ width: '100%', height: '100%' }}
    />
  );
}

export default TerminalPixelCanvas;


