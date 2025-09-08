/**
 * SUMMARY
 * Desktop shell container that hosts WindowManager, Launcher, and Taskbar. The
 * launcher is toggleable and lists apps from the registry.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { layoutProfiles, type Era as EraId } from '../themes/layoutProfiles';
import { useEra } from './era/EraContext';
import { WindowManager } from './windowing/WindowManager';
import { useWindowing } from './windowing/context';
import { Launcher } from './Launcher';
import { Taskbar } from './Taskbar';
import { getAllApps } from './appRegistry';
import { HomeDashboard, type HomeCardSpec } from './home/HomeDashboard';
import { CountdownBadge } from '../components/CountdownBadge';

const DEBUG_HOME = true; // set false to silence

export function Desktop(props: { era: EraId }): JSX.Element {
  const { eraId } = useEra();
  const profile = useMemo(() => layoutProfiles[eraId as EraId], [eraId]);
  const [launcherOpen, setLauncherOpen] = useState<boolean>(false);
  // Hotkey: Ctrl/Cmd + Space toggles launcher
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setLauncherOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  if (import.meta.env.DEV) console.log('[Desktop] render: home-underlay + window-layer');
  return (
    <div className="desktop-root">
      {/* Home layer (underlay) */}
      <div className="desktop-home-underlay">
        {profile.desktop.homeMode === 'none' ? <DesktopHomePanel /> : null}
      </div>

      {/* Window layer (overlay) */}
      <div className="desktop-window-layer">
        <WindowManager>
          {/* Desktop icons (rendered only for eras with icons enabled) */}
          {profile.desktop.homeMode === 'icons' ? <DesktopIcons /> : null}
          <Launcher open={launcherOpen} onClose={() => setLauncherOpen(false)} />
          <Taskbar onToggleLauncher={() => setLauncherOpen((v) => !v)} />
        </WindowManager>
      </div>
    </div>
  );
}

function DesktopIcons(): JSX.Element {
  const apps = getAllApps();
  const { openApp } = useWindowing();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const el = itemRefs.current[selectedIndex];
    if (el) el.focus();
  }, [selectedIndex]);

  const onKey = (e: React.KeyboardEvent) => {
    if (apps.length === 0) return;
    const len = apps.length;
    const cols = 4; // grid navigation fallback
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setSelectedIndex((i) => (i === null ? 0 : (i + 1) % len));
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedIndex((i) => (i === null ? 0 : (i - 1 + len) % len));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((i) => (i === null ? 0 : (i + cols) % len));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((i) => (i === null ? 0 : (i - cols + len) % len));
        break;
      case 'Home':
        e.preventDefault();
        setSelectedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setSelectedIndex(len - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex !== null && apps[selectedIndex]) {openApp(apps[selectedIndex].id);}
        break;
      case 'Escape':
        e.preventDefault();
        setSelectedIndex(null);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      role="list"
      aria-label="Desktop icons"
      tabIndex={0}
      onKeyDown={onKey}
      className="desktop-icons p-6"
    >
      {apps.map((a, idx) => (
        <div role="listitem" key={a.id} className="inline-block m-2">
          <button
            ref={(el) => (itemRefs.current[idx] = el)}
            className={`desktop-icon flex flex-col items-center justify-center w-20 h-20 rounded-token focus:outline-none`}
            onClick={() => setSelectedIndex(idx)}
            onDoubleClick={() => openApp(a.id)}
            aria-label={a.title}
            title={a.title}
          >
            <div className="text-2xl mb-1">{a.icon ?? '◻'}</div>
            <div className="text-xs text-center truncate w-full">{a.title}</div>
          </button>
        </div>
      ))}
    </div>
  );
}

function DesktopHomePanel(): JSX.Element {
  const { openApp } = useWindowing();
  const cards: HomeCardSpec[] = [
    {
      id: 'icon',
      component: (
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">Welcome</div>
          <CountdownBadge variant="inline" />
        </div>
      ),
      featured: true,
    },
    {
      id: 'terminal',
      component: (
        <button
          className="btn"
          onClick={() => {
            if (DEBUG_HOME) console.log("[HomeDashboard] Terminal card clicked")
            openApp('terminal')
          }}
          aria-label="Open Terminal.EXE"
        >
          Open Terminal.EXE
        </button>
      ),
    },
    {
      id: 'dimension',
      component: (
        <button
          className="btn"
          onClick={() => {
            if (DEBUG_HOME) console.log("[HomeDashboard] Dimension card clicked")
            openApp('dimension')
          }}
          aria-label="Open Dimension.EXE"
        >
          Open Dimension.EXE
        </button>
      ),
    },
  ];
  return (
    <div className="p-4">
      <HomeDashboard
        cards={cards}
        customize={false}
        onReorder={() => {}}
      />
    </div>
  );
}


