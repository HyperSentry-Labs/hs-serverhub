--[[
    hs-serverhub / lua/registry.lua
    ------------------------------------------------------------------------
    Backing store for the developer-facing exports() API (see docs/api.md).
    Server-only. Kept separate from server.lua so the registration/validation
    logic stays small and readable.

    Design decisions worth knowing about:
    - IDs are shared between static Config entries and dynamic registrations,
      so a resource can never silently overwrite a server-owner-authored
      command/keybind/rule by reusing its id.
    - v0.2.0: every dynamic registration now records an `owner` - the name
      of the resource that called the export (see `GetInvokingResource()`
      in server.lua). RemoveEntry and the new Update* exports check that
      the caller's owner matches before touching an entry, so resource A
      can never edit or remove resource B's registration by guessing its
      id. `owner` defaults to the string 'unknown' when called with no
      owner (e.g. the standalone test suite below, which predates ownership
      and intentionally keeps calling these functions without it) so that
      two anonymous calls still consistently match each other.
    - A dynamically-registered keybind with no explicit `resource` field is
      stamped with its owner automatically, so "Resource: my-police" shows
      up in the Keybinds page without the caller having to repeat itself.
    - There is no `RegisterPage` export in v1/v2. Accepting arbitrary
      external HTML/content into the NUI would mean either trusting other
      resources' markup (a real injection risk, see SECURITY.md) or
      building a whole mini content-schema for free-form pages - both are
      out of scope for an information hub. `AddAnnouncement` and `SetStat`
      (plus their Update* counterparts) cover the realistic "another
      resource wants to show something" use cases without that risk.
]]

HS = HS or {}
HS.Registry = {
    commands = {},   -- id -> item (item.owner = registering resource)
    keybinds = {},   -- id -> item
    announcements = {}, -- id -> item
    stats = {},      -- key -> { key, label, value, owner }
}

local UNOWNED = 'unknown'

local function debugLog(fmt, ...)
    if Config and Config.General and Config.General.Debug then
        print('[hs-serverhub] ' .. string.format(fmt, ...))
    end
end

--- Registers `item` into `store` keyed by `item.id`, refusing to overwrite
--- an id already present in `store` or in `staticIds` (ids owned by
--- config.lua for that same section). Stamps `item.owner`.
--- @return boolean ok, string|nil reason
local function register(store, staticIds, requiredFields, item, owner)
    if type(item) ~= 'table' then
        return false, 'expected a table'
    end

    local ok, missing = HS.Validate.requireFields(item, requiredFields)
    if not ok then
        return false, string.format('missing required field "%s"', missing)
    end

    if staticIds[item.id] or store[item.id] then
        return false, string.format('id "%s" is already in use', item.id)
    end

    item.owner = owner or UNOWNED
    store[item.id] = item
    return true, nil
end

--- Overwrites an EXISTING dynamic entry in `store`, only if it was
--- registered by the same `owner`. Never touches a static config.lua
--- entry (those never appear in `store` in the first place).
--- @return boolean ok, string|nil reason
local function update(store, requiredFields, item, owner)
    if type(item) ~= 'table' then
        return false, 'expected a table'
    end

    local ok, missing = HS.Validate.requireFields(item, requiredFields)
    if not ok then
        return false, string.format('missing required field "%s"', missing)
    end

    local existing = store[item.id]
    if not existing then
        return false, string.format('no entry with id "%s" to update (use Register* for a new entry)', tostring(item.id))
    end

    local ownerName = owner or UNOWNED
    if existing.owner ~= ownerName then
        return false, string.format('id "%s" is owned by a different resource', item.id)
    end

    item.owner = ownerName
    store[item.id] = item
    return true, nil
end

local function remove(store, id, owner)
    if type(id) ~= 'string' or id == '' then
        return false, 'id must be a non-empty string'
    end
    local existing = store[id]
    if not existing then
        return false, 'no entry with that id'
    end
    local ownerName = owner or UNOWNED
    if type(existing) == 'table' and existing.owner and existing.owner ~= ownerName then
        return false, string.format('id "%s" is owned by a different resource', id)
    end
    store[id] = nil
    return true, nil
end

local function values(store)
    local out = {}
    for _, v in pairs(store) do
        table.insert(out, v)
    end
    return out
end

--- Builds a set of ids already used by a static config section, so dynamic
--- registrations can be checked against them.
local function idSet(list)
    local set = {}
    for _, item in ipairs(list or {}) do
        if type(item) == 'table' and type(item.id) == 'string' then
            set[item.id] = true
        end
    end
    return set
end

function HS.Registry.registerCommand(item, staticCommandItems, owner)
    local ok, reason = register(
        HS.Registry.commands,
        idSet(staticCommandItems),
        { 'id', 'command', 'title', 'description', 'category' },
        item,
        owner
    )
    if ok then debugLog('registered command %s (%s) [%s]', item.id, item.command, item.owner)
    else debugLog('rejected command registration: %s', reason) end
    return ok, reason
end

function HS.Registry.updateCommand(item, owner)
    local ok, reason = update(
        HS.Registry.commands,
        { 'id', 'command', 'title', 'description', 'category' },
        item,
        owner
    )
    if ok then debugLog('updated command %s', item.id)
    else debugLog('rejected command update: %s', reason) end
    return ok, reason
end

function HS.Registry.registerKeybind(item, staticKeybindItems, owner)
    if type(item) == 'table' and item.resource == nil then
        item.resource = owner
    end
    local ok, reason = register(
        HS.Registry.keybinds,
        idSet(staticKeybindItems),
        { 'id', 'key', 'title', 'description', 'category' },
        item,
        owner
    )
    if ok then debugLog('registered keybind %s (%s) [%s]', item.id, item.key, item.owner)
    else debugLog('rejected keybind registration: %s', reason) end
    return ok, reason
end

function HS.Registry.updateKeybind(item, owner)
    local ok, reason = update(
        HS.Registry.keybinds,
        { 'id', 'key', 'title', 'description', 'category' },
        item,
        owner
    )
    if ok then debugLog('updated keybind %s', item.id)
    else debugLog('rejected keybind update: %s', reason) end
    return ok, reason
end

function HS.Registry.addAnnouncement(item, staticNewsItems, owner)
    local ok, reason = register(
        HS.Registry.announcements,
        idSet(staticNewsItems),
        { 'id', 'title', 'date', 'description' },
        item,
        owner
    )
    if ok then debugLog('added announcement %s [%s]', item.id, item.owner)
    else debugLog('rejected announcement: %s', reason) end
    return ok, reason
end

function HS.Registry.updateAnnouncement(item, owner)
    local ok, reason = update(
        HS.Registry.announcements,
        { 'id', 'title', 'date', 'description' },
        item,
        owner
    )
    if ok then debugLog('updated announcement %s', item.id)
    else debugLog('rejected announcement update: %s', reason) end
    return ok, reason
end

--- Unlike the other Register* exports, calling this again with the same
--- `key` UPDATES the existing entry rather than being rejected as a
--- duplicate - that's the intended way to keep a live value (like a queue
--- length) current. `UpdateStat` in server.lua is simply an alias for this
--- for API-naming consistency; both behave identically.
function HS.Registry.setStat(key, label, value, owner)
    if type(key) ~= 'string' or key == '' then
        return false, 'key must be a non-empty string'
    end
    if type(label) ~= 'string' or label == '' then
        return false, 'label must be a non-empty string'
    end
    if value == nil then
        return false, 'value is required'
    end
    local existing = HS.Registry.stats[key]
    local ownerName = owner or UNOWNED
    if existing and existing.owner and existing.owner ~= ownerName then
        return false, string.format('stat "%s" is owned by a different resource', key)
    end
    HS.Registry.stats[key] = { key = key, label = label, value = value, owner = ownerName }
    debugLog('set stat %s = %s [%s]', key, tostring(value), ownerName)
    return true, nil
end

--- `kind` is one of: 'command', 'keybind', 'announcement', 'stat'.
function HS.Registry.removeEntry(kind, id, owner)
    if kind == 'command' then return remove(HS.Registry.commands, id, owner) end
    if kind == 'keybind' then return remove(HS.Registry.keybinds, id, owner) end
    if kind == 'announcement' then return remove(HS.Registry.announcements, id, owner) end
    if kind == 'stat' then return remove(HS.Registry.stats, id, owner) end
    return false, 'unknown kind: ' .. tostring(kind)
end

function HS.Registry.snapshot()
    return {
        commands = values(HS.Registry.commands),
        keybinds = values(HS.Registry.keybinds),
        announcements = values(HS.Registry.announcements),
        stats = values(HS.Registry.stats),
    }
end

return HS
