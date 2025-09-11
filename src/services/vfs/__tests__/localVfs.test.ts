/* @vitest-environment node */
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import as module path string to allow vi.resetModules() re-import
const modulePath = '../../vfs/localVfs';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
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

async function importLocalVfs() {
  // Fresh import after potential module reset
  const mod = await import(modulePath);
  return mod as typeof import('../../vfs/localVfs');
}

describe('localVfs', () => {
  let storage: Storage;

  beforeEach(async () => {
    storage = createMemoryStorage();
    vi.resetModules();
    const vfs = await importLocalVfs();
    vfs.__setStorageForTests(storage);
    vfs.__resetForTests();
    storage.clear();
  });

  it('loads seeds and lists root', async () => {
    const vfs = await importLocalVfs();
    await vfs.loadSeeds();
    const nodes = vfs.list('/');
    expect(Array.isArray(nodes)).toBe(true);
    // Sort names for deterministic assertions
    const names = nodes.map((n) => n.name).sort();
    expect(names.length).toBeGreaterThan(0);
  });

  it('mkdir persists across module reload', async () => {
    let vfs = await importLocalVfs();
    await vfs.loadSeeds();
    vfs.mkdir('/', 'New Folder');

    vi.resetModules();
    vfs = await importLocalVfs();
    vfs.__setStorageForTests(storage);
    await vfs.loadSeeds();
    const names = vfs.list('/').map((n) => n.name).sort();
    expect(names).toContain('New Folder');
  });

  it('rename persists', async () => {
    let vfs = await importLocalVfs();
    await vfs.loadSeeds();
    const folder = vfs.mkdir('/', 'Temp');
    vfs.renameById(folder.id, 'Renamed');

    vi.resetModules();
    vfs = await importLocalVfs();
    vfs.__setStorageForTests(storage);
    await vfs.loadSeeds();
    const names = vfs.list('/').map((n) => n.name).sort();
    expect(names).toContain('Renamed');
    expect(names).not.toContain('Temp');
  });

  it('delete persists', async () => {
    let vfs = await importLocalVfs();
    await vfs.loadSeeds();
    const folder = vfs.mkdir('/', 'DeleteMe');
    vfs.deleteById(folder.id);

    vi.resetModules();
    vfs = await importLocalVfs();
    vfs.__setStorageForTests(storage);
    await vfs.loadSeeds();
    const names = vfs.list('/').map((n) => n.name).sort();
    expect(names).not.toContain('DeleteMe');
  });

  it('reset clears storage and restores seeds', async () => {
    let vfs = await importLocalVfs();
    await vfs.loadSeeds();
    vfs.mkdir('/', 'TempAgain');
    vfs.reset();

    vi.resetModules();
    vfs = await importLocalVfs();
    vfs.__setStorageForTests(storage);
    await vfs.loadSeeds();
    const names = vfs.list('/').map((n) => n.name).sort();
    expect(names).not.toContain('TempAgain');
  });
});


