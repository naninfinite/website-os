/**
 * SUMMARY
 * Recents app stub: shows recently opened apps/files. Clicking re-opens app or
 * navigates to File Browser with the file's folder.
 */
import React from 'react';
import { getRecents } from '../../services/recents';
import { useWindowing } from '../../shell/windowing/context';

export default function RecentsApp(): JSX.Element {
  const { openApp } = useWindowing();
  const items = getRecents();

  if (items.length === 0) {
    return <div className="p-4 text-sm opacity-80">No recents yet.</div>;
  }

  return (
    <div className="p-3">
      <div className="recents-list">
        {items.map((it) => (
          <button
            key={`${it.type}:${it.id}:${it.ts}`}
            className="recent-item text-left"
            onClick={() => {
              if (it.type === 'app') {
                openApp(it.id);
              } else {
                openApp('filebrowser');
              }
            }}
          >
            <div className="text-sm font-medium">{it.title}</div>
            <div className="text-xs opacity-60">{it.type}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


