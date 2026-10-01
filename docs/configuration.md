# Configuration reference

Everything in this document lives in **`config.lua`** at the repository root.
You never need to edit anything under `web/` to rebrand or re-content
ServerHub - config.lua is the single source of truth, and it is read fresh
every time the resource starts.

If an entry is missing a required field, has a blank `id`, or reuses an
`id` already used elsewhere in the same section, that one entry is skipped
and a warning is printed to the server console (only when
`Config.General.Debug = true`). An invalid *optional* field - an
unrecognized `severity`/`priority`, or a URL/color that isn't safe - is
individually repaired (reset to its default, or cleared) instead of
dropping the whole entry. Nothing else about the resource is affected.

---

## `Config.General`

| Field | Type | Default | Notes |
|---|---|---|---|
| `ServerName` | string | `'Hyper Roleplay'` | Shown in the header and used as a fallback logo initial. |
| `Subtitle` | string | — | One line under the server name. |
| `Description` | string | — | Shown in the Overview hero. |
| `Logo` | string | `'branding/logo.svg'` | Path resolved relative to `web/dist/`. Drop your file in `web/public/branding/` (it is copied into every build) and point this at it, e.g. `'branding/logo.png'`. If the file is missing or fails to load, the header automatically shows a monogram badge instead - nothing breaks. |
| `AccentColor` | CSS color | `'#E3A857'` | Primary accent (active nav item, primary actions, focus rings). |
| `AccentColorSecondary` | CSS color | `'#5FB3B3'` | Secondary accent (version tags, subtle highlights). |
| `Command` | string (no slash) | `'serverhub'` | Chat command that opens ServerHub. |
| `DefaultKey` | FiveM key name | `'F10'` | Shipped default only - players can rebind under Settings > Key Bindings > FiveM > "Toggle ServerHub" at any time. |
| `Language` | string | `'en'` | Must match a file in `web/src/i18n/locales/`. See `docs/localization.md`. |
| `Debug` | boolean | `false` | Enables config-warning and bridge diagnostic logging. Keep `false` in production. |

### Fonts

ServerHub ships with **zero runtime font dependency** - no Google Fonts,
no CDN. By default the UI uses the player's OS UI font. If you want the
"Inter" / "JetBrains Mono" look shown in the README screenshots, place the
font files under `web/public/fonts/` and add `@font-face` rules to
`web/src/styles/globals.css` yourself; `tailwind.config.js` already
references those family names and will pick them up automatically once
they resolve.

---

## `Config.Theme` (optional)

Fine-tuning on top of `AccentColor`/`AccentColorSecondary` above - most
servers never need this. Every value is validated the same way as any
other color: a hex color (`#rgb`, `#rrggbb`, `#rrggbbaa`) or an
`rgb()`/`rgba()`/`hsl()`/`hsla()` function. An invalid value is ignored
(with a console warning) and the built-in default is used instead - it can
never break the UI or inject arbitrary CSS.

```lua
Config.Theme = {
    AccentHover = '#F0BA70',   -- hover/active state of AccentColor
    Background = '#0F1216',   -- page background
    Surface = '#14171D',      -- card/panel background
    SurfaceRaised = '#1B1F27',-- inputs, raised surfaces
    Border = '#262B34',
    Text = '#E8EAED',
    Muted = '#939BA6',        -- secondary/muted text
}
```

Leave any field unset (or the whole table empty, the default) to keep the
built-in HyperSentry look for that token.

---

## `Config.Links`

Simple key/value URLs, reused by the header/footer and by
`Config.Community.Links` so you don't repeat yourself.

```lua
Config.Links = {
    Discord = 'https://discord.gg/example',
    Website = 'https://example.com',
    Support = 'https://example.com/support',
}
```

---

## `Config.Overview`

| Field | Type | Notes |
|---|---|---|
| `Enabled` | boolean | When `false`, Overview is removed from the sidebar entirely and the first remaining section becomes the default view. |
| `ShowLiveStats` | boolean | Requires `Config.Status.Enabled` to actually show anything. |
| `ShowLatestAnnouncement` | boolean | Surfaces the single newest `Config.News` item (including exports-registered ones). |
| `QuickLinks` | array | The Overview shortcut tiles - these double as ServerHub's "quick actions". See below. |

`QuickLinks` entries come in two shapes, chosen by `type`:

```lua
Config.Overview.QuickLinks = {
    -- type = 'section' (the default - and the only shape v0.1 supported):
    -- jumps to a built-in section.
    { id = 'ql-rules', label = 'Rules', target = 'rules', icon = 'shield' },

    -- type = 'url': opens an external link in the player's browser instead.
    { id = 'ql-discord', label = 'Join Discord', type = 'url', url = 'https://discord.gg/example', icon = 'discord' },
}
```

`target` must be one of `overview`, `rules`, `commands`, `keybinds`,
`getting-started`, `news`, `community`. `url` must be `http`/`https`. An
entry that matches neither shape (e.g. `type = 'url'` with no valid `url`,
or no `target`) is skipped with a warning rather than reaching the NUI and
doing nothing when clicked - this validation is new in v0.2.0; in v0.1 a
malformed `QuickLinks` entry was passed straight to the NUI unchecked.

---

## `Config.Status`

| Field | Type | Notes |
|---|---|---|
| `Enabled` | boolean | Turns the entire live-status feature on/off. |
| `RefreshIntervalMs` | number | How often the server recalculates its snapshot. Pushed to clients **only when the snapshot changed**, and only to players who currently have ServerHub open. |
| `ShowUptime` | boolean | Shows resource uptime (not server/box uptime) on the Overview card. |
| `MonitoredResources` | array of resource names (strings) | Each is checked with `GetResourceState`. Leave empty to hide the card. Only resources you list are ever queried. |

---

## `Config.Rules`

```lua
Config.Rules = {
    Categories = { { id = 'general', label = 'General', icon = 'book' } },
    Items = {
        {
            id = 'general-1',          -- required, unique across Rules.Items
            category = 'general',      -- required, should match a Categories id
            title = 'Respect every player',   -- required
            description = 'Harassment ... ',  -- required
            severity = 'critical',     -- optional: 'info' | 'warning' | 'critical' (default 'info')
            icon = 'shield',           -- optional, currently unused on this page but reserved
        },
    },
}
```

An invalid `severity` value falls back to `'info'` (with a console
warning) rather than dropping the whole rule. Long descriptions
(including multi-line ones, using `\n\n` for a paragraph break) are shown
collapsed behind a "Show details" toggle automatically - no separate field
needed. Each rule's `id` is also shown as a small reference chip, so
players can quote it (e.g. in a support ticket) precisely.

---

## `Config.Commands`

```lua
Config.Commands = {
    Categories = { { id = 'general', label = 'General' } },
    Items = {
        {
            id = 'cmd-report',         -- required, unique
            command = '/report',       -- required, shown as-is (include the slash)
            title = 'Report a player or issue', -- required
            description = 'Opens a report ticket for staff.', -- required
            category = 'general',      -- required
            permission = 'Everyone',   -- optional, DISPLAY ONLY - see Security note below
            aliases = { '/112' },      -- optional
            usage = '/report [message]', -- optional, shown as a code example - only set this when the command actually takes arguments
        },
    },
}
```

> **Security note:** `permission` is a label shown to players, e.g. so they
> know a command is staff-only. ServerHub never checks or enforces
> permissions - it is an information hub, not an access-control system.

---

## `Config.Keybinds`

```lua
Config.Keybinds = {
    Categories = { { id = 'core', label = 'Core' } },
    Items = {
        { id = 'key-phone', key = 'F1', title = 'Phone', description = 'Open your phone.', category = 'core' },
        {
            id = 'key-police-menu', key = 'F6', title = 'Police Menu',
            description = 'Duty-only police tools.', category = 'core',
            resource = 'my-police',  -- optional, informational only - shown as "Resource: my-police"
            context = 'Duty only',   -- optional short note, e.g. "Hold", "Duty only"
        },
    },
}
```

This is a **directory only** - ServerHub does not bind these keys. Keep the
directory in sync with the resource that actually owns each keybind, or
have that resource register itself at runtime via `exports` (see
`docs/api.md`) - a dynamically-registered keybind is stamped with the
registering resource's name in `resource` automatically if you don't set
one yourself.

---

## `Config.GettingStarted`

```lua
Config.GettingStarted.Steps = {
    {
        id = 'step-rules',
        title = 'Read the server rules',
        description = 'A five-minute read that saves you from an avoidable ban.',
        icon = 'shield',
        linkLabel = 'Open Rules',   -- optional
        linkTarget = 'rules',       -- optional: jumps to a built-in section
        -- linkUrl = 'https://...' -- optional instead of linkTarget: opens externally
        estimatedMinutes = 5,        -- optional, shown as "~5 min"
    },
}

Config.GettingStarted.EnableProgress = true -- optional, default true
```

Steps render in array order and are numbered automatically - there is no
fixed step count. When `EnableProgress` is `true` (the default), players
get a per-step checkbox, an overall progress bar, and a "recommended next
step" badge on the first incomplete step - all tracked locally on the
player's device only (see `docs/api.md`'s ownership note and the
Compatibility section of the README for why nothing here is
server-authoritative). Set it to `false` to show a plain numbered list
with no checkboxes.

---

## `Config.News`

```lua
Config.News.Items = {
    {
        id = 'news-launch',
        title = 'Hyper Roleplay has launched',
        date = '2026-08-01',      -- required, ISO 8601 (YYYY-MM-DD); also used for newest-first sorting
        description = 'Whitelist is open and the city is live.', -- required
        category = 'Announcement', -- optional
        version = 'v1.0.0',        -- optional
        url = 'https://...',       -- optional "read more" link, must be http/https
        priority = 'important',    -- optional: 'normal' (default) | 'important' | 'critical'
        featured = true,           -- optional: can win the Overview "latest announcement" slot over a newer, unfeatured item
        icon = 'bell',             -- optional
    },
}
```

`priority` is shown as a small, non-alarmist label next to the date - never
a flashing banner. An invalid value falls back to `'normal'` (with a
console warning) rather than dropping the whole announcement.

---

## `Config.Community`

```lua
Config.Community.Links = {
    { id = 'com-discord', label = 'Discord', url = Config.Links.Discord, icon = 'discord', description = 'Chat with staff and the community.' },
}
```

Every link's `url` must be `http`/`https` - anything else (a schemeless
string, `javascript:`, etc.) drops that link entirely, with a warning,
rather than rendering a broken or unsafe one.

### Grouped links (optional)

For servers with enough links to want sections (Community / Support /
Store, or whatever you name them):

```lua
Config.Community.Groups = {
    {
        id = 'support',
        label = 'Support',
        Links = {
            { id = 'grp-tickets', label = 'Ticket System', url = 'https://example.com/support', icon = 'life-buoy' },
            { id = 'grp-docs', label = 'Documentation', url = 'https://example.com/docs', icon = 'book' },
        },
    },
}
```

When `Groups` is non-empty, the Community page renders these groups
instead of the flat `Links` list above (a group that ends up with zero
valid links after validation - e.g. all its URLs were unsafe - is hidden
entirely rather than shown as an empty section). Leave `Groups` empty (the
default) to keep the simpler flat layout - most servers don't need it.

Available `icon` names (also used elsewhere): `book`, `drama`, `crosshair`,
`badge`, `cross`, `car`, `shield`, `terminal`, `keyboard`, `compass`,
`user-plus`, `id-card`, `briefcase`, `message-circle`, `discord`, `globe`,
`life-buoy`, `search`, `close`, `external-link`, `chevron-right`, `users`,
`info`, `warning`, `siren`, `bell`, `newspaper`, `home`, `announcement`.
Unknown names fall back to a neutral info icon rather than breaking the
page. (`discord` renders a generic chat icon, not Discord's logo mark.)
