import type {
  Category,
  CommunityGroup,
  CommunityLink,
  ContentPayload,
  GettingStartedStep,
  NewsItem,
  QuickLink,
  SectionId,
} from '../types/content';
import { isSafeUrl } from './url';

const SECTION_IDS: readonly string[] = [
  'overview',
  'rules',
  'commands',
  'keybinds',
  'getting-started',
  'news',
  'community',
];

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const isText = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

function safeArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

/** Keeps only entries that are objects with a non-empty string `id`. */
function withIds<T>(value: unknown): T[] {
  return safeArray<unknown>(value).filter((v): v is T => isRecord(v) && isText(v.id));
}

function normalizeLinks(value: unknown): CommunityLink[] {
  return withIds<CommunityLink>(value).filter((l) => isText(l.label) && isSafeUrl(l.url));
}

function normalizeQuickLinks(value: unknown): QuickLink[] {
  return withIds<QuickLink>(value).filter((q) => {
    if (!isText(q.label)) return false;
    if (q.type === 'url') return isSafeUrl(q.url);
    return typeof q.target === 'string' && SECTION_IDS.includes(q.target);
  });
}

function normalizeCategories(value: unknown): Category[] {
  return withIds<Category>(value).filter((c) => isText(c.label));
}

function normalizeGroups(value: unknown): CommunityGroup[] {
  return withIds<CommunityGroup>(value)
    .filter((g) => isText(g.label))
    .map((g) => ({ id: g.id, label: g.label, links: normalizeLinks(g.links) }));
}

/**
 * lua/validate.lua already guarantees a well-formed payload, but a
 * malformed `contentUpdate` mid-session (a bad export() call racing a
 * page render, a hand-edited mock, etc.) should still render an intentional
 * empty state instead of throwing. This fills in every array/object the UI
 * indexes into and drops entries the UI could not render or open safely,
 * without inventing content. It is intentionally cheap and runs once per
 * payload (in the hook), never per render.
 */
export function normalizeContent(input: Partial<ContentPayload> | null | undefined): ContentPayload {
  const general = input?.general;
  const validSection = (s: unknown): s is SectionId => typeof s === 'string' && SECTION_IDS.includes(s);

  return {
    general: {
      ServerName: general?.ServerName || 'ServerHub',
      Subtitle: general?.Subtitle || '',
      Description: general?.Description || '',
      Logo: general?.Logo || '',
      AccentColor: general?.AccentColor || '#E3A857',
      AccentColorSecondary: general?.AccentColorSecondary || '#5FB3B3',
      Command: general?.Command || 'serverhub',
      DefaultKey: general?.DefaultKey || 'F10',
      Language: general?.Language || 'en',
      Debug: Boolean(general?.Debug),
    },
    theme: isRecord(input?.theme) ? input.theme : {},
    links: input?.links ?? {},
    overview: {
      Enabled: input?.overview?.Enabled ?? true,
      ShowLiveStats: input?.overview?.ShowLiveStats ?? true,
      ShowLatestAnnouncement: input?.overview?.ShowLatestAnnouncement ?? true,
      QuickLinks: normalizeQuickLinks(input?.overview?.QuickLinks),
    },
    rules: {
      categories: normalizeCategories(input?.rules?.categories),
      items: safeArray(input?.rules?.items),
    },
    commands: {
      categories: normalizeCategories(input?.commands?.categories),
      items: safeArray(input?.commands?.items),
    },
    keybinds: {
      categories: normalizeCategories(input?.keybinds?.categories),
      items: safeArray(input?.keybinds?.items),
    },
    gettingStarted: {
      steps: withIds<GettingStartedStep>(input?.gettingStarted?.steps).map((step) =>
        step.linkTarget !== undefined && !validSection(step.linkTarget) ? { ...step, linkTarget: undefined } : step,
      ),
      enableProgress: input?.gettingStarted?.enableProgress ?? true,
    },
    news: {
      // The server already sorts newest-first; re-sorting here keeps the UI
      // correct for any other source. Stable, once per payload.
      items: safeArray<NewsItem>(input?.news?.items)
        .filter((n) => isRecord(n) && isText(n.id))
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    },
    community: {
      links: normalizeLinks(input?.community?.links),
      groups: normalizeGroups(input?.community?.groups),
    },
    stats: safeArray(input?.stats),
    status: {
      enabled: input?.status?.enabled ?? true,
      showUptime: input?.status?.showUptime ?? true,
    },
  };
}
