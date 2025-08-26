/**
 * SUMMARY
 * Era layout profile contract and mappings for desktop and mobile behaviors.
 * Drives shell decisions (home layout, windowing, optional launcher/dock/search).
 * Keep era IDs stable across schedule and themes.
 */

export type DesktopLayoutProfile = {
  homeMode: 'none' | 'icons';
  windowMode: 'window' | 'max';
  launcher?: boolean;
};

export type MobileLayoutProfile = {
  homeMode: 'list' | 'grid';
  windowMode: 'page-full';
  dock?: boolean;
  search?: boolean;
};

export type EraLayoutProfile = {
  desktop: DesktopLayoutProfile;
  mobile: MobileLayoutProfile;
};

export type EraId = 'terminal-os' | 'os-91' | 'now-os';

export const layoutProfiles: Record<EraId, EraLayoutProfile> = {
  'terminal-os': {
    desktop: { homeMode: 'none', windowMode: 'max' },
    mobile: { homeMode: 'list', windowMode: 'page-full' },
  },
  'os-91': {
    desktop: { homeMode: 'icons', windowMode: 'window' },
    mobile: { homeMode: 'grid', windowMode: 'page-full' },
  },
  'now-os': {
    desktop: { homeMode: 'icons', windowMode: 'window', launcher: true },
    mobile: { homeMode: 'grid', windowMode: 'page-full', dock: true, search: true },
  },
};


