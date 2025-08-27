/**
 * SUMMARY
 * Desktop launcher overlay: grid of apps from registry. Keyboardable (Tab/
 * arrows via browser focus order), Escape closes. Clicking opens an app via
 * WindowManager context.
 */
import React, { useEffect, useRef } from 'react';
import { getAllApps } from './appRegistry';
import { useWindowing } from './windowing/WindowManager';

export function Launcher(props: { open: boolean; onClose: () => void }): JSX.Element | null {
  const { open, onClose } = props;
  const apps = getAllApps();
  const { openApp } = useWindowing();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    // focus the first button for keyboard navigation
    const firstBtn = panelRef.current?.querySelector<HTMLButtonElement>('button');
    firstBtn?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-modal={true}
      aria-label="Launcher"
      className="absolute inset-0 bg-foreground/20 backdrop-blur-[2px] flex items-center justify-center"
      onClick={(e) => {
        if (e.target === containerRef.current) onClose();
      }}
    >
      <div ref={panelRef} className="bg-background rounded-token shadow-token p-4 w-[min(90vw,900px)] max-h-[80vh] overflow-auto">
        <div className="grid grid-cols-4 gap-3">
          {apps.map((m) => (
            <button
              key={m.id}
              className="h-24 rounded-token bg-foreground/10 hover:bg-foreground/20 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] flex items-end p-2"
              onClick={() => {
                openApp(m.id);
                onClose();
              }}
              aria-label={`Open ${m.title}`}
            >
              <div className="text-xs">
                <div className="font-medium">{m.title}</div>
                <div className="opacity-70">{m.id}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


