# Localization

ServerHub ships with two locales: **English (`en`, default)** and
**Persian (`fa`)**, and is architected so adding another is a small,
self-contained change.

## How it works

- Locale dictionaries are plain JSON files: `web/src/i18n/locales/en.json`,
  `web/src/i18n/locales/fa.json`.
- `web/src/i18n/index.ts` registers them in a `LOCALES` map and exposes
  `translate(dictionary, key, vars)`, which falls back to the English
  string (and finally to the raw key) if a translation is missing - a
  partially-translated locale never breaks the UI.
- `web/src/hooks/useI18n.tsx` provides a `useI18n()` hook returning
  `{ t, dir, language }`. Components call `t('some.key')`.
- `Config.General.Language` in `config.lua` picks the active locale.
  Persian is available but **is not the default** - English is, per the
  product brief.
- Right-to-left languages (`fa`, `ar`, `he` are pre-registered as RTL in
  `directionFor()`) automatically set `document.documentElement.dir`, so
  layout mirrors correctly without per-component RTL logic.

## Adding a new language

1. Copy `web/src/i18n/locales/en.json` to `web/src/i18n/locales/<code>.json`
   (use a short code like `de`, `es`, `pt-br`).
2. Translate the values. Keep the `{placeholder}` tokens (e.g.
   `{query}`, `{section}`) exactly as they appear - they're substituted at
   render time.
3. Register it in `web/src/i18n/index.ts`:
   ```ts
   import de from './locales/de.json';
   const LOCALES: Record<string, LocaleDictionary> = { en, fa, de };
   ```
4. If it's a right-to-left language, add its code to `RTL_LOCALES` in the
   same file.
5. Set `Config.General.Language = 'de'` in `config.lua` (or leave it as
   `'en'` and let individual server owners choose).

## What is NOT translated by this system

- Content you write yourself in `config.lua` (rule text, command
  descriptions, news items, etc.) is stored as plain strings, not
  translation keys - ServerHub has no per-item multi-language content
  model in v1. If you need a specific server localized, write your
  `config.lua` content directly in that language.
- Only UI chrome (navigation labels, placeholders, empty states,
  accessibility text) goes through `t()`.

## Accessibility text

Every `t()` key that renders as an `aria-label` or similar (e.g. the close
button, "clear search") is part of the same dictionaries, so a translated
locale is fully translated for assistive technology too, not just visible
text.
