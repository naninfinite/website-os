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

## Testing

Run the test suite with:

```bash
npm run test
```
