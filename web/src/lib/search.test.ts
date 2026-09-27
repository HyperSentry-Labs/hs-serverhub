import { describe, expect, it } from 'vitest';
import { searchContent } from './search';
import { demoContent } from '../mock/demoContent';

describe('searchContent', () => {
  it('returns nothing for an empty query', () => {
    expect(searchContent(demoContent, '')).toEqual([]);
    expect(searchContent(demoContent, '   ')).toEqual([]);
  });

  it('finds commands by command name', () => {
    const groups = searchContent(demoContent, '911');
    const commandGroup = groups.find((g) => g.section === 'commands');
    expect(commandGroup?.results.some((r) => r.title === '/911')).toBe(true);
  });

  it('finds keybinds by key and matches across sections', () => {
    const groups = searchContent(demoContent, 'police');
    const sections = groups.map((g) => g.section);
    expect(sections).toContain('keybinds');
    expect(sections).toContain('rules');
    expect(sections).toContain('news');
  });

  it('is case-insensitive', () => {
    const upper = searchContent(demoContent, 'DISCORD');
    const lower = searchContent(demoContent, 'discord');
    expect(upper.map((g) => g.section)).toEqual(lower.map((g) => g.section));
  });

  it('omits sections with no matches instead of returning empty groups', () => {
    const groups = searchContent(demoContent, 'zzz-does-not-exist');
    expect(groups).toEqual([]);
  });

  it('caps results at 5 per section', () => {
    const groups = searchContent(demoContent, 'e'); // matches almost everything
    for (const group of groups) {
      expect(group.results.length).toBeLessThanOrEqual(5);
    }
  });
});
