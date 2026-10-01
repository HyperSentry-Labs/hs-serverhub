import type { ContentPayload, SectionId } from '../types/content';
import type { FavoriteKind, FavoriteRef } from './favorites';

export interface PinnedItem {
  ref: FavoriteRef;
  title: string;
  subtitle: string;
  section: SectionId;
}

/**
 * Resolves stored favorite refs against the CURRENT content. A ref whose
 * item no longer exists (removed from config, or a resource that stopped)
 * is silently skipped - never shown as a broken entry - but stays in
 * storage so it reappears if the item comes back.
 */
export function resolvePinned(content: ContentPayload, favorites: FavoriteRef[]): PinnedItem[] {
  const lookups: Record<FavoriteKind, (id: string) => Omit<PinnedItem, 'ref'> | undefined> = {
    rules: (id) => {
      const r = content.rules.items.find((x) => x.id === id);
      return r && { title: r.title, subtitle: r.description, section: 'rules' };
    },
    commands: (id) => {
      const c = content.commands.items.find((x) => x.id === id);
      return c && { title: c.command, subtitle: c.title, section: 'commands' };
    },
    keybinds: (id) => {
      const k = content.keybinds.items.find((x) => x.id === id);
      return k && { title: k.key, subtitle: k.title, section: 'keybinds' };
    },
    'getting-started': (id) => {
      const s = content.gettingStarted.steps.find((x) => x.id === id);
      return s && { title: s.title, subtitle: s.description, section: 'getting-started' };
    },
  };

  return favorites.flatMap((ref) => {
    const found = lookups[ref.kind](ref.id);
    return found ? [{ ref, ...found }] : [];
  });
}
