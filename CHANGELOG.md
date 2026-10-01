# Changelog

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-09-29

UX, API & Customization update. Builds on the `0.1.0` foundation -
existing config, existing valid API calls, and existing test coverage all
continue to work unmodified; see "Compatibility" below.

### Added

- **Search v2**: results now include Community links; matching is
  punctuation/case/whitespace-insensitive and matches command aliases,
  keybind resource/context, and multi-term queries in any order; full
  keyboard navigation (`Ctrl+K` or `/` to focus, Arrow keys, `Enter`,
  `Escape`) via an ARIA combobox; clicking or selecting a result navigates
  to it and briefly highlights the matched row.
- **Pinned / favorites**: any rule, command, keybind, or getting-started
  step can be pinned for one-tap access from a new Overview "Pinned"
  section. Local-only (browser/NUI storage), resettable, never sent to the
  server.
- **Getting Started progress**: optional per-step completion tracking
  (`Config.GettingStarted.EnableProgress`, default on) with a progress bar,
  a "recommended next step" badge, and optional per-step time estimates
  (`estimatedMinutes`). Local-only, like pinning - never presented as
  something the server can observe.
- **Richer announcements**: `Config.News.Items` gained optional `priority`
  (`normal`/`important`/`critical`) and `featured` fields. A featured item
  can win the Overview "latest announcement" slot over a newer, unfeatured
  one. Shown as a small, non-alarmist label - not a banner.
- **Quick actions**: `Config.Overview.QuickLinks` entries can now be
  `type = 'url'` to open an external link (Discord, website, ticket
  system) directly from Overview, alongside the existing `type = 'section'`
  shape.
- **Grouped community links**: optional `Config.Community.Groups` for
  servers that want sectioned links (Community / Support / Store); the
  existing flat `Config.Community.Links` continues to work unchanged as
  the fallback when no groups are configured.
- **Optional theme tokens**: `Config.Theme` (`AccentHover`, `Background`,
  `Surface`, `SurfaceRaised`, `Border`, `Text`, `Muted`) for rebranding
  beyond the two accent colors, without touching CSS.
- Commands gained an optional `usage` field (shown as a code example);
  Keybinds gained optional `resource`/`context` fields, with a
  dynamically-registered keybind defaulting `resource` to the registering
  resource's name automatically.
- Rules now collapse long descriptions behind a "Show details" toggle and
  display each rule's `id` as a small reference chip.

### Developer API

- New `UpdateCommandInfo`, `UpdateKeybind`, `UpdateAnnouncement`, and
  `UpdateStat` exports, so a resource can edit content it already
  registered instead of only being able to remove and re-add it.
- **Ownership**: every dynamic registration is now tied to the resource
  that created it (via `GetInvokingResource()`). `Update*` and
  `RemoveEntry` only succeed against your own resource's entries - another
  resource's registration can no longer be edited or removed by guessing
  its `id`. See `docs/api.md`.

### Improved

- **Visual/UX pass**: refined spacing, typography, and hierarchy across
  every page; consistent status indicators (`StatusPill`) that always pair
  an icon with a text label, never color alone; reusable `Badge`/
  `CategoryFilter`/`EmptyState`/`PageHeader` components used consistently
  instead of one-off styling per page.
- **Config validation gap closed**: `Config.Overview.QuickLinks` and
  `Config.Rules/Commands/Keybinds.Categories` were passed to the NUI
  completely unvalidated in `0.1.0` - a malformed entry could reach the
  page and render as a dead button. Both are now validated the same way
  every other section is (skip and warn, never crash).
- **URL safety, everywhere a link reaches the UI**: community links, news
  "read more" links, getting-started external steps, and quick actions are
  now validated as `http`/`https` in both `lua/validate.lua` and
  `web/src/lib/url.ts` (defense in depth) - a `javascript:`/`data:`/
  schemeless value is refused rather than rendered as a live link.
- **Live resource status**: `Config.Status.MonitoredResources` now reports
  one of `started`/`starting`/`stopped`/`unknown` (previously a boolean
  running/not-running), so a resource that is mid-restart is represented
  honestly instead of momentarily looking "down".
- Browser demo data replaced with a clearly-fictional server ("Northgate
  Roleplay") and expanded into six selectable fixtures
  (`?fixture=empty|minimal|long|many|rtl`) for exercising every UI state
  during development - see `docs/development.md`.

### Documentation

- `docs/development.md` and `README.md` now give Windows PowerShell
  commands explicitly, alongside the bash examples, and document how to
  stop the dev server.
- `docs/api.md` documents the ownership model and every `Update*` export.
- `docs/configuration.md` documents `Config.Theme`, the `QuickLinks`
  `type`/`url` shape, `Config.Community.Groups`, and every new optional
  field above.
- Real screenshots (from the browser build, fictional demo data) added to
  `README.md` under `docs/screenshots/`.

### Testing

- Lua: 61 tests for `lua/validate.lua` (was 18) and 31 for
  `lua/registry.lua` (was 15), covering URL/color validation, enum
  coercion, quick-link/community-group/category validation, resource-state
  bucketing, and the new ownership model.
- Frontend: expanded from 14 to 157 Vitest tests, adding component tests
  (React Testing Library) for every page, the sidebar, and the search
  box's keyboard behavior, plus an end-to-end `App.test.tsx` covering
  search → navigate → highlight and pinned-item persistence across a
  remount.

### Compatibility

- Every valid `0.1.0` config and every valid `0.1.0` export call (
  `RegisterCommandInfo`, `RegisterKeybind`, `AddAnnouncement`, `SetStat`,
  `RemoveEntry`) continues to work unchanged. All `0.2.0` additions are
  optional fields or new exports.

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
