/**
 * SUMMARY
 * Settings app: Appearance, Wallpaper, Accessibility, Experiments. Persists to
 * localStorage via EraContext.updatePrefs and applies body classes/vars.
 */
import React from 'react';
import { useEra } from '../../shell/era/EraContext';
import { layoutProfiles, type Era as EraId } from '../../themes/layoutProfiles';

export default function SettingsApp(): JSX.Element {
  const { eraId, isForced, setEraForDev, userPrefs, updatePrefs } = useEra();

  return (
    <div className="p-4 settings-grid">
      <section>
        <h2 className="text-sm font-semibold">Appearance</h2>
        <div className="mt-2 flex items-center gap-2">
          <label className="text-xs opacity-70">Theme</label>
          <select
            className="px-2 py-1 rounded bg-foreground/10"
            value={userPrefs.theme}
            onChange={(e) => updatePrefs({ theme: e.target.value as any })}
            aria-label="Theme"
          >
            <option value="auto">Auto (system)</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="mt-3">
          <div className="text-xs opacity-70">Era (dev-only)</div>
          <div className="flex items-center gap-2 mt-1">
            <select
              className="px-2 py-1 rounded bg-foreground/10"
              value={eraId}
              onChange={(e) => setEraForDev?.(e.target.value as EraId)}
              disabled={!isForced}
              aria-label="Era"
            >
              <option value="terminal-os">terminal-os</option>
              <option value="os-91">os-91</option>
              <option value="now-os">now-os</option>
            </select>
            {!isForced ? <span className="text-xs opacity-60">Set VITE_FORCE_ERA to enable</span> : null}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Wallpaper</h2>
        <div className="mt-2 flex items-center gap-2">
          <button className="px-2 py-1 rounded bg-foreground/10" onClick={() => updatePrefs({ wallpaper: 'crt' })}>CRT scanlines</button>
          <button className="px-2 py-1 rounded bg-foreground/10" onClick={() => updatePrefs({ wallpaper: 'os91' })}>OS-91 teal</button>
          <button className="px-2 py-1 rounded bg-foreground/10" onClick={() => updatePrefs({ wallpaper: 'now' })}>Now gradient</button>
          <button className="px-2 py-1 rounded bg-foreground/10" onClick={() => updatePrefs({ wallpaper: null })}>None</button>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Accessibility</h2>
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={userPrefs.reducedMotion} onChange={(e) => updatePrefs({ reducedMotion: e.target.checked })} />
            Reduce motion
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={userPrefs.highContrast} onChange={(e) => updatePrefs({ highContrast: e.target.checked })} />
            High contrast
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Experiments</h2>
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={userPrefs.gestureDismiss}
              onChange={(e) => updatePrefs({ gestureDismiss: e.target.checked })}
            />
            Swipe to dismiss (mobile)
          </label>
          <span className="text-xs opacity-60">Only effective if profile allows (e.g., Now-OS).</span>
        </div>
      </section>
    </div>
  );
}


