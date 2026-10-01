# GitHub Metadata

Copy/paste-ready information for the repository and the `v0.2.0` release.
Nothing in this file is a performance claim, a user count, or a download
count - none of that exists for this project.

---

### 1. Repository Name

```
hs-serverhub
```

### 2. Repository URL

```
https://github.com/HyperSentry-Labs/hs-serverhub
```

### 3. Short GitHub Description

```
ServerHub - a standalone, framework-agnostic in-game information and onboarding hub for FiveM servers. React + TypeScript NUI, Lua backend, browser-first dev workflow.
```

### 4. Long Description

```
ServerHub gives players one searchable, in-game panel for everything they
usually have to piece together from Discord and loading-screen images:
server rules, commands, keybinds, a guided getting-started flow with
optional progress tracking, news and changelog, community links, and live
player/status information. Players can pin any item for one-tap access.
It's fully standalone - no ESX, QBCore, Qbox, ox_core, or vRP required -
built with a React + TypeScript + Vite NUI and a Lua backend that never
crashes on bad configuration. A developer API lets other resources
register and update their own commands, keybinds, and announcements at
runtime, with per-registration ownership so resources can't interfere with
each other. The entire UI can be built and reviewed in a plain browser tab
before it ever touches FiveM.
```

### 5. GitHub Topics

```
fivem
fivem-resource
fivem-script
gta5
gtav
nui
lua
typescript
react
vite
roleplay
fivem-roleplay
server-tools
onboarding
standalone
```

### 6. Suggested README tagline

```
An in-game information and onboarding hub for FiveM servers.
```

### 7. Suggested GitHub About text

```
An in-game information and onboarding hub for FiveM servers. Standalone, framework-agnostic, and browser-first to develop.
```

### 8. License

```
MIT
```

### 9. Suggested release title for v0.2.0

```
ServerHub v0.2.0 — UX, API & Customization Update
```

### 10. Suggested release description (for `v0.2.0`)

```
UX, API & Customization update.

Highlights:
- Search v2: cross-section results including Community links, full
  keyboard navigation (Ctrl+K / "/", arrow keys, Enter, Escape), and
  click-to-navigate with a highlight on the matched item.
- Pinned items and optional Getting Started progress tracking - both
  local to the player's device, never server data.
- Developer API: new UpdateCommandInfo / UpdateKeybind /
  UpdateAnnouncement / UpdateStat exports, and every dynamic registration
  is now tied to the resource that created it, so resources can no longer
  edit or remove each other's entries.
- Richer, non-alarmist announcement priority/featured flags; optional
  grouped Community links; optional quick actions that open an external
  link directly from Overview; optional theme-token rebranding.
- A real validation gap from 0.1.0 closed: Overview quick links and every
  section's categories are now checked the same way everything else is,
  and every URL that can reach the UI is checked as http/https.

Every valid 0.1.0 config and export call continues to work unchanged -
see CHANGELOG.md for the full list of additions, improvements, and the
complete testing summary (93 Lua tests, 157 frontend tests).
```

### 11. Suggested social preview text

```
ServerHub - the in-game information hub your FiveM server is missing.
```

### 12. Primary keywords/search terms

```
fivem server info menu, fivem onboarding, fivem rules menu, fivem
keybinds menu, fivem nui react, fivem server hub, fivem information hub
```

### 13. Suggested GitHub repository subtitle

```
In-game information & onboarding hub for FiveM servers
```

### 14. Suggested installation one-liner

```
Copy hs-serverhub/ into resources/, add `ensure hs-serverhub` to server.cfg, restart.
```

### 15. Suggested feature list (for a release page or listing)

```
- Overview hub with live player/resource status, quick actions, and pinned items
- Searchable Rules, Commands, and Keybinds directories (search v2: keyboard nav, cross-section)
- Configurable Getting Started onboarding flow with optional local progress tracking
- News / changelog page with priority and featured announcements
- Community links page, flat or grouped
- Developer exports() API with per-resource ownership - register, update, and remove your own content
- Fully standalone - no framework required
- Browser-first development workflow with selectable demo-data fixtures
- English + Persian localization, RTL-ready
- Rebrandable: name, logo, accent colors, and optional full theme tokens are config-driven
```

### 16. Suggested "Why hs-serverhub?" text

```
Most servers scatter this information across Discord pins, loading-screen
images, and one-off chat commands. ServerHub puts it in a single,
searchable, in-game panel that works identically whether you run ESX,
QBCore, Qbox, ox_core, vRP, or nothing at all - and the whole UI can be
built and reviewed in a browser tab before it ever touches FiveM.
```

### 17. Suggested GitHub repository visibility

```
Public
```

### 18. Suggested package/repository naming

```
hs-serverhub
```

### 19. Suggested resource naming

```
hs-serverhub
```

### 20. Suggested default display name

```
ServerHub
```
