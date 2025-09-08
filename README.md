# website-os

A living, retro-futurist portfolio OS that evolves through three **eras**:
1) **Terminal-OS** — CRT/monospace terminal (minimal desktop, big terminal window)  
2) **OS-91** — Krazam/Win95-style desktop (icon grid + taskbar)  
3) **Now-OS** — modern desktop (ProzillaOS / OS.js / Dustin Brett vibes)

**Same content/apps across eras; only the shell/UX changes.**  
A public **countdown** flips the active era with a **reboot animation**.

## Quick Start
```bash
pnpm i      # or: npm i
pnpm dev    # or: npm run dev
Run locally: Vite dev server runs on `http://localhost:5173` by default. Use `npm run preview` for a production preview.

Docs
	•	PRD (spec): docs/dev/PRD.md
	•	Developer docs: docs/dev/*
	•	Easy-Docs (plain English): docs/easy/*
	•	Daily/Sprint log: docs/log/*
	•	Decisions / ADRs: docs/decisions/*
	•	Bug tracker: BUGS.md

⸻

Tech Stack
	•	React 18 • Vite 5 • TypeScript
	•	Tailwind + CSS variables (tokens)
	•	Colyseus (multiplayer, planned)
	•	Supabase (auth/realtime/storage, planned)

⸻

Project Rules (Cursor)

See .cursorrules for detailed contribution rules.

Every change must update:
	•	README
	•	CHANGELOG
	•	docs/dev/* (technical docs + PRD/ADRs)
	•	docs/easy/* (plain English)
	•	docs/log/YYYY-MM-DD.md (daily log)
	•	BUGS.md if relevant

Note: Create a `.env` or `.env.local` in the project root and set `VITE_ERA_SCHEDULE_URL` (e.g., `/era-schedule.json`) before running the app in production.
Optional: set `VITE_FORCE_ERA` to `terminal-os`, `os-91`, or `now-os` during local dev to override the schedule.

### Sprint 1 Status
- **Era layout profiles** implemented (`src/themes/layoutProfiles.ts`):  
  - Desktop: Terminal (monospace terminal), OS-91 (icons + taskbar), Now-OS (dock + search).  
  - Mobile: Terminal (list), OS-91/Now-OS (grid; Now-OS adds dock + search).  

- **Windowing (desktop)** MVP (`src/shell/windowing/WindowManager.tsx`):  
  - Open, move (drag + arrows), minimize/restore, focus/z-order, and a simple taskbar.  

- **Mobile app container** (`src/shell/mobile/AppContainerPage.tsx`):  
  - Apps open full-page; Home switches list/grid per era.  
  - Now-OS mobile supports swipe-to-dismiss with scrim (via Framer Motion).  
  
  Desktop Terminal-OS shows a small Home panel with a header (inline countdown) and quick launch buttons for Terminal.EXE and Dimension.EXE.

- **App registry** wired; stubs exist for About, Projects, Gallery, Settings, Connect, Arcade, Dimension.  

- **Era management** (`src/shell/era/EraContext.tsx`):  
  - Loads schedule from `VITE_ERA_SCHEDULE_URL` (fallback to `public/era-schedule.json`).  
  - Polls every 60s; ticks countdown every 1s.  
  - Applies body theme class (`theme-terminal`, `theme-os91`, `theme-now`).  
  - Supports `VITE_FORCE_ERA` override (locks era, suppresses overlay).  

- **Countdown badge** (`src/components/CountdownBadge.tsx`):  
  - Shows next era + time left; refreshable.  
  - New: supports `variant="inline"` for embedding inside headers (used in HomeDashboard header card on Terminal-OS). The inline header shows a small countdown and quick-launch cards (Terminal.EXE, Dimension.EXE) on Desktop Terminal-OS. On Desktop Terminal-OS, icons are hidden by design; use the Home panel, Launcher, or Terminal.EXE to open apps. On Mobile, the Home lists all apps.

- **Reboot overlay** (`src/shell/RebootOverlay.tsx`):  
  - Brief fade + message on flip; suppressed when `VITE_FORCE_ERA` is set.  
  - Respects `prefers-reduced-motion`.  

## Era Schedule, Countdown & Reboot
- The app loads an era schedule from `VITE_ERA_SCHEDULE_URL` (falls back to `public/era-schedule.json`).
- `EraProvider` (`src/shell/era/EraContext.tsx`) exposes:
  - `eraId` (`terminal-os` | `os-91` | `now-os`)
  - `schedule`, `nextFlipMs`
  - dev override awareness (`VITE_FORCE_ERA`)
- A persistent **Countdown Badge** (`src/components/CountdownBadge.tsx`) shows the next era and remaining time (dd:hh:mm:ss). Click to refresh the schedule.
- When the countdown hits zero (and **no** `VITE_FORCE_ERA`), a brief **Reboot Overlay** plays and the UI flips era **without reload**.
- The `<body>` element gets a theme class:
  - `theme-terminal` | `theme-os91` | `theme-now`
- Components consume colors/spacing via CSS variables (see `src/styles/index.css`). No raw hex in components.
- Accessibility: respects `prefers-reduced-motion` (overlay animates instantly).

## Content

- Content JSON lives under `content/` at the project root (`projects.json`, `media.json`, `lore.json`).
- Loaders are implemented in `src/services/content/loaders.ts` and typed in `src/services/content/types.ts`.
- Adding/changing content requires editing those JSON files; a production CMS (e.g., Supabase) can be integrated later to replace these loaders.

## Terminal.EXE (toy shell)

- Open Terminal.EXE and type `help`, `apps`, or `open about` to launch apps.
- Useful commands: `help`, `apps`, `open <appId>`, `clear`, `echo <text>`, `time`, `era`, `theme <terminal-os|os-91|now-os>` (preview allowed when not forced).

## Recents & File Browser
- **Recents.EXE** (`src/apps/recents`): tracks recently opened apps and files, persists to localStorage, and surfaces a quick list. Uses `src/services/recents.ts`.
- **File Browser.EXE** (`src/apps/filebrowser`): minimal file browser with breadcrumbs and deep-link support. Uses `src/services/fileSystem.ts` as a stubbed virtual FS.
- Both apps are registered in the app registry (`src/shell/appRegistry.ts`) and can be opened from the launcher or taskbar.

File Manager (FileMan.EXE)
- `FileMan.EXE` is a small file manager MVP that reads a seeded in-memory VFS at `public/content/vfs.json`. It supports icon and list views, breadcrumb navigation, keyboard access, and a tiny preview for files without external links.
- Defaults follow era: Terminal-OS/OS-91 default to icons view; Now-OS defaults to list view.
- Developer: Settings now includes a **Clear VFS Cache** action (dev-only) to reload the seeded VFS during development.

## Settings & Themes
- **Settings.EXE** (`src/apps/settings`): preview and control era (dev override), choose theme (light/dark/auto), pick wallpapers, and toggle accessibility options (reduced motion, high contrast). Preferences persist to localStorage and apply via body classes (`.reduced-motion`, `.high-contrast`, `wallpaper-*`).
- Theme tokens are split into `src/themes/tokens.css` (base tokens) and `src/themes/eraThemes.css` (era overrides). The active era class (`theme-terminal|theme-os91|theme-now`) is applied to `<body>` by `EraProvider`.

### Dev override (local)
Create `.env.local` at project root:

### Dev override (local)
Create `.env.local` at project root: VITE_FORCE_ERA=now-os
- Locks the UI to the specified era.
- Countdown badge shows **“Dev: now-os (override)”**.
- Reboot overlay is **suppressed** while forced.

### Era binding
- `EraProvider` applies the current era’s theme class on `<body>`.
- A small **DevEraBadge** (`src/shell/DevEraBadge.tsx`) shows the active era in dev mode.

## Settings

- Respect Reduced Motion: when enabled (default), animations follow your OS setting. Disable to allow animations even if your OS prefers reduced motion (dev convenience).
- Theme Preview: temporarily preview Terminal-OS / OS-91 / Now-OS visuals. When `VITE_FORCE_ERA` is set, the preview is disabled. Use “Reset to schedule” to return to the active schedule.
- Clear Content Cache: clears in-memory caches for `content/*.json` so About/Projects/Gallery reload fresh data on next open.

## Testing

Run the test suite with:

```bash
npm run test
```
