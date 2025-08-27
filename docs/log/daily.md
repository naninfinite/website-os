## 2025-08-27
- Added stubs for all apps: about, projects, gallery, settings, connect, arcade, dimension, terminal.
- Implemented `src/shell/appRegistry.ts` to centralize app metadata and components.
- Wired registry into desktop launcher/taskbar and mobile home; verified dev server runs with no missing import errors.
- Added EraProvider (`src/shell/era/EraContext.tsx`) and DevEraBadge; bound `body[data-era]` and theme classes.
 - Added docs: README “Era binding”, easy docs “Era” section; CHANGELOG updated.

