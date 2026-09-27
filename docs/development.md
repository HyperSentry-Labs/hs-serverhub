# Development

## Browser mode vs. the FiveM build

ServerHub's NUI is one React app with two bridges (`web/src/bridge/fivem.ts`
and `web/src/bridge/mock.ts`) - see `web/src/bridge/index.ts`. Whichever one
loads is decided automatically by checking for `window.invokeNative`, which
only exists inside FiveM's CEF. Every page, component, and interaction is
built and reviewed in a normal browser tab first; the same compiled bundle
is what actually ships inside the resource.

The mock bridge plays back the same `open -> bootstrap -> statusUpdate`
message sequence a real session would, using demo data in
`web/src/mock/demoContent.ts` that intentionally mirrors `config.lua`'s
shipped defaults (the "Hyper Roleplay" demo server). If you change the
demo defaults in `config.lua`, consider updating that file too so the
browser demo keeps representing what a fresh install actually looks like.

## Prerequisites

- Node.js 18+ and npm
- A FiveM server, only if you want to test inside the game
- Lua 5.4, only if you want to run the standalone Lua tests locally
  (install with e.g. `apt install lua5.4` / `brew install lua`)

## Running the browser dev server

```bash
git clone https://github.com/HyperSentry-Labs/hs-serverhub.git
cd hs-serverhub
npm install         # installs web/'s dependencies via a postinstall hook
npm run dev         # -> http://localhost:5173
```

(Equivalently: `cd web && npm install && npm run dev`.)

Everything works without launching GTA V: navigation, search, category
filters, the Getting Started timeline, empty states, and the live status
card's gentle demo fluctuation.

## Building for production

```bash
npm run build
```

This runs `tsc -b` (type errors fail the build) followed by `vite build`,
producing `web/dist/`. `fxmanifest.lua` points `ui_page` and `files` at
that directory - **`web/dist` is what FiveM actually loads**, so it must
exist and be current before you `ensure` the resource. `web/dist` is not
committed to source control (see `.gitignore`); build it yourself, or use
the `web/dist/` already present in a tagged release ZIP.

Other useful scripts (runnable from the repo root or from `web/`):

```bash
npm run typecheck   # tsc -b --noEmit
npm run lint        # eslint .
npm run test        # vitest run
npm run preview     # serve the built dist/ locally, closer to production
npm run test:lua    # runs tests/lua/*.lua with a plain `lua` interpreter (root-level script)
```

## Installing into a FiveM server

1. Build the frontend (`npm run build`) so `web/dist/` exists, or use a
   release ZIP that already includes it.
2. Copy the whole `hs-serverhub/` folder into your server's `resources/`
   directory (a `[standalone]` category folder is fine but not required).
3. Add to `server.cfg`:
   ```
   ensure hs-serverhub
   ```
4. Start/restart the server.

## Reloading during FiveM development

- Lua changes: `restart hs-serverhub` in the server console.
- Frontend changes: run `npm run build` again, then `restart hs-serverhub`
  (FiveM's NUI does not hot-reload built assets; there is no watch-and-copy
  step here on purpose, to keep the build pipeline simple and explicit).

## Using NUI devtools

With the resource running, open FiveM's own debug tooling
(`F8` console -> `nui_devtools`, or your preferred CEF remote-debugging
setup) to inspect the ServerHub webview like any other Chromium page -
console logs, the network tab for the NUI callback `fetch` calls, React
devtools if installed in that Chromium profile.

## Debugging client Lua

Set `Config.General.Debug = true` and watch the client-side `F8` console.
`client.lua` intentionally has very little logic (open/close, NUI focus,
forwarding server events) - most debugging happens server-side.

## Testing NUI callbacks

`client.lua` registers two: `close` and `refresh`. From the CEF devtools
console (while ServerHub is open) you can call them directly:

```js
fetch(`https://${GetParentResourceName()}/refresh`, { method: 'POST', body: '{}' });
```

## Testing browser mode end-to-end

`npm run test` covers the logic that's easy to get subtly wrong outside a
real browser: cross-section search (`src/lib/search.test.ts`), defensive
content normalization (`src/lib/normalize.test.ts`), and the mock bridge's
message sequence and subscription handling (`src/bridge/mock.test.ts`).
For everything visual, run `npm run dev` and click through it - that *is*
the intended review workflow, not a fallback for when FiveM isn't handy.
