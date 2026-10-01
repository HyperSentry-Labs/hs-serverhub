import en from './locales/en.json';
import fa from './locales/fa.json';

export type LocaleDictionary = Record<string, string>;

// Adding a language is: drop a new JSON file in locales/, register it here,
// add it to RTL_LOCALES if it is right-to-left, and set
// Config.General.Language in config.lua. See docs/localization.md.
export const LOCALES: Record<string, LocaleDictionary> = { en, fa };

const RTL_LOCALES = new Set(['fa', 'ar', 'he', 'ur']);

export function resolveLocale(language: string | undefined): LocaleDictionary {
  if (language && LOCALES[language]) return LOCALES[language];
  return LOCALES.en as LocaleDictionary;
}

export function directionFor(language: string | undefined): 'rtl' | 'ltr' {
  return language && RTL_LOCALES.has(language) ? 'rtl' : 'ltr';
}

export function translate(
  dictionary: LocaleDictionary,
  key: string,
  vars?: Record<string, string | number>,
): string {
  let value = dictionary[key] ?? (LOCALES.en as LocaleDictionary)[key] ?? key;
  if (vars) {
    for (const [name, val] of Object.entries(vars)) {
      value = value.split(`{${name}}`).join(String(val));
    }
  }
  return value;
}
