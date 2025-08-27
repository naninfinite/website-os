import type React from "react";

import AboutApp, { appMeta as aboutMeta } from "../apps/about";
import ProjectsApp, { appMeta as projectsMeta } from "../apps/projects";
import GalleryApp, { appMeta as galleryMeta } from "../apps/gallery";
import SettingsApp, { appMeta as settingsMeta } from "../apps/settings";
import ConnectApp, { appMeta as connectMeta } from "../apps/connect";
import ArcadeApp, { appMeta as arcadeMeta } from "../apps/arcade";
import DimensionApp, { appMeta as dimensionMeta } from "../apps/dimension";
import TerminalApp, { appMeta as terminalMeta } from "../apps/terminal";

export type AppMeta = { id: string; title: string; icon?: string };

export const appRegistry: Record<
  string,
  { meta: AppMeta; component: React.FC }
> = {
  [aboutMeta.id]: { meta: aboutMeta, component: AboutApp },
  [projectsMeta.id]: { meta: projectsMeta, component: ProjectsApp },
  [galleryMeta.id]: { meta: galleryMeta, component: GalleryApp },
  [settingsMeta.id]: { meta: settingsMeta, component: SettingsApp },
  [connectMeta.id]: { meta: connectMeta, component: ConnectApp },
  [arcadeMeta.id]: { meta: arcadeMeta, component: ArcadeApp },
  [dimensionMeta.id]: { meta: dimensionMeta, component: DimensionApp },
  [terminalMeta.id]: { meta: terminalMeta, component: TerminalApp },
};

export function getAppMeta(id: string): AppMeta | undefined {
  return appRegistry[id]?.meta;
}

export function getAllApps(): AppMeta[] {
  return Object.values(appRegistry).map((r) => r.meta);
}