# ADR-001: Terminal.EXE Navigation Role

## Status
Proposed — Sprint 1 (2025-08-27)

## Context
The portfolio evolves across three eras (Terminal-OS → OS-91 → Now-OS).  
In Terminal-OS, Terminal.EXE is the most era-defining app.  
Key question: should it be a **toy shell** (fun extra) or the **primary navigation hub**?

## Options
### Option A — Toy Shell (Easter Egg)
- Users launch Terminal.EXE like any other app.
- Supports commands (help, open about, toggles).
- Apps also launch via icons/launcher.
- **Pros:** low dev effort, less risk, fun retro flavor.
- **Cons:** feels secondary; weaker identity.

### Option B — Primary Shell (Navigation Hub)
- In Terminal-OS, *all navigation* runs through the terminal.
- Desktop icons disabled (homeMode=none).
- Users must type open about, arcade, etc.
- **Pros:** immersive retro experience, strong identity, clear UX progression across eras.
- **Cons:** higher dev cost, stricter testing, potential frustration for casual users.

## Decision
Adopt **Option A (Toy Shell)** initially.  
- Structure command parser to pull from AppRegistry.  
- Keep ability to promote to **Primary Shell** by Sprint 3 if desired.

## Consequences
- Users will have both the terminal and desktop/launcher as ways to open apps in Sprint 1–2.
- By Sprint 3, team must confirm whether to lock navigation fully into terminal mode.
- This preserves flexibility while avoiding early overcommit.