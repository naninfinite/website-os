/**
 * SUMMARY
 * Minimal File Manager (FileMan.EXE) MVP. Uses a localStorage-backed VFS
 * layered on seeds from `public/content/vfs.json`. Supports list/icons views,
 * breadcrumb navigation, keyboard navigation, selection, and a small preview
 * for files without href. User-created folders persist across reloads.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useEra } from '../../shell/era/EraContext';
import type { VfsNode, VfsPath, VfsFile, VfsFolder } from '../../services/vfs/types';
import * as vfs from '../../services/vfs/localVfs';
import '../../apps/fileman/styles.css';

const DEBUG_FILEMAN = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV;

export default function FileManApp(): JSX.Element {
  const { eraId } = useEra();
  const defaultView = useMemo(() => (eraId === 'now-os' ? 'list' : 'icons'), [eraId]) as 'list' | 'icons';
  const [view, setView] = useState<'list' | 'icons'>(defaultView);
  const [path, setPath] = useState<VfsPath>('/');
  const [nodes, setNodes] = useState<VfsNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<VfsFile | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const gridRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (DEBUG_FILEMAN) console.log('[FileMan] mount');
    (async () => {
      setLoading(true);
      await vfs.loadSeeds();
      try {
        const list = vfs.list(path);
        setNodes(list);
      } catch (err) {
        setNodes([]);
      }
      setLoading(false);
    })();
    return () => {
      if (DEBUG_FILEMAN) console.log('[FileMan] unmount');
    };
  }, []);

  useEffect(() => {
    // when era changes, only set initial view (do not override user's choice)
    setView((cur) => (cur ? cur : defaultView));
  }, [defaultView]);

  useEffect(() => {
    if (DEBUG_FILEMAN) console.log('[FileMan] cwd changed:', path);
  }, [path]);

  const refresh = async () => {
    if (DEBUG_FILEMAN) console.log('[FileMan] refresh');
    setLoading(true);
    vfs.clearVfsCache();
    await vfs.loadSeeds();
    try {
      setNodes(vfs.list(path));
    } catch (err) {
      setNodes([]);
    }
    setLoading(false);
  };

  const selectNode = (n: VfsNode) => {
    setSelectedId(n.id);
    if (n.kind === 'file') setPreview(n as VfsFile);
  };

  const openNode = (n: VfsNode) => {
    if (n.kind === 'folder') {
      const nextPath = (path === '/' ? '' : path) + '/' + n.name;
      if (DEBUG_FILEMAN) console.log('[FileMan] cd', nextPath);
      setPath(nextPath);
      setPreview(null);
      setSelectedId(null);
      setNodes(vfs.list(nextPath));
      return;
    }
    const f = n as VfsFile;
    if (f.href) {
      window.open(f.href, '_blank', 'noopener');
      return;
    }
    setPreview(f);
  };

  const up = () => {
    const segs = path.split('/').filter(Boolean);
    if (segs.length === 0) return;
    const next = '/' + segs.slice(0, -1).join('/');
    if (DEBUG_FILEMAN) console.log('[FileMan] up ->', next || '/');
    setPath(next || '/');
    setSelectedId(null);
    setNodes(vfs.list(next || '/'));
  };

  const onKeyGrid = (e: React.KeyboardEvent, idx: number) => {
    const cols = Math.max(1, Math.floor((gridRefs.current[0]?.offsetParent as HTMLElement)?.offsetWidth / 112) || 3);
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        gridRefs.current[(idx + 1) % gridRefs.current.length]?.focus();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        gridRefs.current[(idx - 1 + gridRefs.current.length) % gridRefs.current.length]?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        gridRefs.current[(idx + cols) % gridRefs.current.length]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        gridRefs.current[(idx - cols + gridRefs.current.length) % gridRefs.current.length]?.focus();
        break;
      case 'Enter':
        e.preventDefault();
        openNode(nodes[idx]);
        break;
      case 'Backspace':
        e.preventDefault();
        up();
        break;
      case 'Escape':
        e.preventDefault();
        up();
        break;
    }
  };

  const newFolder = () => {
    try {
      // Generate a unique name like "New Folder", "New Folder (2)", ...
      const base = 'New Folder';
      let candidate = base;
      let num = 2;
      const names = new Set(nodes.map((n) => n.name));
      while (names.has(candidate)) {
        candidate = `${base} (${num++})`;
      }
      const created = vfs.mkdir(path, candidate);
      setNodes(vfs.list(path));
      setSelectedId(created.id);
    } catch (err) {
      // no-op; could show toast later
      if (DEBUG_FILEMAN) console.warn('[FileMan] newFolder failed', err);
    }
  };

  const crumbs = useMemo(() => {
    const segs = path.split('/').filter(Boolean);
    const parts = [{ name: '/', path: '/' } as { name: string; path: string }];
    let cur = '';
    segs.forEach((s) => {
      cur = cur + '/' + s;
      parts.push({ name: s, path: cur });
    });
    return parts;
  }, [path]);

  // Global shortcuts: Cmd/Ctrl+1 = icons, Cmd/Ctrl+2 = list, Alt+Left goes up
  const onKeyGlobal: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === '1') {
      e.preventDefault();
      setView('icons');
    }
    if ((e.metaKey || e.ctrlKey) && e.key === '2') {
      e.preventDefault();
      setView('list');
    }
    if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'Backspace')) {
      e.preventDefault();
      up();
    }
  };

  return (
    <div className="p-3 min-h-[240px] flex gap-4" onKeyDown={onKeyGlobal}>
      <div style={{ flex: 1 }}>
        <div className="fm-toolbar">
          <div className="fm-breadcrumb" role="navigation" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <button
                key={c.path}
                onClick={() => {
                  if (DEBUG_FILEMAN) console.log('[FileMan] breadcrumb', c.path);
                  setPath(c.path);
                  setNodes(vfs.list(c.path));
                }}
                className="px-2 py-1 rounded bg-foreground/5"
              >
                {c.name}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={newFolder} aria-label="New Folder">New Folder</button>
            <button onClick={() => { setView((v) => (v === 'list' ? 'icons' : 'list')); if (DEBUG_FILEMAN) console.log('[FileMan] view toggle', view); }} aria-label="Toggle view">
              {view === 'list' ? 'Icons' : 'List'}
            </button>
            <button onClick={refresh} aria-label="Refresh">Refresh</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading ? <div>Loading…</div> : null}
          {view === 'icons' ? (
            <div className="fm-grid" role="list" aria-label="File list">
              {nodes.map((n, idx) => (
                <button
                  key={n.id}
                  ref={(el) => (gridRefs.current[idx] = el)}
                  className={`fm-tile${selectedId === n.id ? ' fm-selected' : ''}`}
                  role="listitem"
                  onClick={() => selectNode(n)}
                  onDoubleClick={() => openNode(n)}
                  onKeyDown={(e) => onKeyGrid(e, idx)}
                  tabIndex={0}
                >
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{n.kind === 'folder' ? '📁' : '📄'}</div>
                  <div className="text-sm truncate w-full">{n.name}</div>
                </button>
              ))}
            </div>
          ) : (
            <table className="fm-list" role="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                </tr>
              </thead>
              <tbody>
                {nodes.map((n) => (
                  <tr key={n.id} className={selectedId === n.id ? 'fm-selected' : ''}>
                    <td>
                      <button className="text-left" onClick={() => selectNode(n)} onDoubleClick={() => openNode(n)}>{n.name}</button>
                    </td>
                    <td>{n.kind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div style={{ width: 260 }} aria-label="Preview">
        {preview ? (
          <div className="fm-preview">
            <div className="text-sm font-medium">{preview.name}</div>
            <div className="text-xs opacity-70">{preview.mime ?? 'file'}</div>
            <div style={{ marginTop: 8 }}>{preview.meta ? JSON.stringify(preview.meta) : 'No preview available.'}</div>
          </div>
        ) : (
          <div className="fm-preview">No file selected</div>
        )}
      </div>
    </div>
  );
}


