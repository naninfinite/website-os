/**
 * SUMMARY
 * Projects app stub. Provides minimal component and metadata for the registry.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { loadProjects } from '../../services/content/loaders';
import type { Project } from '../../services/content/types';

export default function ProjectsApp() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadProjects().then((items) => {
      if (!mounted) return;
      setProjects(items);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const visible = useMemo(() => {
    if (!projects) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => p.title.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)));
  }, [projects, filter]);

  return (
    <section className="p-4">
      <h1 className="text-lg font-semibold">Projects.EXE</h1>
      <div className="mt-3">
        <label>
          <span className="sr-only">Filter projects by tag or title</span>
          <input
            aria-label="Filter projects"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter by tag or title"
            className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
          />
        </label>
      </div>

      {loading ? (
        <p className="mt-4">Loading…</p>
      ) : projects && projects.length ? (
        <ul role="list" className="mt-4 space-y-3">
          {visible.map((p) => (
            <li role="listitem" key={p.id} className="p-3 border rounded">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.title} {p.year ? <span className="text-sm opacity-70">({p.year})</span> : null}</div>
                  <div className="text-sm opacity-80">{p.blurb}</div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {p.tags.map((t) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-foreground/5">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {p.url ? (
                    <a href={p.url} target="_blank" rel="noopener" className="text-xs underline">Open</a>
                  ) : null}
                  {p.repo ? (
                    <a href={p.repo} target="_blank" rel="noopener" className="text-xs underline">Repo</a>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <p>No projects found.</p>
          <button onClick={() => location.reload()} className="mt-2 px-2 py-1 rounded bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]">Reload</button>
        </div>
      )}
    </section>
  );
}


