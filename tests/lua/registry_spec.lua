--[[
    Run from the repository root with:
        lua tests/lua/registry_spec.lua
]]

local root = (arg and arg[0] or ''):match('(.*/)tests/lua/registry_spec%.lua$') or './'
dofile(root .. 'lua/validate.lua')
local HS = dofile(root .. 'lua/registry.lua')

local failures = 0
local passed = 0

local function check(name, condition)
    if condition then
        passed = passed + 1
        print(string.format('  ok - %s', name))
    else
        failures = failures + 1
        print(string.format('  FAIL - %s', name))
    end
end

print('registry.registerCommand')
do
    local staticCommands = { { id = 'cmd-report' } }

    local ok1 = HS.Registry.registerCommand({
        id = 'cmd-custom', command = '/custom', title = 'Custom', description = 'A custom command.', category = 'general',
    }, staticCommands)
    check('accepts a valid, unique command', ok1 == true)

    local ok2, reason2 = HS.Registry.registerCommand({
        id = 'cmd-report', command = '/report2', title = 'Dup', description = 'x', category = 'general',
    }, staticCommands)
    check('refuses to shadow a static config id', ok2 == false and reason2:find('already in use') ~= nil)

    local ok3, reason3 = HS.Registry.registerCommand({
        id = 'cmd-custom', command = '/again', title = 'Again', description = 'x', category = 'general',
    }, staticCommands)
    check('refuses a duplicate dynamic id', ok3 == false and reason3:find('already in use') ~= nil)

    local ok4, reason4 = HS.Registry.registerCommand({ id = 'cmd-broken' }, staticCommands)
    check('refuses an item missing required fields', ok4 == false and reason4:find('missing required field') ~= nil)
end

print('registry.registerKeybind')
do
    local ok = HS.Registry.registerKeybind({
        id = 'key-custom', key = 'Y', title = 'Custom action', description = 'Does a thing.', category = 'core',
    }, {})
    check('accepts a valid keybind', ok == true)
end

print('registry.addAnnouncement')
do
    local ok = HS.Registry.addAnnouncement({
        id = 'news-custom', title = 'Dynamic update', date = '2026-09-01', description = 'Posted at runtime.',
    }, {})
    check('accepts a valid announcement', ok == true)
end

print('registry.setStat')
do
    local ok1 = HS.Registry.setStat('queue', 'Queue length', 4)
    check('accepts a valid stat', ok1 == true)

    local ok2, reason2 = HS.Registry.setStat('', 'Bad key', 1)
    check('refuses a blank key', ok2 == false and reason2 ~= nil)

    local ok3 = HS.Registry.setStat('queue', 'Queue length', 7)
    check('allows overwriting an existing stat by key', ok3 == true)
end

print('registry.removeEntry')
do
    local ok1 = HS.Registry.removeEntry('command', 'cmd-custom')
    check('removes a previously registered command', ok1 == true)

    local ok2, reason2 = HS.Registry.removeEntry('command', 'cmd-custom')
    check('reports failure when removing a nonexistent id', ok2 == false and reason2 ~= nil)

    local ok3, reason3 = HS.Registry.removeEntry('not-a-real-kind', 'x')
    check('rejects an unknown kind', ok3 == false and reason3:find('unknown kind') ~= nil)
end

print('registry.snapshot')
do
    local snap = HS.Registry.snapshot()
    check('exposes keybinds registered earlier in this run', #snap.keybinds == 1)
    check('exposes announcements registered earlier in this run', #snap.announcements == 1)
    check('exposes stats registered earlier in this run', #snap.stats == 1)
end

print('registry ownership')
do
    local ok1 = HS.Registry.registerCommand({
        id = 'cmd-owned', command = '/owned', title = 'Owned', description = 'x', category = 'general',
    }, {}, 'resource-a')
    check('registers with an explicit owner', ok1 == true)

    local ok2, reason2 = HS.Registry.removeEntry('command', 'cmd-owned', 'resource-b')
    check('refuses removal by a different resource', ok2 == false and reason2:find('owned by a different resource') ~= nil)

    local ok3 = HS.Registry.removeEntry('command', 'cmd-owned', 'resource-a')
    check('allows removal by the original owner', ok3 == true)
end

print('registry.registerKeybind stamps a default `resource` from the owner')
do
    HS.Registry.registerKeybind({
        id = 'key-owned', key = 'H', title = 'Honk', description = 'x', category = 'core',
    }, {}, 'my-vehicles')
    local snap = HS.Registry.snapshot()
    local found
    for _, k in ipairs(snap.keybinds) do
        if k.id == 'key-owned' then found = k end
    end
    check('defaults the `resource` display field to the registering resource', found ~= nil and found.resource == 'my-vehicles')

    HS.Registry.registerKeybind({
        id = 'key-owned-explicit', key = 'J', title = 'Jump', description = 'x', category = 'core', resource = 'explicit-name',
    }, {}, 'my-vehicles')
    local found2
    for _, k in ipairs(HS.Registry.snapshot().keybinds) do
        if k.id == 'key-owned-explicit' then found2 = k end
    end
    check('never overrides an explicitly provided `resource`', found2 ~= nil and found2.resource == 'explicit-name')
end

print('registry.updateCommand')
do
    HS.Registry.registerCommand({
        id = 'cmd-update-me', command = '/old', title = 'Old title', description = 'x', category = 'general',
    }, {}, 'resource-a')

    local ok1, reason1 = HS.Registry.updateCommand({
        id = 'cmd-update-me', command = '/old', title = 'New title', description = 'x', category = 'general',
    }, 'resource-b')
    check('refuses an update from a different resource', ok1 == false and reason1:find('owned by a different resource') ~= nil)

    local ok2 = HS.Registry.updateCommand({
        id = 'cmd-update-me', command = '/old', title = 'New title', description = 'x', category = 'general',
    }, 'resource-a')
    check('allows an update from the original owner', ok2 == true)

    local snap = HS.Registry.snapshot()
    local found
    for _, c in ipairs(snap.commands) do
        if c.id == 'cmd-update-me' then found = c end
    end
    check('the update actually changed the stored data', found ~= nil and found.title == 'New title')

    local ok3, reason3 = HS.Registry.updateCommand({
        id = 'cmd-does-not-exist', command = '/x', title = 'x', description = 'x', category = 'general',
    }, 'resource-a')
    check('refuses to update an entry that was never registered', ok3 == false and reason3:find('no entry with id') ~= nil)
end

print('registry.updateKeybind and updateAnnouncement follow the same ownership rule')
do
    HS.Registry.registerKeybind({
        id = 'key-update-me', key = 'K', title = 'Old', description = 'x', category = 'core',
    }, {}, 'resource-a')
    local okBad = HS.Registry.updateKeybind({
        id = 'key-update-me', key = 'K', title = 'New', description = 'x', category = 'core',
    }, 'resource-b')
    check('refuses a keybind update from a different resource', okBad == false)
    local okGood = HS.Registry.updateKeybind({
        id = 'key-update-me', key = 'K', title = 'New', description = 'x', category = 'core',
    }, 'resource-a')
    check('allows a keybind update from the original owner', okGood == true)

    HS.Registry.addAnnouncement({
        id = 'news-update-me', title = 'Old', date = '2026-09-01', description = 'x',
    }, {}, 'resource-a')
    local okBad2 = HS.Registry.updateAnnouncement({
        id = 'news-update-me', title = 'New', date = '2026-09-01', description = 'x',
    }, 'resource-b')
    check('refuses an announcement update from a different resource', okBad2 == false)
    local okGood2 = HS.Registry.updateAnnouncement({
        id = 'news-update-me', title = 'New', date = '2026-09-01', description = 'x',
    }, 'resource-a')
    check('allows an announcement update from the original owner', okGood2 == true)
end

print('registry.setStat ownership')
do
    local ok1 = HS.Registry.setStat('queue-owned', 'Queue', 1, 'resource-a')
    check('sets a stat with an owner', ok1 == true)

    local ok2, reason2 = HS.Registry.setStat('queue-owned', 'Queue', 2, 'resource-b')
    check('refuses to overwrite a stat owned by a different resource', ok2 == false and reason2:find('owned by a different resource') ~= nil)

    local ok3 = HS.Registry.setStat('queue-owned', 'Queue', 3, 'resource-a')
    check('allows the original owner to keep updating its own stat', ok3 == true)
end

print(string.format('\n%d passed, %d failed', passed, failures))
if failures > 0 then
    os.exit(1)
end
