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
    - There is no `RegisterPage` export in v1. Accepting arbitrary external
      HTML/content into the NUI would mean either trusting other resources'
      markup (a real injection risk, see point 27 of the brief/README
      security notes) or building a whole mini content-schema for free-form
      pages - both are out of scope for an information hub. `AddAnnouncement`
      and `SetStat` cover the realistic "another resource wants to show
      something" use cases without that risk.
]]

HS = HS or {}
HS.Registry = {
    commands = {},   -- id -> item
    keybinds = {},   -- id -> item
    announcements = {}, -- id -> item
    stats = {},      -- key -> { key, label, value }
}

local function debugLog(fmt, ...)
    if Config and Config.General and Config.General.Debug then
        print('[hs-serverhub] ' .. string.format(fmt, ...))
    end
end

--- Registers `item` into `store` keyed by `item.id`, refusing to overwrite
--- an id already present in `store` or in `staticIds` (ids owned by
--- config.lua for that same section).
--- @return boolean ok, string|nil reason
local function register(store, staticIds, requiredFields, item)
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

    store[item.id] = item
    return true, nil
end

local function remove(store, id)
    if type(id) ~= 'string' or id == '' then
        return false, 'id must be a non-empty string'
    end
    if not store[id] then
        return false, 'no entry with that id'
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

function HS.Registry.registerCommand(item, staticCommandItems)
    local ok, reason = register(
        HS.Registry.commands,
        idSet(staticCommandItems),
        { 'id', 'command', 'title', 'description', 'category' },
        item
    )
    if ok then debugLog('registered command %s (%s)', item.id, item.command)
    else debugLog('rejected command registration: %s', reason) end
    return ok, reason
end

function HS.Registry.registerKeybind(item, staticKeybindItems)
    local ok, reason = register(
        HS.Registry.keybinds,
        idSet(staticKeybindItems),
        { 'id', 'key', 'title', 'description', 'category' },
        item
    )
    if ok then debugLog('registered keybind %s (%s)', item.id, item.key)
    else debugLog('rejected keybind registration: %s', reason) end
    return ok, reason
end

function HS.Registry.addAnnouncement(item, staticNewsItems)
    local ok, reason = register(
        HS.Registry.announcements,
        idSet(staticNewsItems),
        { 'id', 'title', 'date', 'description' },
        item
    )
    if ok then debugLog('added announcement %s', item.id)
    else debugLog('rejected announcement: %s', reason) end
    return ok, reason
end

function HS.Registry.setStat(key, label, value)
    if type(key) ~= 'string' or key == '' then
        return false, 'key must be a non-empty string'
    end
    if type(label) ~= 'string' or label == '' then
        return false, 'label must be a non-empty string'
    end
    if value == nil then
        return false, 'value is required'
    end
    HS.Registry.stats[key] = { key = key, label = label, value = value }
    debugLog('set stat %s = %s', key, tostring(value))
    return true, nil
end

--- `kind` is one of: 'command', 'keybind', 'announcement', 'stat'.
function HS.Registry.removeEntry(kind, id)
    if kind == 'command' then return remove(HS.Registry.commands, id) end
    if kind == 'keybind' then return remove(HS.Registry.keybinds, id) end
    if kind == 'announcement' then return remove(HS.Registry.announcements, id) end
    if kind == 'stat' then return remove(HS.Registry.stats, id) end
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
