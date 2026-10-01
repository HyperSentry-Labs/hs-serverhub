# Contributing to hs-serverhub

Thanks for considering a contribution to ServerHub.

## Before you start

- For anything beyond a small fix, please open an issue first describing
  what you'd like to change - especially for new features, so we can agree
  on scope before you write code. See "Do not overbuild" below.
- This is a **standalone information hub**, not a framework menu or an
  admin panel. Features that would require ESX/QBCore/Qbox/ox_core/vRP, or
  that add moderation/admin/economy/inventory functionality, are out of
  scope - see the README's opening description of what ServerHub is (and
  is not) for why.

## Development setup

See `docs/development.md` for the full workflow. In short:

```bash
git clone <your fork>
cd hs-serverhub
npm install
npm run dev
```

## Before opening a pull request

Run everything CI runs:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
npm run test:lua   # requires a local `lua` (5.4) interpreter
```

## Code style

- TypeScript strict mode is on - avoid `any` unless there is genuinely no
  better option, and explain why in a comment if you use it.
- Keep components small and focused; prefer composing several small
  components over one large one.
- Lua: keep `config.lua` free of logic (data only). New shared logic
  belongs in `lua/*.lua` as a `HS.<Namespace>` table, following the pattern
  in `lua/validate.lua` and `lua/registry.lua` - and if it doesn't touch
  FiveM natives, add a standalone test under `tests/lua/` the same way.
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/)
  (`feat:`, `fix:`, `docs:`, `chore:`, etc.)

## Adding configuration options

If you add a new `Config.*` field:

1. Give it a safe default and validate it defensively (see
   `lua/validate.lua`'s pattern of "skip and warn, never throw").
2. Document it in `docs/configuration.md` with type, default, and an
   example, matching the existing table format.
3. If it's user-facing text, make sure it's not something that should
   instead be a translation key (see `docs/localization.md`).

## Reporting bugs

Please include: what you expected, what happened instead, your ServerHub
version, and whether you're seeing it in browser dev mode, in FiveM, or
both.

## License

By contributing, you agree your contributions are licensed under the
project's MIT license (see `LICENSE`).
