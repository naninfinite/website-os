/**
 * SUMMARY
 * WindowManager MVP for desktop: open, move (drag + arrows), minimize/restore,
 * focus/z-order. Provides context so Taskbar/Launcher can control it. Resizing
 * is deferred.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WindowingProvider, type WindowingContextValue } from './context';
import { getAppMeta, appRegistry } from '../appRegistry';
import { Window } from './Window';

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

// useWindowing hook is exported from ./context

export function WindowManager(props: { children?: React.ReactNode }): JSX.Element {
  const [windows, setWindows] = useState<WindowSpec[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [zCounter, setZCounter] = useState<number>(1);
  const dragRef = useRef<DragState>(null);

  const openApp = (id: string) => {
    // Ensure app is registered
    const reg = appRegistry[id];
    if (!reg) {
      console.warn(`[WindowManager] openApp: unknown app '${id}'`);
      return;
    }
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

  // Global key handler: ESC closes active window
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeId) {
        // close focused window
        closeWindow(activeId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId]);

  const value = useMemo<WindowingContextValue>(() => ({
    openApp,
    closeApp: closeWindow,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    focusWindow,
    activeId,
    windows: windows.map((w) => ({
      id: w.id,
      title: w.title,
      minimized: w.minimized,
      close: () => closeWindow(w.id),
      focus: () => focusWindow(w.id),
      minimize: () => minimizeWindow(w.id),
    })),
  }), [windows, activeId]);

  return (
    <WindowingProvider value={value}>
      <div className="wm-root h-full w-full relative select-none" aria-label="Desktop">
        {props.children}
        {/* Windows layer */}
        <div className="wm-windows absolute inset-0 pointer-events-none" aria-live="polite">
          {running
            .filter((w) => !w.minimized)
            .sort((a, b) => a.z - b.z)
            .map((win) => {
              const reg = appRegistry[win.appId];
              const Comp = reg?.component;
              return (
                <Window
                  key={win.id}
                  id={win.id}
                  title={win.title}
                  x={win.x}
                  y={win.y}
                  z={win.z}
                  active={activeId === win.id}
                  onClose={() => closeWindow(win.id)}
                  onMinimize={() => minimizeWindow(win.id)}
                  onFocus={() => focusWindow(win.id)}
                  onMouseDown={() => focusWindow(win.id)}
                >
                  {Comp ? <Comp /> : <div className="p-4 text-sm">Unknown app: {win.appId}</div>}
                </Window>
              );
            })}
        </div>
      </div>
    </WindowingProvider>
  );
}


