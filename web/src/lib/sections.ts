import type { SectionId } from '../types/content';

/** i18n key for each built-in section's navigation label. */
export const SECTION_LABEL_KEYS: Record<SectionId, string> = {
  overview: 'nav.overview',
  rules: 'nav.rules',
  commands: 'nav.commands',
  keybinds: 'nav.keybinds',
  'getting-started': 'nav.gettingStarted',
  news: 'nav.news',
  community: 'nav.community',
};
