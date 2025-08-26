/**
 * SUMMARY
 * Types for application registry. Defines app identifiers and metadata used to
 * render launchers and window titles.
 */

export type AppId =
  | 'about'
  | 'projects'
  | 'gallery'
  | 'settings'
  | 'connect'
  | 'arcade'
  | 'dimension';

export type AppMeta = {
  id: AppId;
  title: string;
  icon?: string; // token/icon name; renderer chooses
};


