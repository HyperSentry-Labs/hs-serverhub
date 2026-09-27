# Changelog

All notable changes to this project are documented in this file.

## [0.1.0] - 2026-09-27

Initial development release.

### Added

- Standalone FiveM resource (`fxmanifest.lua`, `client.lua`, `server.lua`)
  with no framework dependency (ESX/QBCore/Qbox/ox_core/vRP-free).
- React + TypeScript + Vite NUI with a dual bridge architecture
  (`web/src/bridge/fivem.ts` and `web/src/bridge/mock.ts`) so the entire UI
  runs and can be developed in a plain browser tab.
- Overview page: hero, live player count/status, monitored-resource health
  snapshot, quick-access tiles, latest announcement, community preview.
- Rules page: categories, severity badges, search.
- Commands page: categories, aliases, permission labels, search.
- Keybinds page: categories, key chips, search.
- Getting Started page: numbered onboarding timeline with optional internal
  or external links.
- News/Changelog page: category filter, search, newest-first sorting.
- Community page: configurable external links.
- Cross-section header search covering rules, commands, keybinds, getting
  started, and news, grouped by section.
- Live server status via `lua/validate.lua`-normalized config, pushed only
  to players with ServerHub open and only when the snapshot changes.
- Developer API: `RegisterCommandInfo`, `RegisterKeybind`, `AddAnnouncement`,
  `SetStat`, `RemoveEntry` exports, backed by `lua/registry.lua` with
  duplicate protection against both static config and other registrations.
- Config validation that never crashes the resource: malformed entries are
  skipped with a console warning (`Config.General.Debug`).
- Configurable keybind (default `F10`, rebindable via FiveM's key-mapping
  UI) and chat command (default `/serverhub`), plus Escape and an explicit
  close button, with a native-level input safety net so the UI can never
  soft-lock a player's controls.
- Internationalization architecture with English (default) and Persian
  locales, and RTL support.
- Rebrandable identity: server name, subtitle, description, logo (with an
  automatic monogram fallback when missing), accent colors, and all
  community/support links are configuration-driven.
- Test suites: 18 Lua tests for `lua/validate.lua`, 15 Lua tests for
  `lua/registry.lua` (runnable standalone with a plain `lua` interpreter,
  no FiveM runtime required), and 14 Vitest tests for search, content
  normalization, and the mock bridge's message sequence.
- GitHub Actions CI: frontend typecheck/lint/test/build, plus Lua syntax
  checks and the standalone Lua test suite.
- Documentation: `README.md`, `docs/configuration.md`, `docs/api.md`,
  `docs/development.md`, `docs/localization.md`, `SECURITY.md`,
  `CONTRIBUTING.md`.

### Known limitations (tracked for a future release)

- No `RegisterPage` export - see `docs/api.md` for the reasoning.
- No fixed font is bundled; ServerHub uses the player's OS UI font unless a
  server owner self-hosts fonts (see `docs/configuration.md#fonts`).
- Content items (rules, commands, etc.) are not individually
  multi-language - see `docs/localization.md`.
