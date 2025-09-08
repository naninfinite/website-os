// SUMMARY
// In-memory VFS implementation. Pure functions where possible; module-level
// cache stores the loaded seed root to avoid repeated fetches. Exposes
// loadSeeds, list, cd, findById, clearVfsCache.

import type { VfsFolder, VfsNode, VfsRoot, VfsPath } from './types';
const DEBUG_VFS = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV;

let cachedRoot: VfsRoot | null = null;

function normalizePath(path: VfsPath): VfsPath {
  if (!path) return '/';
  if (!path.startsWith('/')) path = '/' + path;
  // collapse multiple slashes and trim trailing slash (except root)
  const collapsed = path.replace(/\/+/g, '/');
  return collapsed !== '/' ? collapsed.replace(/\/$/, '') : '/';
}

function segments(path: VfsPath): string[] {
  const p = normalizePath(path);
  if (p === '/') return [];
  return p.split('/').filter(Boolean);
}

export async function loadSeeds(): Promise<VfsRoot> {
  if (cachedRoot) return cachedRoot;
  try {
    const resp = await fetch('/content/vfs.json');
    if (!resp.ok) throw new Error('vfs seed not found');
    const data = (await resp.json()) as VfsRoot;
    cachedRoot = data;
    if (DEBUG_VFS) console.log('[VFS] loaded seeds');
    return data;
  } catch (err) {
    // Fallback: minimal built-in seed
    const fallback: VfsRoot = {
      id: 'root',
      name: '/',
      kind: 'folder',
      children: [
        {
          id: 'desk',
          name: 'Desktop',
          kind: 'folder',
          children: [
            { id: 'readme', name: 'README.txt', kind: 'file', mime: 'text/plain', href: '/README.md' },
          ],
        },
        { id: 'work', name: 'Work', kind: 'folder', children: [{ id: 'proj', name: 'Projects', kind: 'folder', children: [] }] },
      ],
    };
    cachedRoot = fallback;
    if (DEBUG_VFS) console.log('[VFS] loaded fallback seeds');
    return fallback;
  }
}

export function clearVfsCache(): void {
  cachedRoot = null;
}

function findInFolder(folder: VfsFolder, segs: string[], idx = 0): VfsNode | undefined {
  if (idx >= segs.length) return folder;
  const s = segs[idx];
  const child = folder.children.find((c) => c.name === s || c.id === s);
  if (!child) return undefined;
  if (child.kind === 'folder') return findInFolder(child, segs, idx + 1);
  return idx === segs.length - 1 ? child : undefined;
}

export function list(path: VfsPath, root?: VfsRoot): VfsNode[] {
  const base = root ?? cachedRoot;
  if (!base) throw new Error('VFS not loaded');
  const segs = segments(path);
  if (segs.length === 0) {
    const rootSorted = [...base.children].sort((a, b) => (a.kind !== b.kind ? (a.kind === 'folder' ? -1 : 1) : a.name.localeCompare(b.name)));
    if (DEBUG_VFS) console.log('[VFS] list', '/', { count: rootSorted.length });
    return rootSorted;
  }
  const node = findInFolder(base, segs);
  if (!node) throw new Error(`Path not found: ${path}`);
  if (node.kind === 'file') throw new Error(`Path is a file: ${path}`);
  const result = [...node.children].sort((a, b) => (a.kind !== b.kind ? (a.kind === 'folder' ? -1 : 1) : a.name.localeCompare(b.name)));
  if (DEBUG_VFS) console.log('[VFS] list', normalizePath(path), { count: result.length });
  return result;
}

export function cd(current: VfsPath, segment: string): VfsPath {
  const cur = normalizePath(current);
  if (segment === '..' || segment === 'up') {
    const s = segments(cur);
    if (s.length === 0) return '/';
    return '/' + s.slice(0, -1).join('/');
  }
  const next = segment.startsWith('/') ? normalizePath(segment) : normalizePath((cur === '/' ? '' : cur) + '/' + segment);
  // prevent escaping above root
  if (!next.startsWith('/')) return '/';
  return next;
}

export function findById(id: string): VfsNode | undefined {
  if (!cachedRoot) return undefined;
  const stack: VfsNode[] = [cachedRoot];
  while (stack.length) {
    const cur = stack.shift()!;
    if (cur.id === id) return cur;
    if (cur.kind === 'folder') stack.push(...cur.children);
  }
  return undefined;
}

export default {
  loadSeeds,
  clearVfsCache,
  list,
  cd,
  findById,
};


