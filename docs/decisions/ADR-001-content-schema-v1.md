# ADR-001: Content schema v1
Date: 2025-08-27
Status: accepted

## Context
Portfolio apps (About, Projects, Gallery, Dimension) require structured content.  
We want to avoid hardcoding strings in code and allow future migration to a DB.

## Decision
Create a top-level `content/` folder containing JSON files:

- `projects.json` → structured data for portfolio projects.
- `media.json` → registry mapping ids to images/videos.
- `lore.json` → small messages, MOTD strings, tips.

IDs use prefixes to avoid collisions:
- Projects: `p-…`
- Media: `img-…`, `vid-…`
- Lore: `section.key`

JSON is flat and versioned (`"version": 1`) for migration safety.

## Consequences
+ Keeps apps and content decoupled.
+ Cursor can scaffold UI without guessing text.
+ Easy to migrate to Supabase later via an adapter.
- Requires manual maintenance until DB integration.
- Prefix convention adds a little verbosity.

## Related
- PRD sections: “Folder Layout (high-level)”, “Information Architecture (Apps)”.
- Future ADR: Supabase integration for content storage.