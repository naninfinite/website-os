import type React from "react";

import AboutApp from "../apps/about";
import { appMeta as aboutMeta } from "../apps/about/meta";

import ProjectsApp from "../apps/projects";
import { appMeta as projectsMeta } from "../apps/projects/meta";

import GalleryApp from "../apps/gallery";
import { appMeta as galleryMeta } from "../apps/gallery/meta";

import SettingsApp from "../apps/settings";
import { appMeta as settingsMeta } from "../apps/settings/meta";

import ConnectApp from "../apps/connect";
import { appMeta as connectMeta } from "../apps/connect/meta";

import ArcadeApp from "../apps/arcade";
import { appMeta as arcadeMeta } from "../apps/arcade/meta";

import DimensionApp from "../apps/dimension";
import { appMeta as dimensionMeta } from "../apps/dimension/meta";

import TerminalApp from "../apps/terminal";
import { appMeta as terminalMeta } from "../apps/terminal/meta";
import RecentsApp from "../apps/recents/RecentsApp";
import { appMeta as recentsMeta } from "../apps/recents/meta";
import FileBrowserApp from "../apps/filebrowser/FileBrowserApp";
import { appMeta as fileBrowserMeta } from "../apps/filebrowser/meta";

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
  [recentsMeta.id]: { meta: recentsMeta, component: RecentsApp },
  [fileBrowserMeta.id]: { meta: fileBrowserMeta, component: FileBrowserApp },
};

export function getAppMeta(id: string): AppMeta | undefined {
  return appRegistry[id]?.meta;
}

export function getAllApps(): AppMeta[] {
  return Object.values(appRegistry).map((r) => r.meta);
}


