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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [anchorIndex, setAnchorIndex] = useState<number | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
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

  const selectSingleAt = (idx: number) => {
    const n = nodes[idx];
    if (!n) return;
    setSelectedIds([n.id]);
    setAnchorIndex(idx);
    setRenamingId(null);
    if (n.kind === 'file') setPreview(n as VfsFile);
    if (DEBUG_FILEMAN) console.log('[FileMan] select', n.name);
  };

  const toggleSelectAt = (idx: number) => {
    const n = nodes[idx];
    if (!n) return;
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (set.has(n.id)) set.delete(n.id); else set.add(n.id);
      return Array.from(set);
    });
    setAnchorIndex(idx);
  };

  const rangeSelectTo = (idx: number) => {
    if (anchorIndex === null) {
      selectSingleAt(idx);
      return;
    }
    const start = Math.min(anchorIndex, idx);
    const end = Math.max(anchorIndex, idx);
    const rangeIds = nodes.slice(start, end + 1).map((n) => n.id);
    setSelectedIds(rangeIds);
  };

  const openNode = (n: VfsNode) => {
    if (n.kind === 'folder') {
      const nextPath = (path === '/' ? '' : path) + '/' + n.name;
      if (DEBUG_FILEMAN) console.log('[FileMan] cd', nextPath);
      setPath(nextPath);
      setPreview(null);
      setSelectedIds([]);
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
    setSelectedIds([]);
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

  const newFolder = async () => {
    try {
      const cwdId = vfs.getFolderIdByPath(path);
      const newId = await vfs.mkdir(cwdId, 'New Folder');
      if (DEBUG_FILEMAN) console.log('[FileMan] mkdir "New Folder" -> id=' + newId);
      setNodes(vfs.list(path));
      setSelectedIds([newId]);
      setRenamingId(newId);
      setRenameValue('New Folder');
    } catch (err) {
      if (DEBUG_FILEMAN) console.warn('[FileMan] newFolder failed', err);
    }
  };

  const startRename = () => {
    if (selectedIds.length !== 1) return;
    const id = selectedIds[0];
    const node = nodes.find((n) => n.id === id);
    if (!node) return;
    setRenamingId(id);
    setRenameValue(node.name);
  };

  const commitRename = async () => {
    if (!renamingId) return;
    const node = nodes.find((n) => n.id === renamingId);
    const next = (renameValue ?? '').trim();
    if (!node || !next || next === node.name) {
      setRenamingId(null);
      return;
    }
    await vfs.rename(renamingId, next);
    if (DEBUG_FILEMAN) console.log('[FileMan] rename id=' + renamingId + ' "' + node.name + '" -> "' + next + '"');
    setNodes(vfs.list(path));
    setRenamingId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
  };

  const removeSelection = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected item(s)?`)) return;
    for (const id of selectedIds) {
      await vfs.remove(id);
    }
    if (DEBUG_FILEMAN) console.log('[FileMan] remove count=' + selectedIds.length);
    setSelectedIds([]);
    setRenamingId(null);
    setNodes(vfs.list(path));
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
    if ((e.metaKey || e.ctrlKey) && (e.key === 'n' || e.key === 'N')) {
      e.preventDefault();
      newFolder();
    }
    if (e.key === 'F2') {
      e.preventDefault();
      startRename();
    }
    if (e.key === 'Delete' || e.key === 'Backspace') {
      // Allow Backspace only when not navigating up via Alt+Backspace
      if (!(e.altKey && e.key === 'Backspace')) {
        e.preventDefault();
        removeSelection();
      }
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
            <button className="btn" onClick={newFolder} aria-label="New Folder">New Folder</button>
            <button className="btn" onClick={startRename} disabled={selectedIds.length !== 1} aria-label="Rename">Rename</button>
            <button className="btn" onClick={removeSelection} disabled={selectedIds.length === 0} aria-label="Delete">Delete</button>
            <button className="btn" onClick={() => { setView((v) => (v === 'list' ? 'icons' : 'list')); if (DEBUG_FILEMAN) console.log('[FileMan] view toggle', view); }} aria-label="Toggle view">
              {view === 'list' ? 'Icons' : 'List'}
            </button>
            <button className="btn" onClick={refresh} aria-label="Refresh">Refresh</button>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading ? <div>Loading…</div> : null}
          {view === 'icons' ? (
            <div className="fm-grid" role="list" aria-label="File list">
              {nodes.map((n, idx) => {
                const isSelected = selectedIds.includes(n.id);
                const onItemClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
                  if (e.shiftKey) return rangeSelectTo(idx);
                  if (e.metaKey || e.ctrlKey) return toggleSelectAt(idx);
                  selectSingleAt(idx);
                };
                return (
                  <button
                    key={n.id}
                    ref={(el) => (gridRefs.current[idx] = el)}
                    className={`fm-tile${isSelected ? ' fm-selected' : ''}`}
                    role="listitem"
                    onClick={onItemClick}
                    onDoubleClick={() => openNode(n)}
                    onKeyDown={(e) => onKeyGrid(e, idx)}
                    tabIndex={0}
                  >
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{n.kind === 'folder' ? '📁' : '📄'}</div>
                    {renamingId === n.id ? (
                      <input
                        className="fm-rename-input"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitRename(); } if (e.key === 'Escape') { e.preventDefault(); cancelRename(); } }}
                        autoFocus
                      />
                    ) : (
                      <div className="text-sm truncate w-full">{n.name}</div>
                    )}
                  </button>
                );
              })}
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
                {nodes.map((n, idx) => {
                  const isSelected = selectedIds.includes(n.id);
                  const onRowClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
                    if (e.shiftKey) return rangeSelectTo(idx);
                    if (e.metaKey || e.ctrlKey) return toggleSelectAt(idx);
                    selectSingleAt(idx);
                  };
                  return (
                    <tr key={n.id} className={isSelected ? 'fm-selected' : ''}>
                      <td>
                        {renamingId === n.id ? (
                          <input
                            className="fm-rename-input"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commitRename(); } if (e.key === 'Escape') { e.preventDefault(); cancelRename(); } }}
                            autoFocus
                          />
                        ) : (
                          <button className="text-left" onClick={onRowClick} onDoubleClick={() => openNode(n)}>{n.name}</button>
                        )}
                      </td>
                      <td>{n.kind}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="fm-statusbar" role="status" aria-live="polite">
          <div>{nodes.length} items • {selectedIds.length} selected</div>
          <div className="opacity-70 truncate" title={path}>{path}</div>
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


