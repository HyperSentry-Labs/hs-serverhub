import type { ThemeConfig } from '../types/content';

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const FUNC = /^(?:rgb|rgba|hsl|hsla)\(\s*[\d.\s,%/deg]+\)$/i;

/** Mirrors HS.Validate.isValidColor in lua/validate.lua. */
export function isSafeColor(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 64) return false;
  return HEX.test(value) || FUNC.test(value);
}

export function safeColor(value: unknown, fallback: string): string {
  return isSafeColor(value) ? value : fallback;
}

export const THEME_DEFAULTS = {
  accent: '#e3a857',
  accentSecondary: '#5fb3b3',
} as const;

const THEME_VARS: Array<[keyof ThemeConfig, string]> = [
  ['AccentHover', '--hs-accent-hover'],
  ['Background', '--hs-bg'],
  ['Surface', '--hs-panel'],
  ['SurfaceRaised', '--hs-panel-raised'],
  ['Border', '--hs-border'],
  ['Text', '--hs-text'],
  ['Muted', '--hs-text-muted'],
];

/**
 * Applies validated theme tokens to :root. Invalid or absent tokens are
 * removed so the stylesheet defaults in globals.css apply.
 */
export function applyTheme(
  root: HTMLElement,
  accent: unknown,
  accentSecondary: unknown,
  theme: ThemeConfig | undefined,
): void {
  root.style.setProperty('--hs-accent', safeColor(accent, THEME_DEFAULTS.accent));
  root.style.setProperty('--hs-accent-secondary', safeColor(accentSecondary, THEME_DEFAULTS.accentSecondary));
  for (const [key, cssVar] of THEME_VARS) {
    const value = theme?.[key];
    if (isSafeColor(value)) root.style.setProperty(cssVar, value);
    else root.style.removeProperty(cssVar);
  }
}
