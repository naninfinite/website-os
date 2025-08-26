import { describe, it, expect } from 'vitest';
// If your path differs, adjust the import:
import { layoutProfiles } from '../../themes/layoutProfiles'

describe('layout profiles (PRD contract)', () => {
  it('terminal-os mobile is list mode', () => {
    expect(layoutProfiles['terminal-os'].mobile.homeMode).toBe('list');
  });

  it('os-91 desktop shows icons', () => {
    expect(layoutProfiles['os-91'].desktop.homeMode).toBe('icons');
  });

  it('now-os desktop can be max window mode', () => {
    expect(layoutProfiles['now-os'].desktop.windowMode).toBeDefined();
  });
});