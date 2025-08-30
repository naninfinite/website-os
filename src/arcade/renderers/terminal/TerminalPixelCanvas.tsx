import React, { useEffect, useRef } from 'react';

export function TerminalPixelCanvas(props: {
  width: number; // logical cols
  height: number; // logical rows
  draw: (ctx: CanvasRenderingContext2D) => void; // assumes 1 unit == 1 pixel (logical)
  border?: boolean;
  className?: string;
  ariaLabel?: string;
}): JSX.Element {
  const { width, height, draw, border, className, ariaLabel } = props;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cellRef = useRef<number>(1);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const cell = Math.max(1, Math.floor(Math.min(rect.width / width, rect.height / height)));
      if (cell !== cellRef.current) {
        cellRef.current = cell;
        canvas.width = width * cell;
        canvas.height = height * cell;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      // clear bg
      ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--arcade-bg') || '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // set fg for border
      if (border) {
        const fg = getComputedStyle(document.body).getPropertyValue('--arcade-fg') || '#7CFF9E';
        ctx.strokeStyle = fg;
        ctx.lineWidth = Math.max(1, Math.floor(cell / 6));
        ctx.strokeRect(0.5 * ctx.lineWidth, 0.5 * ctx.lineWidth, canvas.width - ctx.lineWidth, canvas.height - ctx.lineWidth);
      }
      // logical draw
      ctx.save();
      ctx.scale(cell, cell);
      draw(ctx);
      ctx.restore();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    return () => ro.disconnect();
  }, [width, height, draw, border]);

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} className="terminal-pixel" role="img" aria-label={ariaLabel} />
    </div>
  );
}

export default TerminalPixelCanvas;


