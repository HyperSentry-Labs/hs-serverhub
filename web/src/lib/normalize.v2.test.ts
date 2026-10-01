import { describe, expect, it } from 'vitest';
import { normalizeContent } from './normalize';
import { demoContent } from '../mock/demoContent';
import { FIXTURE_NAMES, getFixture } from '../mock/fixtures';

describe('normalizeContent v2', () => {
  it('drops community links with an unsafe URL', () => {
    const result = normalizeContent({
      community: {
        links: [
          { id: 'ok', label: 'OK', url: 'https://example.com' },
          { id: 'bad', label: 'Bad', url: 'javascript:alert(1)' },
        ],
        groups: [{ id: 'g', label: 'G', links: [{ id: 'bad2', label: 'Bad', url: 'data:text/html,x' }] }],
      },
    });
    expect(result.community.links.map((l) => l.id)).toEqual(['ok']);
    expect(result.community.groups[0]?.links).toEqual([]);
  });

  it('drops quick links that could not do anything when clicked', () => {
    const result = normalizeContent({
      overview: {
        Enabled: true,
        ShowLiveStats: true,
        ShowLatestAnnouncement: true,
        QuickLinks: [
          { id: 'a', label: 'Rules', target: 'rules' },
          { id: 'b', label: 'Ext', type: 'url', url: 'https://example.com' },
          { id: 'c', label: 'Bad', type: 'url', url: 'javascript:1' },
          // @ts-expect-error unknown target on purpose
          { id: 'd', label: 'Nowhere', target: 'not-a-section' },
        ],
      },
    });
    expect(result.overview.QuickLinks.map((q) => q.id)).toEqual(['a', 'b']);
  });

  it('sorts news newest-first and defaults progress to enabled', () => {
    const result = normalizeContent({
      news: {
        items: [
          { id: 'old', title: 'Old', date: '2026-01-01', description: 'x' },
          { id: 'new', title: 'New', date: '2026-02-01', description: 'x' },
        ],
      },
    });
    expect(result.news.items.map((n) => n.id)).toEqual(['new', 'old']);
    expect(result.gettingStarted.enableProgress).toBe(true);
  });

  it('strips an unknown getting-started linkTarget', () => {
    const result = normalizeContent({
      gettingStarted: {
        enableProgress: true,
        // @ts-expect-error unknown target on purpose
        steps: [{ id: 's', title: 'T', description: 'D', linkTarget: 'nowhere' }],
      },
    });
    expect(result.gettingStarted.steps[0]?.linkTarget).toBeUndefined();
  });

  it('keeps well-formed demo content intact', () => {
    const result = normalizeContent(demoContent);
    expect(result.rules.items).toHaveLength(demoContent.rules.items.length);
    expect(result.overview.QuickLinks).toHaveLength(demoContent.overview.QuickLinks.length);
  });
});

describe('fixtures', () => {
  it.each(FIXTURE_NAMES)('%s normalizes without losing structure', (name) => {
    const { content } = getFixture(name);
    const result = normalizeContent(content);
    expect(Array.isArray(result.rules.items)).toBe(true);
    expect(result.general.ServerName.length).toBeGreaterThan(0);
  });
  it('falls back to the default fixture for an unknown name', () => {
    expect(getFixture('nope').content.general.ServerName).toBe(demoContent.general.ServerName);
  });
});
