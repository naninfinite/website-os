# Easy Log

- [2025-08-27] Scaffold 4 complete. All core apps registered in `appRegistry`. Era override (`VITE_FORCE_ERA`) added. Imports fixed. Now-OS showing in UI.
- [2025-08-27] Chunk 3: WindowManager MVP added (open/move/minimize/restore + taskbar). Mobile AppContainerPage and MobileHome wired.
- [2025-08-27] Chunk 4: AppRegistry + Launcher/Taskbar, split `appMeta` into `meta.ts` files, added app stubs.
- [2025-08-27] Chunk 5: EraProvider + CountdownBadge + RebootOverlay (schedule-driven era flips).
- [2025-08-27] Chunk 6: Recents.EXE + FileBrowser.EXE (localStorage recents + stub FS).
- [2025-08-27] Chunk 7: Settings.EXE + tokens split into `tokens.css` and `eraThemes.css`; Settings controls theme, wallpaper, and accessibility prefs.

What to try (quick):
- Start dev: `npm run dev` → open `http://localhost:5173`
- Use the launcher/taskbar to open apps. Open Settings to toggle theme and wallpaper. On Now-OS mobile, swipe down to dismiss apps.
