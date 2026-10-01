import { readJson, writeJson } from './storage';

export type FavoriteKind = 'rules' | 'commands' | 'keybinds' | 'getting-started';

export interface FavoriteRef {
  kind: FavoriteKind;
  id: string;
}

export const FAVORITES_KEY = 'hs-serverhub:favorites:v1';
export const MAX_FAVORITES = 50;

const KINDS: readonly string[] = ['rules', 'commands', 'keybinds', 'getting-started'];

function isFavoriteRef(v: unknown): v is FavoriteRef {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.id === 'string' && typeof o.kind === 'string' && KINDS.includes(o.kind);
}

function isFavoriteList(v: unknown): v is FavoriteRef[] {
  return Array.isArray(v) && v.every(isFavoriteRef);
}

export function sameRef(a: FavoriteRef, b: FavoriteRef): boolean {
  return a.kind === b.kind && a.id === b.id;
}

export function loadFavorites(): FavoriteRef[] {
  return readJson<FavoriteRef[]>(FAVORITES_KEY, [], isFavoriteList).slice(0, MAX_FAVORITES);
}

export function saveFavorites(list: FavoriteRef[]): void {
  writeJson(FAVORITES_KEY, list.slice(0, MAX_FAVORITES));
}
