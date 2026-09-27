import type { ContentPayload, SectionId } from '../types/content';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  section: SectionId;
}

export interface SearchResultGroup {
  section: SectionId;
  label: string;
  results: SearchResultItem[];
}

const MAX_RESULTS_PER_SECTION = 5;

function matches(query: string, ...fields: Array<string | undefined>): boolean {
  return fields.some((field) => (field ?? '').toLowerCase().includes(query));
}

/**
 * Searches rules, commands, keybinds, getting-started steps, and news -
 * the minimum surface required by the product brief. Returns only
 * non-empty groups, in a fixed, predictable order.
 */
export function searchContent(content: ContentPayload, rawQuery: string): SearchResultGroup[] {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const groups: SearchResultGroup[] = [];

  const commandResults = content.commands.items
    .filter((c) => matches(query, c.command, c.title, c.description, c.category))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map((c) => ({ id: c.id, title: c.command, subtitle: c.title, section: 'commands' as const }));
  if (commandResults.length) groups.push({ section: 'commands', label: 'Commands', results: commandResults });

  const keybindResults = content.keybinds.items
    .filter((k) => matches(query, k.key, k.title, k.description, k.category))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map((k) => ({ id: k.id, title: k.key, subtitle: k.title, section: 'keybinds' as const }));
  if (keybindResults.length) groups.push({ section: 'keybinds', label: 'Keybinds', results: keybindResults });

  const ruleResults = content.rules.items
    .filter((r) => matches(query, r.title, r.description, r.category))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map((r) => ({ id: r.id, title: r.title, subtitle: r.description, section: 'rules' as const }));
  if (ruleResults.length) groups.push({ section: 'rules', label: 'Rules', results: ruleResults });

  const stepResults = content.gettingStarted.steps
    .filter((s) => matches(query, s.title, s.description))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map((s) => ({ id: s.id, title: s.title, subtitle: s.description, section: 'getting-started' as const }));
  if (stepResults.length) groups.push({ section: 'getting-started', label: 'Getting Started', results: stepResults });

  const newsResults = content.news.items
    .filter((n) => matches(query, n.title, n.description, n.category))
    .slice(0, MAX_RESULTS_PER_SECTION)
    .map((n) => ({ id: n.id, title: n.title, subtitle: n.description, section: 'news' as const }));
  if (newsResults.length) groups.push({ section: 'news', label: 'News', results: newsResults });

  return groups;
}
