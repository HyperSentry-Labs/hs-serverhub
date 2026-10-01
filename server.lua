--[[
    hs-serverhub / server.lua
    ------------------------------------------------------------------------
    Responsibilities:
      1. Normalize Config once at start (lua/validate.lua) so the NUI never
         has to defend against malformed config data.
      2. Track which players currently have ServerHub open, and only push
         live status updates to THAT set, and only when something changed.
      3. Expose the exports() developer API, backed by lua/registry.lua.

    ServerHub never reads or exposes player identifiers, licenses, tokens,
    or any other sensitive/admin data - see SECURITY.md.
]]

HS = HS or {}
HS.State = {
    config = HS.Validate.normalizeConfig(Config),
    startedAt = os.time(),
    lastStatusJson = nil,
    activeViewers = {}, -- [source] = true
}

if #HS.State.config.warnings > 0 then
    print(string.format('[hs-serverhub] loaded with %d config warning(s):', #HS.State.config.warnings))
    for _, w in ipairs(HS.State.config.warnings) do
        print('  - ' .. w)
    end
end

-- `GetInvokingResource` is a real shared Cfx native (see
-- https://github.com/citizenfx/fivem/blob/master/ext/native-decls/GetInvokingResource.md)
-- that reports which resource's script called into the current one - the
-- standard way to identify the caller of an export from inside it. It only
-- exists inside FiveM, so this wrapper falls back to a stable sentinel for
-- the (Lua-only, no-FiveM) test suite and for any other unexpected context.
local function invokingResource()
    if type(GetInvokingResource) == 'function' then
        return GetInvokingResource() or 'unknown'
    end
    return 'unknown'
end

-- ----------------------------------------------------------------------
-- Content merging (static config + runtime exports() registrations)
-- ----------------------------------------------------------------------

local function mergeById(staticItems, dynamicItems)
    local merged = {}
    for _, item in ipairs(staticItems) do table.insert(merged, item) end
    for _, item in ipairs(dynamicItems) do table.insert(merged, item) end
    return merged
end

--- Builds the full content payload the NUI renders. Safe to call at any
--- time; never mutates HS.State.config.
local function buildContent()
    local dyn = HS.Registry.snapshot()

    local newsItems = mergeById(HS.State.config.news.items, dyn.announcements)
    table.sort(newsItems, function(a, b) return tostring(a.date) > tostring(b.date) end)

    return {
        general = Config.General,
        links = Config.Links,
        theme = HS.State.config.theme,
        overview = HS.State.config.overview,
        rules = HS.State.config.rules,
        commands = {
            categories = HS.State.config.commands.categories,
            items = mergeById(HS.State.config.commands.items, dyn.commands),
        },
        keybinds = {
            categories = HS.State.config.keybinds.categories,
            items = mergeById(HS.State.config.keybinds.items, dyn.keybinds),
        },
        gettingStarted = HS.State.config.gettingStarted,
        news = { items = newsItems },
        community = HS.State.config.community,
        stats = dyn.stats,
        status = { enabled = Config.Status.Enabled, showUptime = Config.Status.ShowUptime },
    }
end

-- ----------------------------------------------------------------------
-- Live status
-- ----------------------------------------------------------------------

local function buildStatusSnapshot()
    local online = #GetPlayers()
    local max = GetConvarInt('sv_maxclients', 48)

    local resources = {}
    for _, name in ipairs(Config.Status.MonitoredResources or {}) do
        table.insert(resources, {
            name = name,
            state = HS.Validate.normalizeResourceState(GetResourceState(name)),
        })
    end

    return {
        online = online,
        max = max,
        status = 'online',
        uptimeSeconds = Config.Status.ShowUptime and (os.time() - HS.State.startedAt) or nil,
        monitoredResources = resources,
    }
end

local function pushStatusToViewer(playerId)
    if not Config.Status.Enabled then return end
    TriggerClientEvent('hs-serverhub:client:statusUpdate', playerId, buildStatusSnapshot())
end

if Config.Status.Enabled then
    CreateThread(function()
        while true do
            Wait(Config.Status.RefreshIntervalMs)

            local hasViewers = false
            for _ in pairs(HS.State.activeViewers) do hasViewers = true break end
            if hasViewers then
                local snapshot = buildStatusSnapshot()
                local snapshotJson = json.encode(snapshot)
                if snapshotJson ~= HS.State.lastStatusJson then
                    HS.State.lastStatusJson = snapshotJson
                    for playerId in pairs(HS.State.activeViewers) do
                        TriggerClientEvent('hs-serverhub:client:statusUpdate', playerId, snapshot)
                    end
                end
            end
        end
    end)
end

-- ----------------------------------------------------------------------
-- Networking with clients
-- ----------------------------------------------------------------------

RegisterNetEvent('hs-serverhub:server:requestBootstrap')
AddEventHandler('hs-serverhub:server:requestBootstrap', function()
    local src = source
    TriggerClientEvent('hs-serverhub:client:bootstrap', src, buildContent())
    if Config.Status.Enabled then
        TriggerClientEvent('hs-serverhub:client:statusUpdate', src, buildStatusSnapshot())
    end
end)

RegisterNetEvent('hs-serverhub:server:viewerOpened')
AddEventHandler('hs-serverhub:server:viewerOpened', function()
    HS.State.activeViewers[source] = true
end)

RegisterNetEvent('hs-serverhub:server:viewerClosed')
AddEventHandler('hs-serverhub:server:viewerClosed', function()
    HS.State.activeViewers[source] = nil
end)

AddEventHandler('playerDropped', function()
    HS.State.activeViewers[source] = nil
end)

-- ----------------------------------------------------------------------
-- Chat command
-- ----------------------------------------------------------------------

RegisterCommand(Config.General.Command, function(source)
    if source == 0 then return end -- ignore console usage
    TriggerClientEvent('hs-serverhub:client:open', source)
end, false)

-- ----------------------------------------------------------------------
-- Developer API (see docs/api.md)
-- ----------------------------------------------------------------------

local function broadcastContentUpdate()
    local content = buildContent()
    for playerId in pairs(HS.State.activeViewers) do
        TriggerClientEvent('hs-serverhub:client:contentUpdate', playerId, content)
    end
end

exports('RegisterCommandInfo', function(item)
    local ok, reason = HS.Registry.registerCommand(item, HS.State.config.commands.items, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

exports('UpdateCommandInfo', function(item)
    local ok, reason = HS.Registry.updateCommand(item, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

exports('RegisterKeybind', function(item)
    local ok, reason = HS.Registry.registerKeybind(item, HS.State.config.keybinds.items, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

exports('UpdateKeybind', function(item)
    local ok, reason = HS.Registry.updateKeybind(item, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

exports('AddAnnouncement', function(item)
    local ok, reason = HS.Registry.addAnnouncement(item, HS.State.config.news.items, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

exports('UpdateAnnouncement', function(item)
    local ok, reason = HS.Registry.updateAnnouncement(item, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

exports('SetStat', function(key, label, value)
    local ok, reason = HS.Registry.setStat(key, label, value, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

-- Alias of SetStat: SetStat already upserts (see lua/registry.lua), so
-- UpdateStat is provided purely for a consistent Register*/Update* naming
-- convention across the API - both behave identically.
exports('UpdateStat', function(key, label, value)
    local ok, reason = HS.Registry.setStat(key, label, value, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

exports('RemoveEntry', function(kind, id)
    local ok, reason = HS.Registry.removeEntry(kind, id, invokingResource())
    if ok then broadcastContentUpdate() end
    return ok, reason
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    HS.State.activeViewers = {}
end)
