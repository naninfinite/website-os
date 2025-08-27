/**
 * SUMMARY
 * WindowManager MVP for desktop: open, move (drag + arrows), minimize/restore,
 * focus/z-order. Provides context so Taskbar/Launcher can control it. Resizing
 * is deferred.
 */
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getAppMeta, appRegistry } from '../appRegistry';

export type WindowSpec = {
  id: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  minimized: boolean;
  z: number; // larger means on top
};

type DragState = {
  id: string;
  startMouseX: number;
  startMouseY: number;
  startX: number;
  startY: number;
} | null;

const DESKTOP_PADDING = 8;

export type WindowingApi = {
  windows: WindowSpec[];
  activeId: string | null;
  openApp: (id: string) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
};

const WindowingContext = createContext<WindowingApi | null>(null);
export function useWindowing(): WindowingApi {
  const ctx = useContext(WindowingContext);
  if (!ctx) throw new Error('useWindowing must be used within WindowManager');
  return ctx;
}

export function WindowManager(props: { children?: React.ReactNode }): JSX.Element {
  const [windows, setWindows] = useState<WindowSpec[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zCounter, setZCounter] = useState<number>(1);
  const dragRef = useRef<DragState>(null);

  const openApp = (id: string) => {
    const meta = getAppMeta(id) ?? { id, title: id, icon: undefined };
    // Cascade new windows slightly
    const openCount = windows.length;
    const x = DESKTOP_PADDING + (openCount * 24) % 200;
    const y = 80 + (openCount * 24) % 160;
    const z = zCounter + 1;
    setZCounter(z);
    const spec: WindowSpec = {
      id: `${id}-${Date.now()}`,
      appId: id,
      title: meta.title,
      x,
      y,
      minimized: false,
      z,
    };
    setWindows((prev) => [...prev, spec]);
    setActiveId(spec.id);
  };

  const closeWindow = (id: string) => {
    setWindows((w) => w.filter((win) => win.id !== id));
    setActiveId((cur) => (cur === id ? null : cur));
  };

  const minimizeWindow = (id: string) =>
    setWindows((w) => w.map((win) => (win.id === id ? { ...win, minimized: true } : win)));

  const restoreWindow = (id: string) => {
    setWindows((w) =>
      w.map((win) => (win.id === id ? { ...win, minimized: false, z: zCounter + 1 } : win))
    );
    setZCounter((z) => z + 1);
    setActiveId(id);
  };

  const focusWindow = (id: string) => {
    setWindows((w) => w.map((win) => (win.id === id ? { ...win, z: zCounter + 1 } : win)));
    setZCounter((z) => z + 1);
    setActiveId(id);
  };

  // Drag handling using window listeners for smoothness
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, startMouseX, startMouseY, startX, startY } = dragRef.current;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
      setWindows((wins) =>
        wins.map((w) => (w.id === id ? { ...w, x: Math.max(DESKTOP_PADDING, startX + dx), y: Math.max(0, startY + dy) } : w))
      );
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const beginDrag = (id: string, e: React.MouseEvent) => {
    // Only left button
    if (e.button !== 0) return;
    const w = windows.find((w) => w.id === id);
    if (!w) return;
    focusWindow(id);
    dragRef.current = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startX: w.x,
      startY: w.y,
    };
  };

  const onTitleKeyDown = (id: string, e: React.KeyboardEvent) => {
    const nudge = (dx: number, dy: number) =>
      setWindows((wins) => wins.map((w) => (w.id === id ? { ...w, x: Math.max(DESKTOP_PADDING, w.x + dx), y: Math.max(0, w.y + dy) } : w)));
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        nudge(0, -10);
        focusWindow(id);
        break;
      case 'ArrowDown':
        e.preventDefault();
        nudge(0, 10);
        focusWindow(id);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        nudge(-10, 0);
        focusWindow(id);
        break;
      case 'ArrowRight':
        e.preventDefault();
        nudge(10, 0);
        focusWindow(id);
        break;
      case 'Escape':
        minimizeWindow(id);
        break;
    }
  };

  const running = windows;

  return (
    <div className="h-full w-full relative select-none" aria-label="Desktop">
      <WindowingContext.Provider
        value={{ windows, activeId, openApp, closeWindow, minimizeWindow, restoreWindow, focusWindow }}
      >
        {props.children}
      </WindowingContext.Provider>
      {/* Windows layer */}
      <div className="absolute inset-0 pointer-events-none" aria-live="polite">
        {running
          .filter((w) => !w.minimized)
          .sort((a, b) => a.z - b.z)
          .map((win) => (
            <div
              key={win.id}
              role="dialog"
              aria-modal={false}
              aria-labelledby={`${win.id}-title`}
              tabIndex={-1}
              className="absolute w-[min(80vw,900px)] bg-background/95 border border-foreground/20 shadow-lg pointer-events-auto"
              style={{ transform: `translate(${win.x}px, ${win.y}px)`, zIndex: win.z }}
              onMouseDown={() => focusWindow(win.id)}
            >
              <div
                className="flex items-center justify-between px-3 py-2 border-b border-foreground/10 bg-foreground/5 cursor-move"
                onMouseDown={(e) => beginDrag(win.id, e)}
                onKeyDown={(e) => onTitleKeyDown(win.id, e)}
                tabIndex={0}
                id={`${win.id}-title`}
              >
                <span className="text-sm font-medium">{win.title}</span>
                <div className="flex items-center gap-2">
                  <button
                    className="text-sm opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                    onClick={() => minimizeWindow(win.id)}
                    aria-label="Minimize"
                  >
                    _
                  </button>
                  <button
                    className="text-sm opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
                    onClick={() => closeWindow(win.id)}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {(() => {
                const reg = appRegistry[win.appId];
                const Comp = reg?.component;
                return Comp ? <Comp /> : <div className="p-4 text-sm">Unknown app: {win.appId}</div>;
              })()}
            </div>
          ))}
      </div>
    </div>
  );
}


