import { describe, it, expect, beforeEach } from 'vitest';
import * as vfs from '../memoryVfs';

describe('memoryVfs', () => {
  beforeEach(() => {
    vfs.clearVfsCache();
  });

  it('loads seeds and lists root', async () => {
    const root = await vfs.loadSeeds();
    expect(root).toBeTruthy();
    const nodes = vfs.list('/');
    expect(Array.isArray(nodes)).toBe(true);
    expect(nodes.find((n) => n.name === 'Desktop')).toBeTruthy();
  });

  it('cd into folder and finds file by id', async () => {
    await vfs.loadSeeds();
    const deskChildren = vfs.list('/Desktop');
    expect(deskChildren.some((n) => n.name === 'README.txt')).toBe(true);
    const readme = deskChildren.find((n) => n.name === 'README.txt');
    expect(readme).toBeDefined();
    if (readme) expect(vfs.findById(readme.id)).toEqual(readme);
  });

  it('prevents escaping root with cd("..")', async () => {
    await vfs.loadSeeds();
    const up = vfs.cd('/', '..');
    expect(up).toBe('/');
  });
});


