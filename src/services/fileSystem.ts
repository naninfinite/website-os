/**
 * SUMMARY
 * Stub virtual file system: folders and files resolved by id. Provides helpers
 * to get root, get by id, and list children.
 */

export type FsFile = { id: string; title: string; type: 'txt' | 'img' | 'bin' };
export type FsFolder = { id: string; title: string; children: (FsFolder | FsFile)[] };

const fsRoot: FsFolder = {
  id: 'root',
  title: 'Root',
  children: [
    {
      id: 'docs',
      title: 'Documents',
      children: [
        { id: 'readme-txt', title: 'README.txt', type: 'txt' },
        { id: 'notes-txt', title: 'Notes.txt', type: 'txt' },
      ],
    },
    {
      id: 'media',
      title: 'Media',
      children: [
        { id: 'photo-img', title: 'Photo.png', type: 'img' },
        { id: 'logo-img', title: 'Logo.png', type: 'img' },
      ],
    },
  ],
};

function walk(folder: FsFolder, acc: Record<string, FsFolder | FsFile> = {}): Record<string, FsFolder | FsFile> {
  acc[folder.id] = folder;
  for (const child of folder.children) {
    if ('children' in child) walk(child as FsFolder, acc);
    else acc[child.id] = child;
  }
  return acc;
}

const indexById = walk(fsRoot);

export function getRoot(): FsFolder {
  return fsRoot;
}

export function getById(id: string): FsFolder | FsFile | null {
  return indexById[id] ?? null;
}

export function listChildren(id: string): (FsFolder | FsFile)[] {
  const node = indexById[id];
  if (!node) return [];
  if ('children' in (node as FsFolder)) return (node as FsFolder).children;
  return [];
}


