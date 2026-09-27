# Security Policy

## Scope and design intent

ServerHub is an **information and onboarding UI**, not an admin panel. It
is designed so that, even if misused, it cannot expose or affect anything
sensitive:

- It never reads, stores, or transmits player identifiers, license
  identifiers, IP addresses, Discord IDs, tokens, or database credentials.
- It never checks or enforces permissions - the `permission` field on
  commands is a display label only.
- It has no admin/moderation surface (no kick/ban/teleport/give-item
  actions of any kind).
- Config validation (`lua/validate.lua`) and the developer API
  (`lua/registry.lua`) treat all incoming data - from `config.lua` and from
  other resources' `exports()` calls - as untrusted input: every entry is
  type- and shape-checked before use, malformed entries are dropped rather
  than executed, and there is no dynamic Lua loading (`load`, `loadstring`)
  or code execution path anywhere in the resource.
- The NUI renders configured strings as text, not HTML - React's default
  JSX escaping means there is no `dangerouslySetInnerHTML` anywhere in the
  codebase, so a malicious rule/command/news description cannot inject
  markup or scripts into the panel.
- External links (Discord, website, etc.) are opened via standard
  `target="_blank" rel="noopener noreferrer"` anchors, handled by FiveM's
  CEF - there is no custom "open URL" native call to audit.

## Reporting a vulnerability

If you find a security issue in hs-serverhub, please report it privately
rather than opening a public issue:

- Open a [GitHub Security Advisory](https://github.com/HyperSentry-Labs/hs-serverhub/security/advisories/new)
  on the repository, or
- Contact HyperSentry Labs through the channel listed on the repository's
  GitHub profile.

Please include:

- The affected version/commit
- Steps to reproduce
- The potential impact as you understand it

We aim to acknowledge reports within a few days. Please do not disclose the
issue publicly until a fix has been released.

## Supported versions

Only the latest tagged release is supported with security fixes.
