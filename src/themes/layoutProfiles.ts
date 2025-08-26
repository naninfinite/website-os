/**
 * SUMMARY
 * Era + layout profile contracts and mappings. Provides getActiveEra() stub
 * returning 'terminal-os' for Chunk 1.
 */

export type Era = 'terminal-os' | 'os-91' | 'now-os';

export type DesktopProfile = {
  homeMode: 'none' | 'icons';
  windowMode: 'window' | 'max';
  launcher?: boolean;
};

export type MobileProfile = {
  homeMode: 'list' | 'grid';
  windowMode: 'page-full';
  dock?: boolean;
  search?: boolean;
};

export const layoutProfiles: Record<Era, { desktop: DesktopProfile; mobile: MobileProfile }> = {
  'terminal-os': {
    desktop: { homeMode: 'none', windowMode: 'window' },
    mobile: { homeMode: 'list', windowMode: 'page-full' },
  },
  'os-91': {
    desktop: { homeMode: 'icons', windowMode: 'window' },
    mobile: { homeMode: 'grid', windowMode: 'page-full' },
  },
  'now-os': {
    desktop: { homeMode: 'icons', windowMode: 'max', launcher: true },
    mobile: { homeMode: 'grid', windowMode: 'page-full', dock: true, search: true },
  },
};

export function getActiveEra(): Era {
  // Chunk 1 stub: always Terminal-OS. Real schedule integration arrives later.
  return 'terminal-os';
}


