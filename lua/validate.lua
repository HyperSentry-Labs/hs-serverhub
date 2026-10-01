--[[
    hs-serverhub / lua/validate.lua
    ------------------------------------------------------------------------
    Pure data validation. This file touches NO FiveM natives on purpose:
    that is what lets tests/lua/validate_spec.lua run it with a plain
    `lua` interpreter, and it's why config mistakes can never crash the
    resource - the worst a bad config entry can do is get skipped (or, for
    a single optional field, quietly dropped) with a warning.

    Loaded as a shared_script (see fxmanifest.lua) so both the client and
    server get the same `HS.Validate` table. It is also safe to load with
    plain `dofile()` outside of FiveM, which is how the test suite uses it.

    v0.2.0 adds (all additive, all backward compatible with v0.1 callers):
      - isValidUrl / sanitizeRequiredUrl / sanitizeOptionalUrl: refuse
        `javascript:`/`data:`/schemeless links anywhere a URL reaches the
        NUI (community links, news "read more", getting-started external
        steps, quick actions).
      - normalizeSection gained an optional 4th `enumFields` argument that
        coerces an out-of-range enum (severity, priority) to a safe default
        with a warning instead of dropping the whole entry - existing
        3-argument callers are unaffected.
      - normalizeCategories / normalizeQuickLinks / normalizeCommunityGroups:
        v0.1 passed `Categories` and `Config.Overview.QuickLinks` straight
        through with no validation at all, which meant a malformed entry
        could produce a broken button in the NUI. That gap is closed here.
      - normalizeResourceState: buckets whatever GetResourceState() returns
        into 'started' | 'starting' | 'stopped' | 'unknown' so the UI never
        has to guess about an undocumented value.
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

--- Only http/https links are ever allowed to reach an <a href> or window
--- navigation in the NUI - this is what keeps a `javascript:`/`data:` URL
--- typed into config.lua (or handed to an export by another resource) from
--- ever becoming a live link. Schemeless strings ("example.com") are also
--- rejected rather than guessed at, so authors get a clear warning instead
--- of a silently-broken link.
--- @return boolean
function HS.Validate.isValidUrl(value)
    if not isStr(value) then return false end
    local scheme = value:match('^(%a[%w+.-]*):')
    if not scheme then return false end
    scheme = scheme:lower()
    return scheme == 'http' or scheme == 'https'
end

--- Drops any item whose REQUIRED url field isn't a safe http/https URL -
--- used for community links, where a link with no usable url is useless.
--- @return table filtered, table warnings
function HS.Validate.sanitizeRequiredUrl(items, field, sectionName)
    local out = {}
    local warnings = {}
    for _, item in ipairs(items or {}) do
        if HS.Validate.isValidUrl(item[field]) then
            table.insert(out, item)
        else
            table.insert(warnings, string.format(
                '%s: skipped "%s" (field "%s" must be a valid http/https URL)',
                sectionName, tostring(item.id or '?'), field
            ))
        end
    end
    for _, w in ipairs(warnings) do warn('%s', w) end
    return out, warnings
end

--- Clears (rather than drops the item for) an OPTIONAL url field that
--- isn't safe - used for news `url` and getting-started `linkUrl`, where
--- the rest of the entry is still perfectly useful without it.
--- @return table items (same list, mutated in place, also returned), table warnings
function HS.Validate.sanitizeOptionalUrl(items, field, sectionName)
    local warnings = {}
    for _, item in ipairs(items or {}) do
        local v = item[field]
        if v ~= nil and not HS.Validate.isValidUrl(v) then
            item[field] = nil
            table.insert(warnings, string.format(
                '%s: dropped invalid "%s" on "%s" (must be a valid http/https URL)',
                sectionName, field, tostring(item.id or '?')
            ))
        end
    end
    for _, w in ipairs(warnings) do warn('%s', w) end
    return items, warnings
end

--- Dedupes by id, drops entries missing any required string field, and
--- returns everything else untouched (optional fields pass through as-is).
---
--- `enumFields` is optional: { fieldName = { allowed = { value = true, ... },
--- default = 'value' } }. When present, an item whose field is set but not
--- in `allowed` has it replaced with `default` (with a warning) instead of
--- the whole item being dropped - appropriate for a cosmetic field like
--- `severity`/`priority`, where losing the whole rule/announcement over one
--- typo would be worse than just falling back to the default look.
--- @return table items, table warnings
function HS.Validate.normalizeSection(list, requiredFields, sectionName, enumFields)
    local deduped, dupWarnings = HS.Validate.dedupeById(isTable(list) and list or {})
    local out = {}
    local warnings = {}

    for _, w in ipairs(dupWarnings) do
        table.insert(warnings, sectionName .. ': ' .. w)
    end

    for _, item in ipairs(deduped) do
        local ok, missing = HS.Validate.requireFields(item, requiredFields)
        if ok then
            if enumFields then
                for field, spec in pairs(enumFields) do
                    local v = item[field]
                    if v ~= nil and not spec.allowed[v] then
                        table.insert(warnings, string.format(
                            '%s: "%s" has an invalid "%s" ("%s") - using default "%s"',
                            sectionName, tostring(item.id), field, tostring(v), tostring(spec.default)
                        ))
                        item[field] = spec.default
                    end
                end
            end
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

--- Same shape of validation as an Items list, but for a Categories array
--- (`{ id, label, icon? }`). v0.1 passed Categories straight through with
--- no validation at all; a malformed category entry could reach the NUI
--- and render as a broken filter pill.
--- @return table items, table warnings
function HS.Validate.normalizeCategories(list, sectionName)
    local deduped, dupWarnings = HS.Validate.dedupeById(isTable(list) and list or {})
    local out = {}
    local warnings = {}

    for _, w in ipairs(dupWarnings) do
        table.insert(warnings, sectionName .. '.categories: ' .. w)
    end

    for _, item in ipairs(deduped) do
        local ok, missing = HS.Validate.requireFields(item, { 'id', 'label' })
        if ok then
            table.insert(out, item)
        else
            table.insert(warnings, string.format(
                '%s.categories: skipped "%s" (missing required field "%s")',
                sectionName, tostring(item.id or '?'), missing
            ))
        end
    end

    for _, w in ipairs(warnings) do
        warn('%s', w)
    end

    return out, warnings
end

--- Normalizes Config.Overview.QuickLinks (now doubling as "quick actions" -
--- see docs/configuration.md#configoverview). Each entry is either:
---   type = 'section' (default): requires a built-in-section `target`
---   type = 'url': requires a safe http/https `url`, opened externally
--- An entry that matches neither shape is skipped with a warning rather
--- than reaching the NUI and doing nothing when clicked.
--- @return table items, table warnings
function HS.Validate.normalizeQuickLinks(list, sectionName)
    sectionName = sectionName or 'overview.quickLinks'
    local deduped, dupWarnings = HS.Validate.dedupeById(isTable(list) and list or {})
    local out = {}
    local warnings = {}

    for _, w in ipairs(dupWarnings) do
        table.insert(warnings, sectionName .. ': ' .. w)
    end

    for _, item in ipairs(deduped) do
        local ok, missing = HS.Validate.requireFields(item, { 'id', 'label' })
        if not ok then
            table.insert(warnings, string.format(
                '%s: skipped "%s" (missing required field "%s")',
                sectionName, tostring(item.id or '?'), missing
            ))
        elseif item.type == 'url' then
            if HS.Validate.isValidUrl(item.url) then
                table.insert(out, item)
            else
                table.insert(warnings, string.format(
                    '%s: skipped "%s" (type "url" requires a valid http/https "url")',
                    sectionName, item.id
                ))
            end
        else
            item.type = 'section'
            if isStr(item.target) then
                table.insert(out, item)
            else
                table.insert(warnings, string.format(
                    '%s: skipped "%s" (missing required field "target")',
                    sectionName, item.id
                ))
            end
        end
    end

    for _, w in ipairs(warnings) do
        warn('%s', w)
    end

    return out, warnings
end

--- Normalizes Config.Community.Groups: `{ { id, label, Links = { ... } } }`.
--- Optional and additive - a server with only the flat `Config.Community.
--- Links` (v0.1 shape) gets an empty `groups` list and the NUI falls back
--- to the flat list, per docs/configuration.md#configcommunity.
--- @return table groups, table warnings
function HS.Validate.normalizeCommunityGroups(list)
    local deduped, dupWarnings = HS.Validate.dedupeById(isTable(list) and list or {})
    local out = {}
    local warnings = {}

    for _, w in ipairs(dupWarnings) do
        table.insert(warnings, 'community.groups: ' .. w)
    end

    for _, group in ipairs(deduped) do
        local ok, missing = HS.Validate.requireFields(group, { 'id', 'label' })
        if not ok then
            table.insert(warnings, string.format(
                'community.groups: skipped "%s" (missing required field "%s")',
                tostring(group.id or '?'), missing
            ))
        else
            local links, linkWarnings = HS.Validate.normalizeSection(
                group.Links, { 'id', 'label', 'url' }, 'community.groups.' .. group.id
            )
            for _, w in ipairs(linkWarnings) do table.insert(warnings, w) end
            local urlWarnings
            links, urlWarnings = HS.Validate.sanitizeRequiredUrl(links, 'url', 'community.groups.' .. group.id)
            for _, w in ipairs(urlWarnings) do table.insert(warnings, w) end
            table.insert(out, { id = group.id, label = group.label, links = links })
        end
    end

    return out, warnings
end

--- Accepts hex (#rgb, #rgba, #rrggbb, #rrggbbaa) and rgb()/rgba()/hsl()/
--- hsla() with only numeric characters inside. Anything else (named
--- colors, var(), url(), expression(), stray characters) is refused so a
--- typo in config.lua can never inject arbitrary CSS through a theme token.
--- @return boolean
function HS.Validate.isValidColor(value)
    if not isStr(value) or #value > 64 then return false end
    local hex = value:match('^#(%x+)$')
    if hex then
        local n = #hex
        return n == 3 or n == 4 or n == 6 or n == 8
    end
    local fn, args = value:match('^(%a+)%(([^()]*)%)$')
    if fn then
        fn = fn:lower()
        if fn == 'rgb' or fn == 'rgba' or fn == 'hsl' or fn == 'hsla' then
            return args:match('^[%d%s,%.%%/deg]*$') ~= nil and args:match('%d') ~= nil
        end
    end
    return false
end

local THEME_KEYS = { 'AccentHover', 'Background', 'Surface', 'SurfaceRaised', 'Border', 'Text', 'Muted' }

--- Keeps only recognized theme tokens holding a valid color; everything
--- else is dropped with a warning and the built-in default applies.
--- @return table theme, table warnings
function HS.Validate.normalizeTheme(theme)
    local out, warnings = {}, {}
    if not isTable(theme) then return out, warnings end
    for _, key in ipairs(THEME_KEYS) do
        local v = theme[key]
        if v ~= nil then
            if HS.Validate.isValidColor(v) then
                out[key] = v
            else
                table.insert(warnings, string.format('theme: ignored invalid color for "%s"', key))
            end
        end
    end
    for _, w in ipairs(warnings) do warn('%s', w) end
    return out, warnings
end

-- Every value FXServer is documented (or known in practice) to report for
-- a resource, bucketed into the four states the NUI actually distinguishes.
-- Anything not listed here (a future/undocumented value) safely falls into
-- 'unknown' rather than being guessed at or crashing a string comparison.
local RESOURCE_STATE_BUCKETS = {
    started = 'started',
    running = 'started',
    starting = 'starting',
    stopping = 'stopped',
    stopped = 'stopped',
    uninitialized = 'stopped',
    missing = 'stopped',
}

--- @return "'started'"|"'starting'"|"'stopped'"|"'unknown'"
function HS.Validate.normalizeResourceState(raw)
    if type(raw) ~= 'string' then return 'unknown' end
    return RESOURCE_STATE_BUCKETS[raw] or 'unknown'
end

--- Normalizes an entire Config table into the shape the NUI expects,
--- collecting every warning along the way instead of throwing. Never
--- errors, even when `cfg` is nil or malformed.
function HS.Validate.normalizeConfig(cfg)
    cfg = isTable(cfg) and cfg or {}
    local allWarnings = {}

    local function section(list, requiredFields, name, enumFields)
        local items, warnings = HS.Validate.normalizeSection(list, requiredFields, name, enumFields)
        for _, w in ipairs(warnings) do table.insert(allWarnings, w) end
        return items
    end

    local function categories(list, name)
        local items, warnings = HS.Validate.normalizeCategories(list, name)
        for _, w in ipairs(warnings) do table.insert(allWarnings, w) end
        return items
    end

    local rules = isTable(cfg.Rules) and cfg.Rules or {}
    local commands = isTable(cfg.Commands) and cfg.Commands or {}
    local keybinds = isTable(cfg.Keybinds) and cfg.Keybinds or {}
    local gettingStarted = isTable(cfg.GettingStarted) and cfg.GettingStarted or {}
    local news = isTable(cfg.News) and cfg.News or {}
    local community = isTable(cfg.Community) and cfg.Community or {}
    local overview = isTable(cfg.Overview) and cfg.Overview or {}

    local ruleItems = section(rules.Items, { 'id', 'category', 'title', 'description' }, 'rules', {
        severity = { allowed = { info = true, warning = true, critical = true }, default = 'info' },
    })

    local stepItems = section(gettingStarted.Steps, { 'id', 'title', 'description' }, 'gettingStarted')
    local stepUrlWarnings
    stepItems, stepUrlWarnings = HS.Validate.sanitizeOptionalUrl(stepItems, 'linkUrl', 'gettingStarted')
    for _, w in ipairs(stepUrlWarnings) do table.insert(allWarnings, w) end

    local newsItems = section(news.Items, { 'id', 'title', 'date', 'description' }, 'news', {
        priority = { allowed = { normal = true, important = true, critical = true }, default = 'normal' },
    })
    local newsUrlWarnings
    newsItems, newsUrlWarnings = HS.Validate.sanitizeOptionalUrl(newsItems, 'url', 'news')
    for _, w in ipairs(newsUrlWarnings) do table.insert(allWarnings, w) end

    local communityLinks = section(community.Links, { 'id', 'label', 'url' }, 'community')
    local communityUrlWarnings
    communityLinks, communityUrlWarnings = HS.Validate.sanitizeRequiredUrl(communityLinks, 'url', 'community')
    for _, w in ipairs(communityUrlWarnings) do table.insert(allWarnings, w) end

    local communityGroups, groupWarnings = HS.Validate.normalizeCommunityGroups(community.Groups)
    for _, w in ipairs(groupWarnings) do table.insert(allWarnings, w) end

    local theme, themeWarnings = HS.Validate.normalizeTheme(cfg.Theme)
    for _, w in ipairs(themeWarnings) do table.insert(allWarnings, w) end

    local quickLinks, quickLinkWarnings = HS.Validate.normalizeQuickLinks(overview.QuickLinks)
    for _, w in ipairs(quickLinkWarnings) do table.insert(allWarnings, w) end

    return {
        rules = {
            categories = categories(rules.Categories, 'rules'),
            items = ruleItems,
        },
        commands = {
            categories = categories(commands.Categories, 'commands'),
            items = section(commands.Items, { 'id', 'command', 'title', 'description', 'category' }, 'commands'),
        },
        keybinds = {
            categories = categories(keybinds.Categories, 'keybinds'),
            items = section(keybinds.Items, { 'id', 'key', 'title', 'description', 'category' }, 'keybinds'),
        },
        gettingStarted = {
            steps = stepItems,
            enableProgress = gettingStarted.EnableProgress ~= false,
        },
        news = {
            items = newsItems,
        },
        community = {
            links = communityLinks,
            groups = communityGroups,
        },
        theme = theme,
        overview = {
            Enabled = overview.Enabled ~= false,
            ShowLiveStats = overview.ShowLiveStats ~= false,
            ShowLatestAnnouncement = overview.ShowLatestAnnouncement ~= false,
            QuickLinks = quickLinks,
        },
        warnings = allWarnings,
    }
end

return HS
