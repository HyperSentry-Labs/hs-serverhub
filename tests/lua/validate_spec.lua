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

print('validate.isValidUrl')
do
    check('accepts https', HS.Validate.isValidUrl('https://example.com'))
    check('accepts http', HS.Validate.isValidUrl('http://example.com'))
    check('accepts a mixed-case scheme', HS.Validate.isValidUrl('HTTPS://example.com'))
    check('rejects javascript: URLs', HS.Validate.isValidUrl('javascript:alert(1)') == false)
    check('rejects data: URLs', HS.Validate.isValidUrl('data:text/html,x') == false)
    check('rejects a schemeless string', HS.Validate.isValidUrl('example.com') == false)
    check('rejects a blank string', HS.Validate.isValidUrl('') == false)
    check('rejects nil', HS.Validate.isValidUrl(nil) == false)
    check('rejects a non-string', HS.Validate.isValidUrl({}) == false)
end

print('validate.sanitizeRequiredUrl')
do
    local items = {
        { id = 'a', url = 'https://example.com' },
        { id = 'b', url = 'javascript:alert(1)' },
        { id = 'c', url = 'ftp://example.com' },
    }
    local out = HS.Validate.sanitizeRequiredUrl(items, 'url', 'test')
    check('keeps only the entry with a safe url', #out == 1 and out[1].id == 'a')
end

print('validate.sanitizeOptionalUrl')
do
    local items = {
        { id = 'a', url = 'https://example.com' },
        { id = 'b', url = 'javascript:alert(1)' },
        { id = 'c' }, -- no url at all
    }
    local out = HS.Validate.sanitizeOptionalUrl(items, 'url', 'test')
    check('keeps the item but clears the unsafe field', #out == 3 and out[2].url == nil)
    check('leaves a valid url untouched', out[1].url == 'https://example.com')
    check('leaves an absent field as nil, not an error', out[3].url == nil)
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

print('validate.normalizeSection with enumFields')
do
    local items, warnings = HS.Validate.normalizeSection({
        { id = 'a', title = 't', description = 'd', severity = 'critical' },
        { id = 'b', title = 't', description = 'd', severity = 'not-a-real-severity' },
        { id = 'c', title = 't', description = 'd' }, -- no severity at all
    }, { 'id', 'title', 'description' }, 'test', {
        severity = { allowed = { info = true, warning = true, critical = true }, default = 'info' },
    })

    check('keeps every entry (enum problems do not drop the item)', #items == 3)
    check('leaves a valid enum value untouched', items[1].severity == 'critical')
    check('coerces an invalid enum value to the default', items[2].severity == 'info')
    check('leaves an absent enum field alone rather than inventing one', items[3].severity == nil)
    check('warns about the coerced value only', #warnings == 1)
end

print('validate.normalizeCategories')
do
    local items, warnings = HS.Validate.normalizeCategories({
        { id = 'general', label = 'General' },
        { id = 'general', label = 'Duplicate' }, -- dup id
        { id = 'broken' }, -- missing label
    }, 'rules')
    check('keeps only the valid, unique category', #items == 1 and items[1].id == 'general')
    check('warns about both the duplicate and the incomplete entry', #warnings == 2)
end

print('validate.normalizeQuickLinks')
do
    local items, warnings = HS.Validate.normalizeQuickLinks({
        { id = 'ql-1', label = 'Rules', target = 'rules' }, -- implicit type = section
        { id = 'ql-2', label = 'Discord', type = 'url', url = 'https://discord.gg/example' },
        { id = 'ql-3', label = 'Bad url', type = 'url', url = 'javascript:alert(1)' },
        { id = 'ql-4', label = 'No target' }, -- section type with no target
    })
    check('keeps the valid section quick link', items[1] and items[1].id == 'ql-1' and items[1].type == 'section')
    check('keeps the valid url quick link', items[2] and items[2].id == 'ql-2' and items[2].type == 'url')
    check('drops an unsafe url quick link', #items == 2)
    check('warns about both dropped entries', #warnings == 2)
end

print('validate.normalizeCommunityGroups')
do
    local groups, warnings = HS.Validate.normalizeCommunityGroups({
        {
            id = 'store',
            label = 'Store',
            Links = {
                { id = 'tebex', label = 'Tebex', url = 'https://example.com' },
                { id = 'bad', label = 'Bad', url = 'javascript:alert(1)' },
            },
        },
        { id = 'broken' }, -- missing label
    })
    check('keeps the valid group', #groups == 1 and groups[1].id == 'store')
    check('keeps only the safe link inside the group', #groups[1].links == 1 and groups[1].links[1].id == 'tebex')
    check('warns about the unsafe link and the broken group', #warnings == 2)
end

print('validate.normalizeResourceState')
do
    check('buckets "started"', HS.Validate.normalizeResourceState('started') == 'started')
    check('buckets "starting"', HS.Validate.normalizeResourceState('starting') == 'starting')
    check('buckets "stopped"', HS.Validate.normalizeResourceState('stopped') == 'stopped')
    check('buckets "stopping" as stopped', HS.Validate.normalizeResourceState('stopping') == 'stopped')
    check('buckets an unrecognized value as unknown', HS.Validate.normalizeResourceState('something-new') == 'unknown')
    check('buckets nil as unknown', HS.Validate.normalizeResourceState(nil) == 'unknown')
end

print('validate.isValidColor / normalizeTheme')
do
    check('accepts #rrggbb', HS.Validate.isValidColor('#E3A857'))
    check('accepts #rgb', HS.Validate.isValidColor('#fa0'))
    check('accepts rgb()', HS.Validate.isValidColor('rgb(10, 20, 30)'))
    check('accepts hsla()', HS.Validate.isValidColor('hsla(200, 50%, 40%, 0.5)'))
    check('rejects a named color', HS.Validate.isValidColor('red') == false)
    check('rejects url()', HS.Validate.isValidColor('url(x)') == false)
    check('rejects injected declarations', HS.Validate.isValidColor('#fff; background: url(x)') == false)
    check('rejects a bad hex length', HS.Validate.isValidColor('#12345') == false)
    local theme, warnings = HS.Validate.normalizeTheme({ Border = '#222', Text = 'javascript', Bogus = '#fff' })
    check('keeps valid tokens only', theme.Border == '#222' and theme.Text == nil and theme.Bogus == nil)
    check('warns once per invalid recognized token', #warnings == 1)
    local empty = HS.Validate.normalizeTheme(nil)
    check('handles a missing theme table', next(empty) == nil)
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
    check('normalizes rule categories', #result.rules.categories == 1)
    check('normalizes commands', #result.commands.items == 1)
    check('normalizes keybinds', #result.keybinds.items == 1)
    check('normalizes getting-started steps', #result.gettingStarted.steps == 1)
    check('defaults getting-started progress to enabled', result.gettingStarted.enableProgress == true)
    check('normalizes news', #result.news.items == 1)
    check('normalizes community links', #result.community.links == 1)
    check('produces an empty community groups list when none configured', #result.community.groups == 0)
    check('produces a default overview block when none configured', result.overview.Enabled == true and #result.overview.QuickLinks == 0)
    check('produces no warnings for a fully valid config', #result.warnings == 0)
end

print('validate.normalizeConfig with unsafe/invalid optional data')
do
    local result = HS.Validate.normalizeConfig({
        News = {
            Items = {
                { id = 'n1', title = 'A', date = '2026-01-01', description = 'd', url = 'javascript:alert(1)' },
                { id = 'n2', title = 'B', date = '2026-01-02', description = 'd', priority = 'not-real' },
            },
        },
        GettingStarted = {
            EnableProgress = false,
            Steps = { { id = 's1', title = 'Step', description = 'd', linkUrl = 'javascript:alert(1)' } },
        },
        Overview = {
            QuickLinks = {
                { id = 'ql-1', label = 'Rules', target = 'rules' },
                { id = 'ql-2', label = 'Bad', type = 'url', url = 'not-a-url' },
            },
        },
    })

    check('drops an unsafe news url but keeps the item', #result.news.items == 2 and result.news.items[1].url == nil)
    check('coerces an invalid news priority to normal', result.news.items[2].priority == 'normal')
    check('respects an explicit EnableProgress = false', result.gettingStarted.enableProgress == false)
    check('drops an unsafe getting-started linkUrl but keeps the step', #result.gettingStarted.steps == 1 and result.gettingStarted.steps[1].linkUrl == nil)
    check('keeps only the safe quick link', #result.overview.QuickLinks == 1 and result.overview.QuickLinks[1].id == 'ql-1')
    check('collects a warning for every dropped/coerced piece', #result.warnings == 4)
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
