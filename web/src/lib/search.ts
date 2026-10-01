import type { ContentPayload, SectionId } from '../types/content';
import { matchesAllTerms, normalizeText } from './text';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  section: SectionId;
}

export interface SearchResultGroup {
  section: SectionId;
  /** i18n key for the group heading, e.g. `nav.commands`. */
  labelKey: string;
  results: SearchResultItem[];
}

export const MAX_RESULTS_PER_SECTION = 5;

interface Candidate {
  item: SearchResultItem;
  /** Strong fields (title/command/key) - a match here outranks a description match. */
  primary: string[];
  secondary: string[];
}

function score(candidate: Candidate, query: string): number {
  const primary = candidate.primary.map(normalizeText);
  const secondary = candidate.secondary.map(normalizeText);
  const haystack = [...primary, ...secondary].join(' ');
  if (!matchesAllTerms(haystack, query)) return 0;
  if (primary.some((p) => p === query)) return 100;
  if (primary.some((p) => p.startsWith(query))) return 80;
  if (primary.some((p) => p.includes(query))) return 60;
  if (primary.some((p) => matchesAllTerms(p, query))) return 50;
  return 20;
}

function rank(candidates: Candidate[], query: string): SearchResultItem[] {
  return candidates
    .map((candidate, index) => ({ candidate, index, score: score(candidate, query) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map((entry) => entry.candidate.item);
}

function group(section: SectionId, labelKey: string, results: SearchResultItem[]): SearchResultGroup[] {
  return results.length ? [{ section, labelKey, results }] : [];
}

/**
 * Searches commands, keybinds, rules, getting-started steps, news and
 * community links. Returns only non-empty groups, in a fixed order, with
 * the best matches first inside each group.
 */
export function searchContent(content: ContentPayload, rawQuery: string): SearchResultGroup[] {
  const query = normalizeText(rawQuery);
  if (!query) return [];

  const commands = content.commands.items.map<Candidate>((c) => ({
    item: { id: c.id, title: c.command, subtitle: c.title, section: 'commands' },
    primary: [c.command, c.title, ...(c.aliases ?? [])],
    secondary: [c.description, c.category, c.usage ?? '', c.keybind ?? ''],
  }));

  const keybinds = content.keybinds.items.map<Candidate>((k) => ({
    item: { id: k.id, title: k.key, subtitle: k.title, section: 'keybinds' },
    primary: [k.key, k.title],
    secondary: [k.description, k.category, k.resource ?? '', k.context ?? ''],
  }));

  const rules = content.rules.items.map<Candidate>((r) => ({
    item: { id: r.id, title: r.title, subtitle: r.description, section: 'rules' },
    primary: [r.title, r.id],
    secondary: [r.description, r.category],
  }));

  const steps = content.gettingStarted.steps.map<Candidate>((s) => ({
    item: { id: s.id, title: s.title, subtitle: s.description, section: 'getting-started' },
    primary: [s.title],
    secondary: [s.description],
  }));

  const news = content.news.items.map<Candidate>((n) => ({
    item: { id: n.id, title: n.title, subtitle: n.description, section: 'news' },
    primary: [n.title],
    secondary: [n.description, n.category ?? '', n.version ?? ''],
  }));

  const communityLinks = [...content.community.links, ...content.community.groups.flatMap((g) => g.links)];
  const community = communityLinks.map<Candidate>((l) => ({
    item: { id: l.id, title: l.label, subtitle: l.description ?? '', section: 'community' },
    primary: [l.label],
    secondary: [l.description ?? ''],
  }));

  return [
    ...group('commands', 'nav.commands', rank(commands, query)),
    ...group('keybinds', 'nav.keybinds', rank(keybinds, query)),
    ...group('rules', 'nav.rules', rank(rules, query)),
    ...group('getting-started', 'nav.gettingStarted', rank(steps, query)),
    ...group('news', 'nav.news', rank(news, query)),
    ...group('community', 'nav.community', rank(community, query)),
  ];
}

/** Flattens groups into the single ordered list keyboard navigation walks. */
export function flattenResults(groups: SearchResultGroup[]): SearchResultItem[] {
  return groups.flatMap((g) => g.results);
}
