SUMMARY: Contribution guidelines and repo hygiene following .cursorrules/PRD

Thank you for contributing to this project. Please follow these guidelines:

- **Follow the project's PRD and .cursorrules**: Changes should respect the architecture, folder layout, and documentation rules described in `docs/dev/PRD.md` and the root `.cursorrules` file.
- **Branching**: Use feature branches named `feat/<short-description>` or `fix/<BUG-ID>-<short>`.
- **Commits**: Use concise, imperative commit messages. Reference BUG IDs where relevant (e.g., `fix(BUG-012): ...`).
- **Docs/logs**: For any code changes, update or add entries to `docs/log/YYYY-MM-DD.md` describing the change and files touched.
- **ChangeLog**: Add an entry to `CHANGELOG.md` under the `[Unreleased]` section for notable changes.
- **PRs**: Open a PR describing the change, linking related issues/BUG IDs, and include screenshots or notes for UX changes.
- **Testing**: Add tests for non-trivial logic where applicable.

If you're unsure about a change, open an issue first to discuss.


