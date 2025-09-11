// SUMMARY
// Local-storage-backed VFS built on top of seed VFS. Loads seeds from
// `memoryVfs.loadSeeds()` and persists user mutations to storage. Provides
// mkdir/create/rename/delete and read operations with a small storage shim so
// tests can run in Node without `window.localStorage`.

import type { VfsFile, VfsFolder, VfsNode, VfsPath, VfsRoot } from './types';
import * as seedVfs from './memoryVfs';

const DEBUG_LOCAL_VFS = typeof import.meta !== 'undefined' && (import.meta as any).env?.DEV;
const STORAGE_KEY = 'website-os.vfs';

let __testStorage: Storage | null = null;
let __memoryStorage: Storage | null = null;

export function __setStorageForTests(storage: Storage | null): void {
  __testStorage = storage;
}

export function __resetForTests(): void {
  cachedRoot = null;
  try {
    (__memoryStorage as any)?.clear?.();
  } catch {}
}

function getStorage(): Storage {
  if (__testStorage) return __testStorage;
  const g: any = (typeof globalThis !== 'undefined' ? (globalThis as any) : {});
  const ls: Storage | undefined = g?.localStorage as Storage | undefined;
  if (ls && typeof ls.getItem === 'function') return ls;
  if (!__memoryStorage) {
    const map = new Map<string, string>();
    __memoryStorage = {
      getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
      setItem: (k: string, v: string) => void map.set(k, String(v)),
      removeItem: (k: string) => void map.delete(k),
      clear: () => void map.clear(),
      key: (i: number) => Array.from(map.keys())[i] ?? null,
      get length() {
        return map.size;
      },
    } as unknown as Storage;
  }
  return __memoryStorage as Storage;
}

let cachedRoot: VfsRoot | null = null;

function cloneNode<T extends VfsNode>(n: T): T {
  return JSON.parse(JSON.stringify(n));
}

function normalizePath(path: VfsPath): VfsPath {
  if (!path) return '/';
  if (!path.startsWith('/')) path = '/' + path;
  const collapsed = path.replace(/\/+/g, '/');
  return collapsed !== '/' ? collapsed.replace(/\/$/, '') : '/';
}

function segments(path: VfsPath): string[] {
  const p = normalizePath(path);
  if (p === '/') return [];
  return p.split('/').filter(Boolean);
}

function findInFolder(folder: VfsFolder, segs: string[], idx = 0): VfsNode | undefined {
  if (idx >= segs.length) return folder;
  const s = segs[idx];
  const child = folder.children.find((c) => c.name === s || c.id === s);
  if (!child) return undefined;
  if (child.kind === 'folder') return findInFolder(child, segs, idx + 1);
  return idx === segs.length - 1 ? child : undefined;
}

let customIdGenerator: (() => string) | null = null;
export function __setIdGenerator(gen: (() => string) | null): void {
  customIdGenerator = gen;
}

function generateId(prefix = 'u'): string {
  if (customIdGenerator) return customIdGenerator();
  const salt = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${salt}`;
}

// Additive ID alias used by wrappers
export type VfsId = string;

export async function loadSeeds(): Promise<VfsRoot> {
  if (cachedRoot) return cachedRoot;
  const storage = getStorage();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as VfsRoot;
      cachedRoot = parsed;
      if (DEBUG_LOCAL_VFS) console.log('[localVfs] loaded from storage');
      return parsed;
    }
  } catch (e) {
    // ignore corrupted storage; fall back to seeds
    if (DEBUG_LOCAL_VFS) console.warn('[localVfs] storage parse failed, using seeds');
  }
  const seeds = await seedVfs.loadSeeds();
  // Clone so subsequent mutations do not affect the seed cache
  cachedRoot = cloneNode(seeds);
  return cachedRoot;
}

export function clearVfsCache(): void {
  cachedRoot = null;
}

function persist(): void {
  if (!cachedRoot) return;
  const storage = getStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify(cachedRoot));
}

export function reset(): void {
  const storage = getStorage();
  storage.removeItem(STORAGE_KEY);
  cachedRoot = null;
}

export function list(path: VfsPath): VfsNode[] {
  if (!cachedRoot) throw new Error('VFS not loaded');
  return seedVfs.list(path, cachedRoot);
}

export function cd(current: VfsPath, segment: string): VfsPath {
  return seedVfs.cd(current, segment);
}

export function findById(id: string): VfsNode | undefined {
  if (!cachedRoot) return undefined;
  // simple DFS
  const stack: VfsNode[] = [cachedRoot];
  while (stack.length) {
    const cur = stack.shift()!;
    if (cur.id === id) return cur;
    if (cur.kind === 'folder') stack.push(...cur.children);
  }
  return undefined;
}

function findFolderAndParentById(id: VfsId): { parent: VfsFolder | null; folder: VfsFolder } | null {
  if (!cachedRoot) return null;
  if (cachedRoot.id === id) return { parent: null, folder: cachedRoot };
  type StackItem = { parent: VfsFolder | null; node: VfsNode };
  const stack: StackItem[] = [{ parent: null, node: cachedRoot }];
  while (stack.length) {
    const cur = stack.shift()!;
    if (cur.node.kind === 'folder') {
      for (const child of cur.node.children) {
        if (child.kind === 'folder') {
          if (child.id === id) return { parent: cur.node, folder: child };
          stack.push({ parent: cur.node, node: child });
        }
      }
    }
  }
  return null;
}

function ensureUniqueName(parentFolder: VfsFolder, desiredName: string): string {
  const trimmed = desiredName.trim();
  if (!trimmed) return desiredName;
  const existing = new Set(parentFolder.children.map((c) => c.name));
  if (!existing.has(trimmed)) return trimmed;
  const base = trimmed;
  let n = 2;
  let candidate = `${base} (${n})`;
  while (existing.has(candidate)) {
    n += 1;
    candidate = `${base} (${n})`;
  }
  return candidate;
}

function assertFolderAtPath(path: VfsPath): VfsFolder {
  if (!cachedRoot) throw new Error('VFS not loaded');
  const segs = segments(path);
  if (segs.length === 0) return cachedRoot;
  const node = findInFolder(cachedRoot, segs);
  if (!node || node.kind !== 'folder') throw new Error(`Folder not found: ${path}`);
  return node as VfsFolder;
}

export function mkdir(path: VfsPath, name: string): VfsFolder;
export function mkdir(parentId: VfsId, name: string): Promise<VfsId>;
export function mkdir(pathOrId: string, name: string): VfsFolder | Promise<VfsId> {
  if (!cachedRoot) throw new Error('VFS not loaded');
  // Path-based (existing behavior: throws on duplicate)
  if (pathOrId.startsWith('/')) {
    const target = assertFolderAtPath(pathOrId);
    if (!name || /\//.test(name)) throw new Error('Invalid folder name');
    if (target.children.some((c) => c.name === name)) throw new Error('Name already exists');
    const folder: VfsFolder = { id: generateId('dir'), name, kind: 'folder', children: [] };
    target.children.push(folder);
    persist();
    return folder;
  }
  // ID-based wrapper: ensures unique sibling name and returns new id
  const found = findFolderAndParentById(pathOrId as VfsId);
  if (!found) return Promise.reject(new Error('Parent not found'));
  const parent = found.folder;
  const unique = ensureUniqueName(parent, name);
  const folder: VfsFolder = { id: generateId('dir'), name: unique, kind: 'folder', children: [] };
  parent.children.push(folder);
  persist();
  return Promise.resolve(folder.id);
}

export function createFile(path: VfsPath, name: string, init?: Partial<Omit<VfsFile, 'kind' | 'name' | 'id'>>): VfsFile {
  if (!cachedRoot) throw new Error('VFS not loaded');
  const target = assertFolderAtPath(path);
  if (!name || /\//.test(name)) throw new Error('Invalid file name');
  if (target.children.some((c) => c.name === name)) throw new Error('Name already exists');
  const file: VfsFile = { id: generateId('file'), name, kind: 'file', mime: init?.mime, href: init?.href, meta: init?.meta };
  target.children.push(file);
  persist();
  return file;
}

export function renameById(id: string, newName: string): VfsNode {
  if (!cachedRoot) throw new Error('VFS not loaded');
  if (!newName || /\//.test(newName)) throw new Error('Invalid name');
  type StackItem = { parent: VfsFolder | null; node: VfsNode };
  const stack: StackItem[] = [{ parent: null, node: cachedRoot }];
  while (stack.length) {
    const cur = stack.shift()!;
    if (cur.node.id === id) {
      if (!cur.parent) {
        // renaming root is not allowed
        throw new Error('Cannot rename root');
      }
      if (cur.parent.children.some((c) => c !== cur.node && c.name === newName)) {
        throw new Error('Name already exists');
      }
      (cur.node as any).name = newName;
      persist();
      return cur.node;
    }
    if (cur.node.kind === 'folder') {
      for (const child of cur.node.children) stack.push({ parent: cur.node, node: child });
    }
  }
  throw new Error('Node not found');
}

export function deleteById(id: string): void {
  if (!cachedRoot) throw new Error('VFS not loaded');
  type StackItem = { parent: VfsFolder | null; node: VfsNode };
  const stack: StackItem[] = [{ parent: null, node: cachedRoot }];
  while (stack.length) {
    const cur = stack.shift()!;
    if (cur.node.kind === 'folder') {
      const idx = cur.node.children.findIndex((c) => c.id === id);
      if (idx >= 0) {
        cur.node.children.splice(idx, 1);
        persist();
        return;
      }
      for (const child of cur.node.children) stack.push({ parent: cur.node, node: child });
    }
  }
  throw new Error('Node not found');
}

// Async wrappers for UI/tests; non-breaking additions
export async function rename(id: VfsId, nextName: string): Promise<void> {
  if (!cachedRoot) return;
  const trimmed = String(nextName ?? '').trim();
  if (!trimmed) return;
  type StackItem = { parent: VfsFolder | null; node: VfsNode };
  const stack: StackItem[] = [{ parent: null, node: cachedRoot }];
  while (stack.length) {
    const cur = stack.shift()!;
    if (cur.node.id === id) {
      if (!cur.parent) return; // do not rename root
      (cur.node as any).name = ensureUniqueName(cur.parent, trimmed);
      persist();
      return;
    }
    if (cur.node.kind === 'folder') stack.push(...cur.node.children.map((c) => ({ parent: cur.node as VfsFolder, node: c })));
  }
}

export async function remove(id: VfsId): Promise<void> {
  deleteById(id);
}

// Helper: resolve folder id by path (additive)
export function getFolderIdByPath(path: VfsPath): VfsId {
  const folder = assertFolderAtPath(path);
  return folder.id;
}

export default {
  loadSeeds,
  clearVfsCache,
  reset,
  list,
  cd,
  findById,
  mkdir,
  createFile,
  renameById,
  deleteById,
};


