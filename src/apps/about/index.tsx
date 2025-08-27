/**
 * SUMMARY
 * About app stub. Provides minimal component and metadata for the registry.
 */
import React, { useEffect, useState } from 'react';
import { loadLore } from '../../services/content/loaders';

export default function AboutApp() {
  const [bio, setBio] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadLore().then((items) => {
      if (!mounted) return;
      const about = items.find((i) => i.key === 'about')?.value ?? null;
      setBio(about);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <article className="p-4">
      <h1 className="text-lg font-semibold">About.EXE</h1>
      {loading ? (
        <p>Loading…</p>
      ) : bio ? (
        <div>
          <p>{bio}</p>
        </div>
      ) : (
        <div>
          <p>Hi — this site is under construction. Check back soon for more details.</p>
          <button onClick={() => location.reload()} className="mt-2 px-2 py-1 rounded bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]">Reload</button>
        </div>
      )}
    </article>
  );
}


