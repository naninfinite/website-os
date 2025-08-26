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

### Sprint 1 Status
- Era layout profiles implemented (`src/shell/layoutProfiles.ts`)
- Countdown reads schedule from `VITE_ERA_SCHEDULE_URL` and exposes `onEraFlip` via `useCountdown`
- Desktop WindowManager (MVP) now supports open, move (drag + arrows), minimize/restore, focus/z-order, and a simple taskbar. See `src/shell/windowing/WindowManager.tsx`.
- Mobile: apps open full-page via `src/shell/mobile/AppContainerPage.tsx`; Home renders list/grid per era in `src/shell/mobile/Home.tsx`.
- AppRegistry opens stubs for all apps; Mobile Home switches list/grid per era

## Countdown, Schedule, and Reboot
- The app loads an era schedule from `VITE_ERA_SCHEDULE_URL` (see `public/era-schedule.json`).
- A visible countdown shows time remaining in the current era (dd:hh:mm:ss).
- When it reaches zero, a Reboot overlay appears for ~3 seconds, then the era flips and theme tokens update via `body[data-era]`.
- Components consume tokens from CSS variables (see `src/themes/tokens.css` and `src/themes/eraThemes.css`).

## Testing

Run the test suite with:

```bash
npm run test
```
