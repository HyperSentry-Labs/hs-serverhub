--[[
    hs-serverhub / config.lua
    ------------------------------------------------------------------------
    This is the ONLY file most server owners should ever need to edit.
    You do not need to touch anything in `web/` to rebrand or re-content
    ServerHub.

    Every section below is documented in docs/configuration.md with the
    same field names, defaults and examples used here.

    If you make a mistake (missing field, wrong type, duplicate id, unsafe
    URL), the resource will NOT crash. It will fall back to a safe default
    for that item, skip or repair the broken entry, and print a warning to
    the server console when Config.General.Debug is true.
]]

Config = {}

-- ============================================================================
-- GENERAL
-- ============================================================================
Config.General = {
    -- Shown in the header and browser tab title.
    ServerName = 'Hyper Roleplay',
    Subtitle = 'A community-first FiveM roleplay experience',
    Description = 'Hyper Roleplay is a semi-serious RP server focused on ' ..
        'long-term character stories, active jobs, and a friendly community.',

    -- Path is resolved relative to web/dist at runtime. Ships with a neutral
    -- placeholder mark; drop your own PNG/SVG in web/public/branding/ and
    -- point this at it (see docs/configuration.md#general).
    Logo = 'branding/logo.svg',

    -- Any valid CSS color (hex, rgb, hsl). Used for active nav items,
    -- primary buttons, focus rings and the online status dot.
    AccentColor = '#E3A857',
    -- Used for secondary emphasis (links, info badges).
    AccentColorSecondary = '#5FB3B3',

    -- Chat command that opens ServerHub. Include the leading slash.
    Command = 'serverhub',

    -- FiveM key-mapping default. Players can rebind this in
    -- Settings > Key Bindings > FiveM > "Open ServerHub" at any time;
    -- this is only the shipped default.
    DefaultKey = 'F10',

    -- BCP-47-ish locale tag. Must match a file in web/src/i18n/locales/.
    Language = 'en',

    -- When true: verbose bridge/config diagnostics in F8 console (client)
    -- and server console. Never prints secrets. Keep false in production.
    Debug = false,
}

-- ============================================================================
-- THEME (optional)
-- ============================================================================
-- Rebrand without touching any CSS. AccentColor / AccentColorSecondary above
-- stay the primary brand colors; these are optional fine-tuning tokens.
-- Every value must be a hex color (#rgb, #rrggbb, #rrggbbaa) or an
-- rgb()/rgba()/hsl()/hsla() color. An invalid value is ignored with a
-- console warning and the default is used - it can never break the UI.
Config.Theme = {
    -- AccentHover = '#F0BA70',
    -- Background = '#0F1216',
    -- Surface = '#14171D',
    -- SurfaceRaised = '#1B1F27',
    -- Border = '#262B34',
    -- Text = '#E8EAED',
    -- Muted = '#939BA6',
}

-- ============================================================================
-- LINKS (used by the header/footer "quick" links and Community page)
-- ============================================================================
Config.Links = {
    Discord = 'https://discord.gg/example',
    Website = 'https://example.com',
    Support = 'https://example.com/support',
}

-- ============================================================================
-- OVERVIEW PAGE
-- ============================================================================
Config.Overview = {
    Enabled = true,

    -- Live player count / status card. Requires Config.Status.Enabled.
    ShowLiveStats = true,

    -- Surface the newest Config.News item on the Overview hero - or, if any
    -- news item has `featured = true`, the newest featured one instead.
    ShowLatestAnnouncement = true,

    -- Shortcut tiles under the hero - these double as ServerHub's "quick
    -- actions". Each entry is one of two shapes:
    --   type = 'section' (default, and the only shape v0.1 supported):
    --     jumps to a built-in section. `target` must be one of: overview,
    --     rules, commands, keybinds, getting-started, news, community.
    --   type = 'url':
    --     opens an external link (Discord, website, ticket system, ...) in
    --     the player's browser instead of navigating inside ServerHub.
    --     Requires a `url` (http/https only - anything else is dropped).
    QuickLinks = {
        { id = 'ql-rules', label = 'Rules', target = 'rules', icon = 'shield' },
        { id = 'ql-commands', label = 'Commands', target = 'commands', icon = 'terminal' },
        { id = 'ql-keybinds', label = 'Keybinds', target = 'keybinds', icon = 'keyboard' },
        { id = 'ql-start', label = 'Getting Started', target = 'getting-started', icon = 'compass' },
        {
            id = 'ql-discord', label = 'Join Discord', icon = 'discord',
            type = 'url', url = 'https://discord.gg/example',
        },
    },
}

-- ============================================================================
-- LIVE STATUS
-- ============================================================================
Config.Status = {
    Enabled = true,

    -- How often the server recalculates its own snapshot (player count,
    -- monitored resources). This is NOT how often it is pushed to clients;
    -- clients only ever receive an update when a value actually changed,
    -- and only while they have ServerHub open.
    RefreshIntervalMs = 15000,

    ShowUptime = true,

    -- Optional health snapshot. Leave the table empty to hide this card
    -- entirely. Only resources you list here are ever queried, with
    -- GetResourceState() bucketed into 'started' | 'starting' | 'stopped' |
    -- 'unknown' so an unexpected value never breaks the display.
    MonitoredResources = {
        -- 'ox_lib',
        -- 'my-police',
        -- 'my-ems',
    },
}

-- ============================================================================
-- RULES
-- ============================================================================
Config.Rules = {
    Categories = {
        { id = 'general', label = 'General', icon = 'book' },
        { id = 'roleplay', label = 'Roleplay', icon = 'drama' },
        { id = 'combat', label = 'Combat', icon = 'crosshair' },
        { id = 'police', label = 'Police', icon = 'badge' },
        { id = 'ems', label = 'EMS', icon = 'cross' },
        { id = 'vehicles', label = 'Vehicles', icon = 'car' },
    },

    -- severity: 'info' | 'warning' | 'critical' (optional, defaults to
    -- 'info'; an unrecognized value also falls back to 'info' with a
    -- console warning rather than being dropped).
    Items = {
        {
            id = 'general-1',
            category = 'general',
            title = 'Respect every player',
            description = 'Harassment, hate speech, and targeted discrimination ' ..
                'result in an immediate ban. Disagreements happen in character, ' ..
                'not out of it.',
            severity = 'critical',
        },
        {
            id = 'general-2',
            category = 'general',
            title = 'One account per person',
            description = 'Alternate accounts used to bypass a ban or rejoin a ' ..
                'whitelist queue are treated as ban evasion.',
            severity = 'warning',
        },
        {
            id = 'roleplay-1',
            category = 'roleplay',
            title = 'Stay in character in RP channels',
            description = 'Use /ooc for out-of-character remarks. Breaking ' ..
                'immersion mid-scene ruins it for everyone involved.',
            severity = 'info',
        },
        {
            id = 'roleplay-2',
            category = 'roleplay',
            title = 'No fail RP',
            description = 'Your character must react to their situation the way ' ..
                'a real person would - that includes fear, injury, and consequences.',
            severity = 'warning',
        },
        {
            id = 'combat-1',
            category = 'combat',
            title = 'No random deathmatch',
            description = 'Combat must be preceded by roleplay and a clear ' ..
                'in-character reason. Drive-by executions with no build-up are not allowed.',
            severity = 'critical',
        },
        {
            id = 'police-1',
            category = 'police',
            title = 'Follow the use-of-force ladder',
            description = 'De-escalate before lethal force unless the scene ' ..
                'clearly justifies skipping a step.',
            severity = 'warning',
        },
        {
            id = 'ems-1',
            category = 'ems',
            title = 'EMS RP is not a taxi service',
            description = 'Treat every call as a real medical scene, not a ' ..
                'fast-travel option.',
            severity = 'info',
        },
        {
            id = 'vehicles-1',
            category = 'vehicles',
            title = 'No unrealistic driving',
            description = 'Reckless, physics-breaking driving without RP ' ..
                'justification will be treated as vehicle-deathmatch.',
            severity = 'warning',
        },
    },
}

-- ============================================================================
-- COMMANDS
-- ============================================================================
Config.Commands = {
    Categories = {
        { id = 'general', label = 'General' },
        { id = 'roleplay', label = 'Roleplay' },
        { id = 'emergency', label = 'Emergency' },
    },

    -- `permission` is a display-only label (e.g. "Everyone", "Staff").
    -- It is NOT an access control system - ServerHub never grants or
    -- checks permissions, it only documents them for players.
    -- `usage` is an optional one-line example shown as a code block, e.g.
    -- "/report [message]" - only set it when the command actually takes
    -- arguments; never invent server-specific syntax automatically.
    Items = {
        {
            id = 'cmd-report',
            command = '/report',
            title = 'Report a player or issue',
            description = 'Opens a report ticket for staff. Include as much ' ..
                'detail as you can.',
            category = 'general',
            permission = 'Everyone',
            usage = '/report [message]',
        },
        {
            id = 'cmd-911',
            command = '/911',
            title = 'Contact emergency services',
            description = 'Alerts on-duty Police and EMS to your location.',
            category = 'emergency',
            permission = 'Everyone',
            aliases = { '/112' },
        },
        {
            id = 'cmd-me',
            command = '/me',
            title = 'Describe an action',
            description = 'Shows a third-person action to nearby players, e.g. ' ..
                '"/me lights a cigarette".',
            category = 'roleplay',
            permission = 'Everyone',
            usage = '/me [action]',
        },
        {
            id = 'cmd-do',
            command = '/do',
            title = 'Describe your surroundings or an outcome',
            description = 'Used to narrate scene details that /me cannot express.',
            category = 'roleplay',
            permission = 'Everyone',
        },
        {
            id = 'cmd-discord',
            command = '/discord',
            title = 'Get the Discord invite',
            description = 'Prints the community Discord link in chat.',
            category = 'general',
            permission = 'Everyone',
        },
    },
}

-- ============================================================================
-- KEYBINDS
-- ============================================================================
Config.Keybinds = {
    Categories = {
        { id = 'core', label = 'Core' },
        { id = 'roleplay', label = 'Roleplay' },
        { id = 'emergency', label = 'Emergency' },
    },

    -- This is a directory only - ServerHub does not bind these keys itself.
    -- Register the real key mappings from the resource that owns each
    -- feature. See docs/api.md if you want that resource to appear here
    -- automatically via exports instead of editing this file - a
    -- dynamically-registered keybind is stamped with the registering
    -- resource's name in `resource` automatically if you don't set one.
    -- `context` is an optional short note (e.g. "Hold", "Duty only").
    Items = {
        { id = 'key-phone', key = 'F1', title = 'Phone', description = 'Open your phone.', category = 'core' },
        { id = 'key-inventory', key = 'F2', title = 'Inventory', description = 'Open your inventory.', category = 'core' },
        { id = 'key-radio', key = 'F3', title = 'Radio', description = 'Open your radio.', category = 'core' },
        {
            id = 'key-police-menu', key = 'F6', title = 'Police Menu',
            description = 'Duty-only police tools.', category = 'emergency',
            resource = 'my-police', context = 'Duty only',
        },
        { id = 'key-interact', key = 'G', title = 'Vehicle interaction', description = 'Lock, engine, and trunk controls.', category = 'core' },
        { id = 'key-hands-up', key = 'X', title = 'Hands up', description = 'Raise your hands during roleplay.', category = 'roleplay', context = 'Hold' },
    },
}

-- ============================================================================
-- GETTING STARTED
-- ============================================================================
Config.GettingStarted = {
    -- Per-player step completion is tracked client-side only (the browser/
    -- CEF's own storage) - ServerHub has no player database, so this is a
    -- personal convenience, never a server-authoritative record. Set to
    -- false to show a plain numbered list with no checkboxes/progress bar.
    EnableProgress = true,

    Steps = {
        {
            id = 'step-character',
            title = 'Create your character',
            description = 'Build your character and pick your starting appearance.',
            icon = 'user-plus',
            estimatedMinutes = 3,
        },
        {
            id = 'step-id',
            title = 'Learn your identity system',
            description = 'Your character ID and phone number are how other ' ..
                'players and jobs will reach you.',
            icon = 'id-card',
        },
        {
            id = 'step-rules',
            title = 'Read the server rules',
            description = 'A five-minute read that saves you from an avoidable ban.',
            icon = 'shield',
            linkLabel = 'Open Rules',
            linkTarget = 'rules',
            estimatedMinutes = 5,
        },
        {
            id = 'step-job',
            title = 'Find your first job',
            description = 'Jobs are how you earn money and meet other characters.',
            icon = 'briefcase',
        },
        {
            id = 'step-keybinds',
            title = 'Learn your keybinds',
            description = 'Phone, inventory, and radio all have dedicated keys.',
            icon = 'keyboard',
            linkLabel = 'Open Keybinds',
            linkTarget = 'keybinds',
            estimatedMinutes = 2,
        },
        {
            id = 'step-discord',
            title = 'Join the community Discord',
            description = 'Announcements, support, and the rest of the community live here.',
            icon = 'message-circle',
            linkLabel = 'Join Discord',
            -- linkUrl is filled in just below, once Config.Links exists.
        },
    },
}
-- Getting-started steps can only reference Config.Links after it is defined
-- above; wire the Discord step's external link here rather than duplicating
-- the URL.
Config.GettingStarted.Steps[6].linkUrl = Config.Links.Discord

-- ============================================================================
-- NEWS / CHANGELOG
-- ============================================================================
Config.News = {
    -- priority: 'normal' | 'important' | 'critical' (optional, defaults to
    -- 'normal'). Shown as a small, non-alarmist label - not a flashing
    -- banner. `featured = true` lets an item win the Overview "latest
    -- announcement" slot over a newer-but-unfeatured one.
    Items = {
        {
            id = 'news-launch',
            title = 'Hyper Roleplay has launched',
            date = '2026-08-01',
            category = 'Announcement',
            description = 'Whitelist is open and the city is live. Welcome aboard.',
            icon = 'announcement',
        },
        {
            id = 'news-police',
            title = 'Police department update',
            date = '2026-08-14',
            version = 'v1.2.0',
            category = 'Update',
            description = 'New MDT workflow and two additional patrol vehicles.',
        },
        {
            id = 'news-economy',
            title = 'Economy adjustments',
            date = '2026-08-22',
            version = 'v1.3.0',
            category = 'Update',
            description = 'Rebalanced job payouts and reduced high-end item prices.',
        },
        {
            id = 'news-maintenance',
            title = 'Scheduled maintenance this weekend',
            date = '2026-09-05',
            category = 'Maintenance',
            description = 'The server will be offline for about 30 minutes for a database upgrade.',
            priority = 'important',
            featured = true,
        },
    },
}

-- ============================================================================
-- COMMUNITY
-- ============================================================================
Config.Community = {
    -- Flat list - always available, and the only shape v0.1 supported.
    -- Rendered as-is when Groups (below) is empty.
    Links = {
        { id = 'com-discord', label = 'Discord', url = Config.Links.Discord, icon = 'discord', description = 'Chat with staff and the community.' },
        { id = 'com-website', label = 'Website', url = Config.Links.Website, icon = 'globe', description = 'Server news and whitelist application.' },
        { id = 'com-support', label = 'Support', url = Config.Links.Support, icon = 'life-buoy', description = 'Open a support ticket.' },
    },

    -- Optional grouped layout ("Community" / "Support" / "Store", etc.).
    -- When non-empty, the Community page renders these groups instead of
    -- the flat list above. Leave this empty (the default) to keep the
    -- simple flat layout - most servers don't need groups.
    Groups = {
        -- {
        --     id = 'support',
        --     label = 'Support',
        --     Links = {
        --         { id = 'grp-tickets', label = 'Ticket System', url = 'https://example.com/support', icon = 'life-buoy' },
        --         { id = 'grp-docs', label = 'Documentation', url = 'https://example.com/docs', icon = 'book' },
        --     },
        -- },
    },
}
