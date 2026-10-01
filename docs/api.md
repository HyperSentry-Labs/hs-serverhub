# Developer API (`exports`)

ServerHub exposes nine server-side exports so other resources can add and
maintain content without editing `config.lua`. All of them are
**optional** - core functionality works perfectly with zero external
resources.

Every export validates its input and returns `false, reason` instead of
throwing.

**Ownership (v0.2.0):** every dynamic registration is stamped with the
name of the resource that created it (via FXServer's own
`GetInvokingResource()`), and only that resource can update or remove it
afterward. This means:

- `RegisterCommandInfo`/`RegisterKeybind`/`AddAnnouncement` refuse to
  overwrite an `id` already used by `config.lua` **or** by a previous
  dynamic registration - from any resource, including a second call from
  the same one. Use the matching `Update*` export to change something you
  already registered.
- `UpdateCommandInfo`/`UpdateKeybind`/`UpdateAnnouncement` only succeed
  against an entry your own resource registered. A different resource's
  entry (or a static `config.lua` entry, which is never in the dynamic
  store at all) is refused with `false, 'id "..." is owned by a different
  resource'` or `false, 'no entry with id "..." to update'`.
- `RemoveEntry` follows the same rule - one resource can never remove
  another's registration by guessing its `id`.
- `SetStat`/`UpdateStat` are the exception by design: they're meant to
  keep a live value (a queue length, a job count) current, so calling
  either again with the same `key` from the **same** resource always
  succeeds; a different resource trying to reuse your `key` is refused.

You do not need to pass an owner/resource name yourself - it's determined
automatically from which resource made the `exports[...]:Something(...)`
call.

> **Why there's no `RegisterPage`:** letting other resources inject
> arbitrary HTML/content into the NUI would mean trusting external
> markup inside ServerHub's own webview, which is a real injection risk
> (see `SECURITY.md`), or building a whole free-form content schema just
> for that one use case. `AddAnnouncement`/`SetStat` (and their `Update*`
> counterparts) cover the realistic "another resource wants to surface
> something" cases without that risk. If you have a use case this doesn't
> cover, please open an issue describing it rather than reaching for
> `RegisterPage` first.

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
    usage = '/tow',                  -- optional, shown as a code example
})

if not ok then
    print(('[my-resource] could not register command info: %s'):format(reason))
end
```

**Returns:** `boolean ok, string|nil reason`.

## `UpdateCommandInfo(item)`

Updates a command your resource previously registered with
`RegisterCommandInfo`. Same shape and required fields; `id` must already
exist and belong to your resource.

```lua
exports['hs-serverhub']:UpdateCommandInfo({
    id = 'my-resource:tow', command = '/tow', title = 'Call a tow truck',
    description = 'Requests a tow truck - now free during the event!',
    category = 'general',
})
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
    context = 'Hold',           -- optional short note, e.g. "Hold", "Duty only"
    -- resource = 'my-resource' -- optional; defaults to your resource name if omitted
})
```

**Returns:** `boolean ok, string|nil reason`.

## `UpdateKeybind(item)`

Same shape as `RegisterKeybind`; `id` must already exist and belong to
your resource.

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
    category = 'Maintenance',   -- optional
    priority = 'important',     -- optional: 'normal' (default) | 'important' | 'critical'
    featured = true,            -- optional: can win the Overview "latest announcement" slot
    url = 'https://example.com/changelog', -- optional, must be http/https
})
```

**Returns:** `boolean ok, string|nil reason`.

## `UpdateAnnouncement(item)`

Same shape as `AddAnnouncement`; `id` must already exist and belong to
your resource. Useful for e.g. editing a maintenance notice once the
window is confirmed, without removing and re-adding it.

**Returns:** `boolean ok, string|nil reason`.

---

## `SetStat(key, label, value)` / `UpdateStat(key, label, value)`

Sets (or overwrites) a small custom stat chip shown on the Overview live
status card, next to the player count. These two are aliases of each
other - both upsert - provided as a pair purely so the naming convention
(`Register*`/`Update*`) stays consistent across the whole API. Calling
either again with the same `key` from the same resource keeps updating the
same chip, which is the intended way to keep a live value (like a queue
length) current.

```lua
exports['hs-serverhub']:SetStat('queue', 'Queue', #GetQueuedPlayers())
```

**Returns:** `boolean ok, string|nil reason`.

---

## `RemoveEntry(kind, id)`

Removes a previously dynamic-registered entry. `kind` is one of
`'command'`, `'keybind'`, `'announcement'`, `'stat'`. You can only remove
entries your own resource registered via the API - static `config.lua`
entries are never affected, and another resource's entries are refused.

```lua
exports['hs-serverhub']:RemoveEntry('announcement', 'my-resource:maintenance-2026-10-01')
```

**Returns:** `boolean ok, string|nil reason`.

---

## Edge cases

- Calling any export with a table missing a required field returns
  `false, 'missing required field "<field>"'` and changes nothing.
- Registering an `id` that collides with a static `config.lua` entry, or
  with any existing dynamic registration, returns
  `false, 'id "..." is already in use'`.
- Calling an `Update*` export (or `RemoveEntry`) for an `id` owned by a
  different resource returns
  `false, 'id "..." is owned by a different resource'`; for an `id` that
  was never registered, `false, 'no entry with id "..." to update'`.
- A successful register/update/remove immediately pushes an updated
  content payload to every player who currently has ServerHub open - there
  is no need to ask players to reopen the UI.
- An unsafe `url` (anything other than `http`/`https`) on `AddAnnouncement`/
  `UpdateAnnouncement` is silently dropped from that field (the rest of the
  announcement still registers) - see `lua/validate.lua`.
- None of these exports ever touch player identifiers, licenses, or any
  other sensitive data - see `SECURITY.md`.
