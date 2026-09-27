--[[
    hs-serverhub / lua/validate.lua
    ------------------------------------------------------------------------
    Pure data validation. This file touches NO FiveM natives on purpose:
    that is what lets tests/lua/validate_spec.lua run it with a plain
    `lua` interpreter, and it's why config mistakes can never crash the
    resource - the worst a bad config entry can do is get skipped with a
    warning.

    Loaded as a shared_script (see fxmanifest.lua) so both the client and
    server get the same `HS.Validate` table. It is also safe to load with
    plain `dofile()` outside of FiveM, which is how the test suite uses it.
]]

HS = HS or {}
HS.Validate = HS.Validate or {}

local function isStr(v)
    return type(v) == 'string' and #v > 0
end

local function isTable(v)
    return type(v) == 'table'
end

local function warn(fmt, ...)
    local ok, msg = pcall(string.format, fmt, ...)
    if not ok then msg = fmt end
    -- Outside of FiveM (standalone tests) there is no global Config, so we
    -- stay silent unless the caller opts in. Inside FiveM, only print when
    -- Config.General.Debug is true, per docs/configuration.md.
    if _G.Config and _G.Config.General and _G.Config.General.Debug then
        print('[hs-serverhub] ' .. msg)
    end
    return msg
end

HS.Validate.isStr = isStr
HS.Validate.isTable = isTable

--- Removes entries with a missing/blank `id`, and entries that reuse an
--- id already seen earlier in the list (first occurrence wins).
--- @return table deduped, table warnings
function HS.Validate.dedupeById(list)
    local seen = {}
    local out = {}
    local warnings = {}
    for _, item in ipairs(list or {}) do
        if not isTable(item) or not isStr(item.id) then
            table.insert(warnings, 'skipped an entry with a missing or invalid "id"')
        elseif seen[item.id] then
            table.insert(warnings, string.format('skipped duplicate id "%s"', item.id))
        else
            seen[item.id] = true
            table.insert(out, item)
        end
    end
    return out, warnings
end

--- @return boolean ok, string|nil missingField
function HS.Validate.requireFields(item, fields)
    for _, field in ipairs(fields) do
        if not isStr(item[field]) then
            return false, field
        end
    end
    return true, nil
end

--- Dedupes by id, drops entries missing any required string field, and
--- returns everything else untouched (optional fields pass through as-is).
--- @return table items, table warnings
function HS.Validate.normalizeSection(list, requiredFields, sectionName)
    local deduped, dupWarnings = HS.Validate.dedupeById(isTable(list) and list or {})
    local out = {}
    local warnings = {}

    for _, w in ipairs(dupWarnings) do
        table.insert(warnings, sectionName .. ': ' .. w)
    end

    for _, item in ipairs(deduped) do
        local ok, missing = HS.Validate.requireFields(item, requiredFields)
        if ok then
            table.insert(out, item)
        else
            table.insert(warnings, string.format(
                '%s: skipped "%s" (missing required field "%s")',
                sectionName, tostring(item.id or '?'), missing
            ))
        end
    end

    for _, w in ipairs(warnings) do
        warn('%s', w)
    end

    return out, warnings
end

--- Normalizes an entire Config table into the shape the NUI expects,
--- collecting every warning along the way instead of throwing. Never
--- errors, even when `cfg` is nil or malformed.
function HS.Validate.normalizeConfig(cfg)
    cfg = isTable(cfg) and cfg or {}
    local allWarnings = {}

    local function section(list, requiredFields, name)
        local items, warnings = HS.Validate.normalizeSection(list, requiredFields, name)
        for _, w in ipairs(warnings) do table.insert(allWarnings, w) end
        return items
    end

    local rules = isTable(cfg.Rules) and cfg.Rules or {}
    local commands = isTable(cfg.Commands) and cfg.Commands or {}
    local keybinds = isTable(cfg.Keybinds) and cfg.Keybinds or {}
    local gettingStarted = isTable(cfg.GettingStarted) and cfg.GettingStarted or {}
    local news = isTable(cfg.News) and cfg.News or {}
    local community = isTable(cfg.Community) and cfg.Community or {}

    return {
        rules = {
            categories = isTable(rules.Categories) and rules.Categories or {},
            items = section(rules.Items, { 'id', 'category', 'title', 'description' }, 'rules'),
        },
        commands = {
            categories = isTable(commands.Categories) and commands.Categories or {},
            items = section(commands.Items, { 'id', 'command', 'title', 'description', 'category' }, 'commands'),
        },
        keybinds = {
            categories = isTable(keybinds.Categories) and keybinds.Categories or {},
            items = section(keybinds.Items, { 'id', 'key', 'title', 'description', 'category' }, 'keybinds'),
        },
        gettingStarted = {
            steps = section(gettingStarted.Steps, { 'id', 'title', 'description' }, 'gettingStarted'),
        },
        news = {
            items = section(news.Items, { 'id', 'title', 'date', 'description' }, 'news'),
        },
        community = {
            links = section(community.Links, { 'id', 'label', 'url' }, 'community'),
        },
        warnings = allWarnings,
    }
end

return HS
