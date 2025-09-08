/**
 * SUMMARY
 * Settings app: Appearance, Wallpaper, Accessibility, Experiments. Persists to
 * localStorage via EraContext.updatePrefs and applies body classes/vars.
 */
import React from 'react';
import { useEra } from '../../shell/era/EraContext';
import { type Era as EraId } from '../../themes/layoutProfiles';
import { clearContentCache } from '../../services/content/loaders';
import { clearVfsCache } from '../../services/vfs/memoryVfs';
import { useToast } from '../../shell/ToastContext';

export default function SettingsApp(): JSX.Element {
  const { eraId, isForced, setEraForDev, resetEraPreview, userPrefs, updatePrefs } = useEra();
  const { addToast } = useToast();

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
          <div className="text-xs font-medium">Theme Preview (dev-only)</div>
          <div className="flex items-center gap-2 mt-1">
            <select
              className="px-2 py-2 rounded bg-foreground/10"
              value={eraId}
              onChange={(e) => setEraForDev?.(e.target.value as EraId)}
              disabled={isForced}
              aria-label="Theme preview era"
            >
              <option value="terminal-os">terminal-os</option>
              <option value="os-91">os-91</option>
              <option value="now-os">now-os</option>
            </select>
            {isForced ? <span className="text-xs opacity-60">Preview disabled (VITE_FORCE_ERA active)</span> : (
              <button className="px-2 py-2 rounded bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]" onClick={() => resetEraPreview?.()} aria-label="Reset era preview">Reset to schedule</button>
            )}
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
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={userPrefs.respectReducedMotion !== false} onChange={(e) => updatePrefs({ respectReducedMotion: e.target.checked })} aria-label="Respect Reduced Motion" />
            Respect Reduced Motion
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

      <section>
        <h2 className="text-sm font-semibold">Developer</h2>
        <div className="mt-2 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={userPrefs.showArcadeFps === true} onChange={(e) => updatePrefs({ showArcadeFps: e.target.checked })} />
            Show FPS/UPS in Arcade
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={userPrefs.terminalScanlines === true} onChange={(e) => updatePrefs({ terminalScanlines: e.target.checked })} />
            Terminal scanlines
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Mobile Controls</h2>
        <div className="mt-2 flex items-center gap-3">
          <label className="text-sm">Show mobile controls</label>
          <select className="px-2 py-1 rounded bg-foreground/10" value={userPrefs.showMobileControls ?? 'auto'} onChange={(e) => updatePrefs({ showMobileControls: e.target.value as any })} aria-label="Show mobile controls">
            <option value="auto">Auto (pointer coarse)</option>
            <option value="on">Always show</option>
            <option value="off">Always hide</option>
          </select>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Content</h2>
        <div className="mt-2 flex items-center gap-3">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="px-3 py-2 rounded bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              onClick={() => {
                clearContentCache();
                addToast('Content cache cleared');
              }}
            >
              Clear Content Cache
            </button>
            <button
              className="px-3 py-2 rounded bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]"
              onClick={() => {
                if (import.meta.env.DEV) console.log('[Settings] clear VFS cache');
                clearVfsCache();
                addToast('VFS cache cleared');
              }}
            >
              Clear VFS Cache
            </button>
          </div>
          <span className="text-xs opacity-60">Clears in-memory JSON caches for this session.</span>
        </div>
      </section>
    </div>
  );
}


