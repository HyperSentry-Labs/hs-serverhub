import { describe, expect, it, vi } from 'vitest';
import { FAVORITES_KEY, loadFavorites, saveFavorites } from './favorites';
import { resolvePinned } from './pinned';
import { content } from '../test/utils';

describe('favorites storage', () => {
  it('round-trips a list', () => {
    saveFavorites([{ kind: 'rules', id: 'general-1' }]);
    expect(loadFavorites()).toEqual([{ kind: 'rules', id: 'general-1' }]);
  });
  it('ignores corrupted or wrongly shaped data', () => {
    window.localStorage.setItem(FAVORITES_KEY, '{not json');
    expect(loadFavorites()).toEqual([]);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([{ kind: 'nope', id: 1 }]));
    expect(loadFavorites()).toEqual([]);
  });
  it('survives storage being unavailable', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    expect(() => saveFavorites([{ kind: 'rules', id: 'x' }])).not.toThrow();
    spy.mockRestore();
  });
});

describe('resolvePinned', () => {
  it('resolves existing items and silently skips ones that no longer exist', () => {
    const pinned = resolvePinned(content(), [
      { kind: 'commands', id: 'cmd-report' },
      { kind: 'rules', id: 'removed-rule' },
      { kind: 'keybinds', id: 'key-phone' },
    ]);
    expect(pinned.map((p) => p.title)).toEqual(['/report', 'F1']);
    expect(pinned[0]?.section).toBe('commands');
  });
});
