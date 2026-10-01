import { describe, expect, it } from 'vitest';
import { directionFor, LOCALES, resolveLocale, translate } from './index';

describe('locales', () => {
  const enKeys = Object.keys(LOCALES.en ?? {}).sort();
  it.each(Object.keys(LOCALES))('%s has exactly the same keys as English', (code) => {
    expect(Object.keys(LOCALES[code] ?? {}).sort()).toEqual(enKeys);
  });
  it.each(Object.keys(LOCALES))('%s keeps the same {placeholders} as English', (code) => {
    const tokens = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of enKeys) {
      expect(tokens(LOCALES[code]?.[key] ?? '')).toEqual(tokens(LOCALES.en?.[key] ?? ''));
    }
  });
  it('no locale has an empty value', () => {
    for (const dict of Object.values(LOCALES)) {
      for (const value of Object.values(dict)) expect(value.trim().length).toBeGreaterThan(0);
    }
  });
});

describe('helpers', () => {
  it('reports RTL only for RTL languages', () => {
    expect(directionFor('fa')).toBe('rtl');
    expect(directionFor('en')).toBe('ltr');
    expect(directionFor(undefined)).toBe('ltr');
  });
  it('falls back to English for an unknown language and unknown key', () => {
    expect(resolveLocale('xx')).toBe(LOCALES.en);
    expect(translate(LOCALES.en ?? {}, 'does.not.exist')).toBe('does.not.exist');
  });
  it('substitutes every occurrence of a placeholder', () => {
    expect(translate({ k: '{a} and {a}' }, 'k', { a: 'x' })).toBe('x and x');
  });
});
