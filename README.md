# ServerHub (`hs-serverhub`)

**An in-game information and onboarding hub for FiveM servers.**

By [HyperSentry Labs](https://github.com/HyperSentry-Labs).

Players open ServerHub with a keypress or chat command and get one clean,
searchable panel instead of hunting across Discord, pinned messages, and
loading-screen images: server rules, commands, keybinds, a guided
"getting started" flow, news/changelog, and community links - plus live
player count and server status if you want it.

It is **not** another pause menu. It doesn't touch inventory, jobs,
economy, or admin tools. It's a focused, standalone information layer that
works on any server, with or without a framework.

---

## Features

- **Overview hub** - welcome hero, live player count/status, monitored
  resource health, quick-access tiles, latest announcement, community
  preview.
- **Rules** - categorized, searchable, with severity badges.
- **Commands** - searchable directory with categories, aliases, and
  display-only permission labels.
- **Keybinds** - searchable directory with categories.
- **Getting Started** - a configurable, numbered onboarding timeline.
- **News / Changelog** - category filter, search, newest-first.
- **Community** - configurable external links (Discord, website, support,
  anything else).
- **Cross-section search** - one search box covers rules, commands,
  keybinds, getting-started, and news at once, grouped by section.
- **Live server status** - real player count and optional monitored-
  resource health, pushed efficiently (only to open viewers, only on
  change - never a polling spam loop).
- **Developer API** - other resources can register commands, keybinds, and
  announcements, or set a live stat, via `exports` - see `docs/api.md`.
- **Fully standalone** - no ESX/QBCore/Qbox/ox_core/vRP dependency, ever.
- **Browser-first development** - the entire UI runs in a plain browser
  tab via a mock bridge, with demo data mirroring the shipped config.
- **Rebrandable** - name, subtitle, description, logo (with an automatic
  fallback if missing), accent colors, and every link are config-driven.
- **Internationalized** - English (default) and Persian ship out of the
  box, with RTL support and a documented path to add more languages.
- **Never crashes on bad config** - malformed entries are skipped with a
  console warning, not a broken resource.

## Screenshots / demo

This is the `0.1.0` development release and has not yet been visually
captured on a live server, so no screenshots are included here - a
promotional image with fabricated numbers or a fake "used by" claim would
be worse than no image at all. The fastest way to see it is to run it
yourself:

```bash
npm install
npm run dev
```

then open the printed `http://localhost:5173` URL. The browser demo uses
realistic sample data (the fictional "Hyper Roleplay" server) and behaves
identically to the in-game panel.

## Installation

1. Download a release ZIP (which already includes a built `web/dist/`), or
   clone the repo and run `npm run build` yourself - see
   [Development](#development--browser-preview) below.
2. Copy the `hs-serverhub` folder into your server's `resources/`
   directory.
3. Add to `server.cfg`:
   ```
   ensure hs-serverhub
   ```
4. Restart your server (or `refresh` + `ensure hs-serverhub`).

No other resource, database, or framework is required.

## Configuration

Everything is configured in **`config.lua`** - server name, branding,
colors, links, rules, commands, keybinds, getting-started steps, news, and
community links. Non-programmers can edit it directly; every field is
commented with its purpose. Full reference: **[`docs/configuration.md`](docs/configuration.md)**.

## Commands

| Command        | Default      | Configurable via         |
| -------------- | ------------ | ------------------------ |
| Open ServerHub | `/serverhub` | `Config.General.Command` |

## Keybind

| Action           | Default key | Notes                                                                                                                                                                                   |
| ---------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Toggle ServerHub | `F10`       | Shipped default only - players can rebind it any time under **Settings > Key Bindings > FiveM > "Toggle ServerHub"**. The default is also configurable via `Config.General.DefaultKey`. |

Escape and an in-panel close button also close ServerHub. A native-level
input safety net in `client.lua` guarantees the panel can never leave a
player's cursor or controls stuck, even if the web page fails to load.

## API / exports

Other resources can add content at runtime without editing `config.lua`:

```lua
exports['hs-serverhub']:RegisterCommandInfo({ ... })
exports['hs-serverhub']:RegisterKeybind({ ... })
exports['hs-serverhub']:AddAnnouncement({ ... })
exports['hs-serverhub']:SetStat(key, label, value)
exports['hs-serverhub']:RemoveEntry(kind, id)
```

Full reference, validation rules, and examples: **[`docs/api.md`](docs/api.md)**.

## Development & browser preview

```bash
git clone https://github.com/HyperSentry-Labs/hs-serverhub.git
cd hs-serverhub
npm install
npm run dev      # -> http://localhost:5173, full UI, no FiveM required
```

The dev server uses a mock FiveM bridge with realistic demo data, so every
page, the search, and all navigation can be reviewed and iterated on in a
normal browser tab. Full workflow, FiveM installation, devtools, and
debugging notes: **[`docs/development.md`](docs/development.md)**.

## Build instructions

```bash
npm run build     # tsc -b && vite build -> web/dist/
```

`web/dist/` is what `fxmanifest.lua` actually loads in-game. It is not
committed to source control - build it yourself, or use the one already
included in a tagged release ZIP.

## Localization

English (default) and Persian ship out of the box, with the UI direction
(LTR/RTL) switching automatically. Adding another language is a matter of
copying one JSON file and translating it - see **[`docs/localization.md`](docs/localization.md)**.

## Performance notes

- Live status is only ever pushed to players who currently have ServerHub
  open, and only when the underlying snapshot actually changed - not on a
  fixed broadcast-to-everyone timer.
- Monitored-resource health only checks the resources you explicitly list
  in `Config.Status.MonitoredResources` - never a scan of every resource.
- The production NUI bundle is a single small JS/CSS pair (roughly 190 KB
  JS / 13 KB CSS before gzip as of `0.1.0`) with no client-side router and
  no large UI framework.
- No CDN or external network dependency at runtime - see
  [Compatibility](#compatibility).

## Compatibility

- **Framework:** none required. Works standalone on ESX, QBCore, Qbox,
  ox_core, vRP, or no framework at all.
- **FiveM:** `fx_version 'cerulean'`, `lua54 'yes'`.
- **Network:** offline-first after installation - no Google Fonts, no CDN
  JS/CSS, no remote icon libraries, no external APIs at runtime. Only
  user-clicked links (Discord, website, etc.) leave the game, opened by
  FiveM's CEF via standard `target="_blank"` anchors.

## Troubleshooting

| Symptom                                             | Likely cause                                                           | Fix                                                                                                                                            |
| --------------------------------------------------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Panel doesn't open                                  | `web/dist/` missing or stale                                           | Run `npm run build`, then `restart hs-serverhub`.                                                                                              |
| Console warns about a skipped rule/command/etc.     | A `config.lua` entry is missing a required field or reuses an `id`     | Check the warning text - it names the section and the missing field. See `docs/configuration.md`.                                              |
| Player count always shows 0                         | `Config.Status.Enabled` is `false`, or the server was just restarted   | Confirm the config flag; the first snapshot is sent as soon as a viewer opens ServerHub.                                                       |
| Logo doesn't show                                   | No file at the configured `Logo` path                                  | This is expected behavior, not a bug - a monogram badge is the intentional fallback. Add a real file under `web/public/branding/` and rebuild. |
| A resource's exported command/keybind isn't showing | The `id` collides with an existing one, or a required field is missing | The export call returns `false, reason` - log and check it.                                                                                    |

## Contributing

See **[`CONTRIBUTING.md`](CONTRIBUTING.md)**.

## License

[MIT](LICENSE) - see the LICENSE file. Copyright (c) 2026 HyperSentry Labs.
