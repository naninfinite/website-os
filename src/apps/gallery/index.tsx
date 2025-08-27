/**
 * SUMMARY
 * Gallery app stub. Provides minimal component and metadata for the registry.
 */
import React, { useEffect, useState } from 'react';
import { loadMedia } from '../../services/content/loaders';
import type { Media } from '../../services/content/types';

export default function GalleryApp() {
  const [items, setItems] = useState<Media[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadMedia().then((m) => {
      if (!mounted) return;
      setItems(m);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="p-4">
      <h1 className="text-lg font-semibold">Gallery.EXE</h1>
      {loading ? (
        <p className="mt-2">Loading…</p>
      ) : items && items.length ? (
        <div role="list" className="mt-3 grid grid-cols-3 gap-3">
          {items.map((it) => (
            <div key={it.id} role="listitem" className="card p-2 border rounded">
              {it.kind === 'image' ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={`${import.meta.env.BASE_URL}${it.src}`} alt={it.alt} className="w-full h-40 object-cover rounded" />
              ) : (
                <div className="text-sm">Video: {it.title}</div>
              )}
              <div className="mt-2">
                <div className="font-medium">{it.title}</div>
                {it.credit ? <div className="text-xs opacity-70">{it.credit}</div> : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <p>No media items found.</p>
          <button onClick={() => location.reload()} className="mt-2 px-2 py-1 rounded bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]">Reload</button>
        </div>
      )}
    </section>
  );
}


