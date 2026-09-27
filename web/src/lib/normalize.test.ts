import { describe, expect, it } from 'vitest';
import { normalizeContent } from './normalize';

describe('normalizeContent', () => {
  it('fills every array field for null input', () => {
    const result = normalizeContent(null);
    expect(result.rules.items).toEqual([]);
    expect(result.commands.items).toEqual([]);
    expect(result.keybinds.items).toEqual([]);
    expect(result.gettingStarted.steps).toEqual([]);
    expect(result.news.items).toEqual([]);
    expect(result.community.links).toEqual([]);
    expect(result.stats).toEqual([]);
  });

  it('falls back to safe general config values when missing', () => {
    const result = normalizeContent({});
    expect(result.general.ServerName).toBe('ServerHub');
    expect(result.general.Command).toBe('serverhub');
    expect(result.general.DefaultKey).toBe('F10');
  });

  it('does not invent items when arrays are present but malformed', () => {
    const result = normalizeContent({
      // @ts-expect-error intentionally malformed for the test
      rules: { categories: null, items: 'not-an-array' },
    });
    expect(result.rules.categories).toEqual([]);
    expect(result.rules.items).toEqual([]);
  });

  it('passes through well-formed data unchanged', () => {
    const input = {
      rules: {
        categories: [{ id: 'general', label: 'General' }],
        items: [{ id: 'g1', category: 'general', title: 'Be nice', description: 'x' }],
      },
    };
    const result = normalizeContent(input);
    expect(result.rules.items).toHaveLength(1);
    expect(result.rules.items[0]?.id).toBe('g1');
  });
});
