/**
 * Tiny JSON localStorage wrapper. Everything ServerHub stores here (pinned
 * items, getting-started progress) is a per-player convenience - never
 * authoritative, never sensitive. Storage can be unavailable or cleared
 * (private mode, a player clearing the FiveM NUI cache), so every access
 * is guarded and failure just means "start empty".
 */
export function readJson<T>(key: string, fallback: T, validate: (v: unknown) => v is T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable or full - the feature silently degrades to session-only */
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
