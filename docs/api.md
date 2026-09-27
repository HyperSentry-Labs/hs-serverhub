# Developer API (`exports`)

ServerHub exposes five server-side exports so other resources can add
content without editing `config.lua`. All of them are **optional** - core
functionality works perfectly with zero external resources.

Every export validates its input and returns `false, reason` instead of
throwing, and every one refuses to overwrite an `id` already used by either
`config.lua` or a previous dynamic registration (see
`lua/registry.lua`).

> **Why there's no `RegisterPage`:** letting other resources inject
> arbitrary HTML/content into the NUI would mean trusting external
> markup inside ServerHub's own webview, which is a real injection risk
> (see `SECURITY.md`), or building a whole free-form content schema just
> for that one use case. `AddAnnouncement` and `SetStat` cover the
> realistic "another resource wants to surface something" cases without
> that risk. If you have a use case this doesn't cover, please open an
> issue describing it rather than reaching for `RegisterPage` first.

---

## `RegisterCommandInfo(item)`

Adds an entry to the Commands page.

```lua
local ok, reason = exports['hs-serverhub']:RegisterCommandInfo({
    id = 'my-resource:tow',          -- required, unique - prefix with your resource name
    command = '/tow',                -- required
    title = 'Call a tow truck',      -- required
    description = 'Requests a tow truck to your location.', -- required
    category = 'general',            -- required - shown as-is even if it doesn't match a configured category
    permission = 'Everyone',         -- optional, display only
    aliases = { '/towtruck' },       -- optional
})

if not ok then
    print(('[my-resource] could not register command info: %s'):format(reason))
end
```

**Returns:** `boolean ok, string|nil reason`.

---

## `RegisterKeybind(item)`

Adds an entry to the Keybinds page. Does **not** bind the key itself - you
still call `RegisterKeyMapping` in your own resource.

```lua
exports['hs-serverhub']:RegisterKeybind({
    id = 'my-resource:tow-key',
    key = 'T',
    title = 'Call tow truck',
    description = 'Quick-call a tow truck.',
    category = 'core',
})
```

**Returns:** `boolean ok, string|nil reason`.

---

## `AddAnnouncement(item)`

Adds an entry to the News page (merged with `Config.News.Items` and
re-sorted newest-first by `date`).

```lua
exports['hs-serverhub']:AddAnnouncement({
    id = 'my-resource:maintenance-2026-10-01',
    title = 'Scheduled maintenance',
    date = '2026-10-01',
    description = 'The server will restart at 04:00 UTC for a database migration.',
    category = 'Maintenance', -- optional
})
```

**Returns:** `boolean ok, string|nil reason`.

---

## `SetStat(key, label, value)`

Sets (or overwrites) a small custom stat chip shown on the Overview live
status card, next to the player count. Unlike the other exports, calling
this again with the same `key` **updates** the existing entry rather than
being rejected as a duplicate - that's the intended way to keep a live
value (like a queue length) current.

```lua
exports['hs-serverhub']:SetStat('queue', 'Queue', #GetQueuedPlayers())
```

**Returns:** `boolean ok, string|nil reason`.

---

## `RemoveEntry(kind, id)`

Removes a previously dynamic-registered entry. `kind` is one of
`'command'`, `'keybind'`, `'announcement'`, `'stat'`. You can only remove
entries registered via the API - static `config.lua` entries are never
affected.

```lua
exports['hs-serverhub']:RemoveEntry('announcement', 'my-resource:maintenance-2026-10-01')
```

**Returns:** `boolean ok, string|nil reason`.

---

## Edge cases

- Calling any export with a table missing a required field returns
  `false, 'missing required field "<field>"'` and changes nothing.
- Registering an `id` that collides with a static `config.lua` entry, or
  with a previous dynamic registration (except `SetStat`, see above),
  returns `false, 'id "..." is already in use'`.
- A successful registration immediately pushes an updated content payload
  to every player who currently has ServerHub open - there is no need to
  ask players to reopen the UI.
- None of these exports ever touch player identifiers, licenses, or any
  other sensitive data - see `SECURITY.md`.
