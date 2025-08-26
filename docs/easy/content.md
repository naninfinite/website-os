# How content works (plain English)

This site keeps all portfolio data in the `/content` folder so the UI isn’t hard-coded.

## Files
- `content/projects.json` — list of projects (title, summary, tags, links).
- `content/media.json` — maps media IDs to image/video files in `/public/media`.
- `content/lore.json` — short strings like boot messages and tips.

## Naming (IDs)
To avoid collisions:
- Projects: `p-...` (e.g., `p-terminal-os`)
- Images: `img-...` (e.g., `img-terminal-shot-1`)
- Lore keys: `section.key` (e.g., `boot.motd`)

## Add a new project
1. Add a project object to `content/projects.json`.
2. Put any images in `/public/media/` and register them in `content/media.json`.
3. Commit & push. The UI will read these files at startup.

> Later we can move content to a database (Supabase). The JSON stays the source of truth until then.