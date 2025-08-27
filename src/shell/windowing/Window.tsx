/**
 * SUMMARY
 * Reusable Window component: titlebar (title + controls) and content area.
 * Uses CSS variables for theming and supports keyboard accessibility.
 */
import React from 'react';

export function Window(props: {
  id: string;
  title: string;
  x: number;
  y: number;
  z: number;
  active: boolean;
  onClose: () => void;
  onMinimize?: () => void;
  onFocus?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
}): JSX.Element {
  const { id, title, x, y, z, active, onClose, onMinimize, onFocus, onMouseDown, children } = props;

  return (
    <div
      role="dialog"
      aria-modal={false}
      aria-labelledby={`${id}-title`}
      tabIndex={0}
      className={`window ${active ? 'window-active' : ''}`}
      style={{ transform: `translate(${x}px, ${y}px)`, zIndex: z }}
      onMouseDown={onMouseDown}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="window-titlebar" id={`${id}-title`}>
        <div className="window-title" aria-hidden>
          {title}
        </div>
        <div className="window-controls">
          {onMinimize ? (
            <button className="window-btn" onClick={onMinimize} aria-label="Minimize">
              _
            </button>
          ) : null}
          <button className="window-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
      </div>
      <div className="window-content">{children}</div>
    </div>
  );
}


