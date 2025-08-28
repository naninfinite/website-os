/**
 * SUMMARY
 * Minimal toast system for ephemeral notifications. Provides a context with
 * addToast(message) and renders a bottom-right stack. Respects reduced motion
 * and uses CSS variables for colors.
 */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = { id: number; message: string };

type ToastContextValue = {
  addToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider(props: { children: React.ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(1);

  const addToast = useCallback((message: string) => {
    const id = counter + 1;
    setCounter(id);
    setToasts((prev) => [...prev, { id, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2400);
  }, [counter]);

  const value = useMemo<ToastContextValue>(() => ({ addToast }), [addToast]);

  return (
    <ToastContext.Provider value={value}>
      {props.children}
      <div className="toast-container" aria-live="polite" aria-atomic="true">
        {toasts.map((t) => (
          <div key={t.id} className="toast" role="status" tabIndex={0}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


