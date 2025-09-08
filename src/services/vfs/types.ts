// SUMMARY: VFS type definitions used by the in-memory virtual filesystem (VFS) service.
// Purpose: share small, well-typed shapes for files/folders and paths across the app.

export type VfsNodeBase = { id: string; name: string; kind: 'file' | 'folder' };
export type VfsFile = VfsNodeBase & {
  kind: 'file';
  mime?: string;
  href?: string; // optional public href to open
  meta?: Record<string, unknown>;
};
export type VfsFolder = VfsNodeBase & { kind: 'folder'; children: Array<VfsFolder | VfsFile> };
export type VfsRoot = VfsFolder; // root folder
export type VfsNode = VfsFolder | VfsFile;
export type VfsPath = string; // e.g. "/", "/Work/Projects"
