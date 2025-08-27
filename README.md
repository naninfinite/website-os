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
- Era layout profiles implemented (`src/shell/layoutProfiles.ts`)
- Countdown reads schedule from `VITE_ERA_SCHEDULE_URL` and exposes `onEraFlip` via `useCountdown`
- Desktop WindowManager (MVP) now supports open, move (drag + arrows), minimize/restore, focus/z-order, and a simple taskbar. See `src/shell/windowing/WindowManager.tsx`.
- Mobile: apps open full-page via `src/shell/mobile/AppContainerPage.tsx`; Home renders list/grid per era in `src/shell/mobile/Home.tsx`.
- AppRegistry opens stubs for all apps; Mobile Home switches list/grid per era

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

## Testing

Run the test suite with:

```bash
npm run test
```
