/**
 * SUMMARY
 * AppRegistry provides metadata and stub renderers for all apps. Real app
 * implementations will live under `apps/*` later; for Sprint 1 we return
 * lightweight placeholders.
 */
import React from 'react';
import type { AppId, AppMeta } from './types';

export const appMetas: AppMeta[] = [
  { id: 'about', title: 'About.EXE' },
  { id: 'projects', title: 'Projects.EXE' },
  { id: 'gallery', title: 'Gallery.EXE' },
  { id: 'settings', title: 'Settings.EXE' },
  { id: 'connect', title: 'Connect.EXE' },
  { id: 'arcade', title: 'Arcade.EXE' },
  { id: 'dimension', title: 'Dimension.EXE' },
];

export function getAppMeta(id: AppId): AppMeta {
  const found = appMetas.find((a) => a.id === id);
  if (!found) throw new Error(`Unknown app: ${id}`);
  return found;
}

export function AppStub(props: { id: AppId }): JSX.Element {
  const meta = getAppMeta(props.id);
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold">{meta.title}</h2>
      <p className="opacity-70 text-sm">Stub content for {meta.id}. Coming soon.</p>
    </div>
  );
}


