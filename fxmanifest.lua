fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'hs-serverhub'
author 'HyperSentry Labs'
description 'ServerHub - an in-game information and onboarding hub for FiveM servers.'
version '0.1.0'
repository 'https://github.com/HyperSentry-Labs/hs-serverhub'

-- Config is a shared script so both the client and the server read the
-- exact same values. Only server.lua trusts Config for anything sensitive;
-- the client copy is display-only.
shared_scripts {
    'config.lua',
    'lua/validate.lua',
}

client_scripts {
    'client.lua',
}

server_scripts {
    'lua/registry.lua',
    'server.lua',
}

-- The NUI is a normal Vite/React production build. `web/dist` is generated
-- by `npm run build` inside `web/` and is NOT hand-edited. See
-- docs/development.md for the full workflow.
ui_page 'web/dist/index.html'

files {
    'web/dist/index.html',
    'web/dist/assets/*.js',
    'web/dist/assets/*.css',
    'web/dist/**/*',
}
