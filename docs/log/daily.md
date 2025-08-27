## 2025-08-27
- Added stubs for all apps: about, projects, gallery, settings, connect, arcade, dimension, terminal.
- Implemented `src/shell/appRegistry.ts` to centralize app metadata and components.
- Wired registry into desktop launcher/taskbar and mobile home; verified dev server runs with no missing import errors.
- Added EraProvider (`src/shell/era/EraContext.tsx`) and DevEraBadge; bound `body[data-era]` and theme classes.
 - Added docs: README “Era binding”, easy docs “Era” section; CHANGELOG updated.

## 2025-08-27
- Refactored app structure to separate `appMeta` into `meta.ts` files per app.  
- Updated `appRegistry` imports to use `meta.ts`, resolving HMR warnings.  
- Verified apps load correctly with dedicated `meta` exports.  
- Added Cursor rules note to enforce consistent `AppMeta` contract.  

## 2025-08-27

### Completed
- Implemented **swipe-to-dismiss** interaction for mobile windows  
- Integrated scrim opacity tied to drag progress for visual feedback  
- Updated `WindowManager` to handle shared dismissal flow across mobile + desktop  
- Adjusted `Launcher` and `LayoutProfiles` for new opacity variable  
- Updated global styles (`index.css`) for opacity transition  
- Started dev server to verify Framer Motion integration:
  - `VITE v5.4.19  ready in 298 ms`
  - Local: `http://localhost:5173/`

### Notes
- Framer Motion can be extended later for smoother physics-based dismissal  
- Current implementation keeps parity with Safari-like tab swipe UX  
 
## 2025-08-27 (evening)
- Chunk 6: Added Recents + File Browser (localStorage-backed recents; stub FS). Try: open apps/files, then open Recents.EXE to see history.
- Chunk 7: Added Settings.EXE (theme, wallpaper, accessibility prefs). Preferences persist and apply to body classes; wallpaper options available.
- Fixed CSS token split: `tokens.css` + `eraThemes.css`; ensure `@import` ordering in `src/styles/index.css` if you move imports.
