/**
 * Defence in depth: lua/validate.lua already refuses anything but
 * http/https, but the UI never trusts that it ran (a hand-edited mock, a
 * future bridge, a malformed contentUpdate). Anything else renders as
 * plain, non-clickable text instead of a live link.
 */
export function isSafeUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
