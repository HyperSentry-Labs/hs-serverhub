--[[
    Standalone test suite for lua/validate.lua.

    Run from the repository root with:
        lua tests/lua/validate_spec.lua

    This does not require a FiveM runtime, `busted`, or any dependency -
    only a plain Lua 5.4 interpreter - because lua/validate.lua is written
    with zero FiveM natives specifically so it can be verified this way.
]]

local root = (arg and arg[0] or ''):match('(.*/)tests/lua/validate_spec%.lua$') or './'
local HS = dofile(root .. 'lua/validate.lua')

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

print('validate.dedupeById')
do
    local list = {
        { id = 'a', v = 1 },
        { id = 'b', v = 2 },
        { id = 'a', v = 3 }, -- duplicate, should be dropped
        { v = 4 },           -- missing id, should be dropped
        { id = '', v = 5 },  -- blank id, should be dropped
    }
    local out, warnings = HS.Validate.dedupeById(list)
    check('keeps first occurrence of each id', #out == 2 and out[1].id == 'a' and out[1].v == 1)
    check('drops duplicate ids', out[2].id == 'b')
    check('reports one warning per dropped entry', #warnings == 3)
end

print('validate.requireFields')
do
    local ok, missing = HS.Validate.requireFields({ id = 'x', title = 'Hello' }, { 'id', 'title' })
    check('passes when all required fields are present strings', ok == true and missing == nil)

    local ok2, missing2 = HS.Validate.requireFields({ id = 'x' }, { 'id', 'title' })
    check('fails and names the missing field', ok2 == false and missing2 == 'title')

    local ok3 = HS.Validate.requireFields({ id = 'x', title = '' }, { 'id', 'title' })
    check('treats an empty string as missing', ok3 == false)
end

print('validate.normalizeSection')
do
    local items, warnings = HS.Validate.normalizeSection({
        { id = 'r1', category = 'general', title = 'Rule one', description = 'Desc' },
        { id = 'r2', category = 'general', title = 'Rule two' }, -- missing description
        { id = 'r1', category = 'general', title = 'dup', description = 'Desc' }, -- dup id
    }, { 'id', 'category', 'title', 'description' }, 'rules')

    check('keeps only the fully valid, unique entry', #items == 1 and items[1].id == 'r1')
    check('collects warnings for both the incomplete and duplicate entries', #warnings == 2)
end

print('validate.normalizeConfig')
do
    local result = HS.Validate.normalizeConfig({
        Rules = {
            Categories = { { id = 'general', label = 'General' } },
            Items = {
                { id = 'g1', category = 'general', title = 'Be nice', description = 'Be nice to others.' },
            },
        },
        Commands = { Items = { { id = 'c1', command = '/help', title = 'Help', description = 'Shows help.', category = 'general' } } },
        Keybinds = { Items = { { id = 'k1', key = 'F1', title = 'Phone', description = 'Opens phone.', category = 'core' } } },
        GettingStarted = { Steps = { { id = 's1', title = 'Step one', description = 'Do the thing.' } } },
        News = { Items = { { id = 'n1', title = 'Launch', date = '2026-01-01', description = 'We launched.' } } },
        Community = { Links = { { id = 'l1', label = 'Discord', url = 'https://discord.gg/x' } } },
    })

    check('normalizes rules', #result.rules.items == 1)
    check('normalizes commands', #result.commands.items == 1)
    check('normalizes keybinds', #result.keybinds.items == 1)
    check('normalizes getting-started steps', #result.gettingStarted.steps == 1)
    check('normalizes news', #result.news.items == 1)
    check('normalizes community links', #result.community.links == 1)
    check('produces no warnings for a fully valid config', #result.warnings == 0)
end

print('validate.normalizeConfig never throws on malformed input')
do
    local ok = pcall(HS.Validate.normalizeConfig, nil)
    check('handles a nil config', ok)

    local ok2, result2 = pcall(HS.Validate.normalizeConfig, {
        Rules = { Items = 'not-a-table' },
        Commands = 'also-not-a-table',
    })
    check('handles malformed section shapes without erroring', ok2)
    check('falls back to empty lists for malformed sections', ok2 and #result2.rules.items == 0 and #result2.commands.items == 0)
end

print(string.format('\n%d passed, %d failed', passed, failures))
if failures > 0 then
    os.exit(1)
end
