import { readJson, writeJson } from './storage';

export const PROGRESS_KEY = 'hs-serverhub:progress:v1';

function isStringList(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string');
}

export function loadProgress(): string[] {
  return readJson<string[]>(PROGRESS_KEY, [], isStringList);
}

export function saveProgress(ids: string[]): void {
  writeJson(PROGRESS_KEY, ids);
}
