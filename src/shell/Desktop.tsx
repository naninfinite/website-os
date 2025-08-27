/**
 * SUMMARY
 * Desktop shell container that hosts WindowManager, Launcher, and Taskbar. The
 * launcher is toggleable and lists apps from the registry.
 */
import React, { useMemo, useState } from 'react';
import { layoutProfiles, type Era as EraId } from '../themes/layoutProfiles';
import { useEra } from './era/EraContext';
import { WindowManager } from './windowing/WindowManager';
import { Launcher } from './Launcher';
import { Taskbar } from './Taskbar';

export function Desktop(props: { era: EraId }): JSX.Element {
  const { eraId } = useEra();
  const profile = useMemo(() => layoutProfiles[eraId as EraId], [eraId]);
  const [launcherOpen, setLauncherOpen] = useState<boolean>(false);
  return (
    <div className="min-h-dvh" style={{ backgroundColor: 'rgb(var(--surface))', color: 'rgb(var(--text))' }}>
      <WindowManager>
        <Launcher open={launcherOpen} onClose={() => setLauncherOpen(false)} />
        <Taskbar onToggleLauncher={() => setLauncherOpen((v) => !v)} />
      </WindowManager>
    </div>
  );
}


