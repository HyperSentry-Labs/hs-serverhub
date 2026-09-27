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

print(string.format('\n%d passed, %d failed', passed, failures))
if failures > 0 then
    os.exit(1)
end
