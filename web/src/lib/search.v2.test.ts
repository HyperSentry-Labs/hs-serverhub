import { describe, expect, it } from 'vitest';
import { flattenResults, searchContent } from './search';
import { content } from '../test/utils';

const c = content();

describe('searchContent v2', () => {
  it('ignores punctuation, casing and extra whitespace', () => {
    const groups = searchContent(c, '  /REPORT!  ');
    expect(groups[0]?.section).toBe('commands');
    expect(groups[0]?.results[0]?.title).toBe('/report');
  });

  it('matches command aliases', () => {
    const groups = searchContent(c, '112');
    expect(groups.find((g) => g.section === 'commands')?.results[0]?.title).toBe('/911');
  });

  it('matches every term regardless of order', () => {
    const groups = searchContent(c, 'staff report');
    expect(groups.find((g) => g.section === 'commands')?.results.map((r) => r.id)).toContain('cmd-report');
  });

  it('ranks title matches above description-only matches', () => {
    const rules = searchContent(c, 'police').find((g) => g.section === 'rules');
    expect(rules?.results[0]?.id).toBe('police-1');
  });

  it('searches community links, including grouped ones', () => {
    const groups = searchContent(c, 'ticket');
    expect(groups.find((g) => g.section === 'community')?.results[0]?.id).toBe('grp-tickets');
  });

  it('finds keybinds by resource name', () => {
    const groups = searchContent(c, 'my-police');
    expect(groups.find((g) => g.section === 'keybinds')?.results[0]?.id).toBe('key-police-menu');
  });

  it('groups results in a fixed section order', () => {
    const sections = searchContent(c, 'police').map((g) => g.section);
    expect(sections).toEqual([...sections].sort((a, b) => order(a) - order(b)));
    expect(flattenResults(searchContent(c, 'police')).length).toBeGreaterThan(2);
  });

  it('finds Persian content', () => {
    const rtl = content({
      rules: { categories: [], items: [{ id: 'fa-1', category: 'x', title: 'احترام به بازیکنان', description: 'توضیح', severity: 'info' }] },
    });
    expect(searchContent(rtl, 'احترام')[0]?.section).toBe('rules');
  });
});

function order(section: string): number {
  return ['commands', 'keybinds', 'rules', 'getting-started', 'news', 'community'].indexOf(section);
}
