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
  allowHomeCustomize?: boolean;
};

export type MobileProfile = {
  homeMode: 'list' | 'grid';
  windowMode: 'page-full';
  dock?: boolean;
  search?: boolean;
  gestureDismiss?: boolean; // allow swipe-to-dismiss on mobile app pages
  allowHomeCustomize?: boolean;
};

export const layoutProfiles: Record<Era, { desktop: DesktopProfile; mobile: MobileProfile }> = {
  'terminal-os': {
    desktop: { homeMode: 'none', windowMode: 'window', allowHomeCustomize: true },
    mobile: { homeMode: 'list', windowMode: 'page-full', gestureDismiss: false, allowHomeCustomize: true },
  },
  'os-91': {
    desktop: { homeMode: 'icons', windowMode: 'window', allowHomeCustomize: false },
    mobile: { homeMode: 'grid', windowMode: 'page-full', gestureDismiss: false, allowHomeCustomize: false },
  },
  'now-os': {
    desktop: { homeMode: 'icons', windowMode: 'max', launcher: true, allowHomeCustomize: false },
    mobile: { homeMode: 'grid', windowMode: 'page-full', dock: true, search: true, gestureDismiss: true, allowHomeCustomize: false },
  },
};

export function getActiveEra(): Era {
  // Chunk 1 stub: always Terminal-OS. Real schedule integration arrives later.
  return 'terminal-os';
}


