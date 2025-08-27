/**
 * SUMMARY
 * File Browser app stub. Shows current folder with breadcrumbs and lists child
 * files/folders. Supports deep-link via startPathId prop (optional).
 */
import React, { useMemo, useState } from 'react';
import { getRoot, getById, listChildren, type FsFolder, type FsFile } from '../../services/fileSystem';

export default function FileBrowserApp(props: { startPathId?: string }): JSX.Element {
  const root = getRoot();
  const startNode = props.startPathId ? getById(props.startPathId) : root;
  const startFolder = (startNode && 'children' in (startNode as FsFolder) ? (startNode as FsFolder) : root) as FsFolder;
  const [current, setCurrent] = useState<FsFolder>(startFolder);

  const crumbs = useMemo(() => {
    // simple breadcrumb by walking up ids in title; since this is a stub, we rebuild path
    const path: FsFolder[] = [];
    const dfs = (node: FsFolder, acc: FsFolder[]): boolean => {
      acc.push(node);
      if (node.id === current.id) return true;
      for (const c of node.children) {
        if ('children' in (c as any)) {
          if (dfs(c as FsFolder, acc)) return true;
        }
      }
      acc.pop();
      return false;
    };
    dfs(root, path);
    return path;
  }, [current, root]);

  const children = listChildren(current.id);

  return (
    <div className="p-3">
      <div className="text-sm opacity-80">{current.title}</div>
      <nav className="flex gap-1 text-xs opacity-70" aria-label="Breadcrumbs" style={{ margin: '8px 0' }}>
        {crumbs.map((c, idx) => (
          <button key={c.id} className="underline" onClick={() => setCurrent(c)}>
            {c.title}{idx < crumbs.length - 1 ? ' / ' : ''}
          </button>
        ))}
      </nav>
      <div className="file-list">
        {children.map((child) =>
          'children' in (child as any) ? (
            <button key={child.id} className="file-item text-left" onClick={() => setCurrent(child as FsFolder)}>
              📁 {(child as FsFolder).title}
            </button>
          ) : (
            <button key={child.id} className="file-item text-left" onClick={() => { /* open stub */ }} onContextMenu={(e) => { e.preventDefault(); }}>
              📄 {(child as FsFile).title}
            </button>
          )
        )}
      </div>
    </div>
  );
}


