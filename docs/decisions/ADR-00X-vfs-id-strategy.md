# ADR-00X: VFS ID Strategy and Atomic Persistence

## Status
Accepted — PR-4 (2025-09-14)

## Context
The Virtual File System (VFS) must provide stable identifiers for seeded content and generate collision-resistant IDs for user-created nodes, while ensuring persistence is atomic (commit-or-rollback) to avoid corrupted snapshots. Additionally, resetting should reliably seed from `/public/content/vfs.json` with validation and a safe fallback.

## Decision
- Preserve any IDs present in seed JSON.
- For seed nodes missing an `id`, derive a deterministic ID via UUID v5 of a canonical path under a fixed namespace.
- For user-created nodes, generate monotonic ULIDs and include a short device nonce to reduce cross-tab collisions.
- Perform mutations on an in-memory snapshot; only write to storage once the mutation is complete. If storage fails, roll back to the previous snapshot.
- `reset()` clears both the persisted snapshot and in-memory cache; the next load re-hydrates from seeds.

## Details
- Deterministic IDs: `seedIdForPath(canonicalPath)` implements UUID v5 using SHA-1 over `namespace || name`, setting version/variant bits as per RFC 4122.
- ULIDs: `ulid()` returns 26-char Crockford Base32 IDs with a 48-bit time prefix and 80-bit randomness; a 2-byte device nonce and a persisted counter ensure monotonicity and reduce collisions.
- Atomic persistence: `persistAtomic(next, prevRaw)` writes the next snapshot and restores the prior snapshot when an error occurs.
- Hydration: `assignStableIdsFromSeed(root)` walks the tree, preserving existing `id`s and deriving missing ones based on canonical path segments.

## Consequences
- Seeded content remains stable across sessions; renames of nodes do not change IDs.
- User-created nodes are monotonic and low-collision; ordering operations can rely on ID lexicographic order within the same millisecond.
- Storage errors will not leave partial writes; the system restores the last consistent snapshot.

## Alternatives Considered
- Random UUID v4 for all nodes: non-deterministic for seeds; harder to assert in tests.
- Pure incremental counters: easier but increases collision risk across tabs/sessions and leaks sequence information globally.

## References
- `src/services/vfs/id.ts` — ID utilities (uuid v5 + ulid)
- `src/services/vfs/localVfs.ts` — atomic persistence and hydration
- `src/services/vfs/__tests__/*` — coverage for determinism and atomicity
