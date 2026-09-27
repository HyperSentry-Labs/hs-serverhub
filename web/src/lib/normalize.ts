import type { ContentPayload } from '../types/content';

/**
 * lua/validate.lua already guarantees a well-formed payload, but a
 * malformed `contentUpdate` mid-session (a bad export() call racing a
 * page render, a hand-edited mock, etc.) should still render an intentional
 * empty state instead of throwing. This fills in every array/object the UI
 * indexes into, without inventing content.
 */
export function normalizeContent(input: Partial<ContentPayload> | null | undefined): ContentPayload {
  const safeArray = <T,>(value: unknown): T[] => (Array.isArray(value) ? (value as T[]) : []);

  return {
    general: {
      ServerName: input?.general?.ServerName || 'ServerHub',
      Subtitle: input?.general?.Subtitle || '',
      Description: input?.general?.Description || '',
      Logo: input?.general?.Logo || '',
      AccentColor: input?.general?.AccentColor || '#E3A857',
      AccentColorSecondary: input?.general?.AccentColorSecondary || '#5FB3B3',
      Command: input?.general?.Command || 'serverhub',
      DefaultKey: input?.general?.DefaultKey || 'F10',
      Language: input?.general?.Language || 'en',
      Debug: Boolean(input?.general?.Debug),
    },
    links: input?.links ?? {},
    overview: {
      Enabled: input?.overview?.Enabled ?? true,
      ShowLiveStats: input?.overview?.ShowLiveStats ?? true,
      ShowLatestAnnouncement: input?.overview?.ShowLatestAnnouncement ?? true,
      QuickLinks: safeArray(input?.overview?.QuickLinks),
    },
    rules: {
      categories: safeArray(input?.rules?.categories),
      items: safeArray(input?.rules?.items),
    },
    commands: {
      categories: safeArray(input?.commands?.categories),
      items: safeArray(input?.commands?.items),
    },
    keybinds: {
      categories: safeArray(input?.keybinds?.categories),
      items: safeArray(input?.keybinds?.items),
    },
    gettingStarted: {
      steps: safeArray(input?.gettingStarted?.steps),
    },
    news: {
      items: safeArray(input?.news?.items),
    },
    community: {
      links: safeArray(input?.community?.links),
    },
    stats: safeArray(input?.stats),
    status: {
      enabled: input?.status?.enabled ?? true,
      showUptime: input?.status?.showUptime ?? true,
    },
  };
}
