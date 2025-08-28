// src/shell/windowing/context.tsx
import React, { createContext, useContext } from 'react';

export type WindowRef = {
  id: string;
  title: string;
  minimized: boolean;
  close: () => void;
  focus: () => void;
  minimize: () => void;
};

export type WindowingContextValue = {
  openApp: (id: string) => void;
  closeApp: (id: string) => void; // alias for closeWindow
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  activeId: string | null;
  windows: WindowRef[];
};

const WindowingContext = createContext<WindowingContextValue | null>(null);

export function useWindowing(): WindowingContextValue {
  const v = useContext(WindowingContext);
  if (!v) throw new Error("useWindowing must be used within WindowingProvider");
  return v;
}

export function WindowingProvider({ value, children }: { value: WindowingContextValue; children: React.ReactNode }) {
  return <WindowingContext.Provider value={value}>{children}</WindowingContext.Provider>;
}