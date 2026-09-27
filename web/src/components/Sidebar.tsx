import { SECTION_ICONS } from '../lib/icons';
import { useI18n } from '../hooks/useI18n';
import type { SectionId } from '../types/content';

interface Props {
  sections: SectionId[];
  active: SectionId;
  onSelect: (section: SectionId) => void;
}

const LABEL_KEYS: Record<SectionId, string> = {
  overview: 'nav.overview',
  rules: 'nav.rules',
  commands: 'nav.commands',
  keybinds: 'nav.keybinds',
  'getting-started': 'nav.gettingStarted',
  news: 'nav.news',
  community: 'nav.community',
};

export function Sidebar({ sections, active, onSelect }: Props) {
  const { t } = useI18n();

  return (
    <nav aria-label="ServerHub sections" className="flex w-48 shrink-0 flex-col gap-1 border-r border-base-border p-3">
      {sections.map((section) => {
        const Icon = SECTION_ICONS[section];
        const isActive = section === active;
        return (
          <button
            key={section}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelect(section)}
            className={`hs-focus-ring flex items-center gap-2.5 rounded-hs px-3 py-2 text-left text-sm transition-colors ${
              isActive
                ? 'bg-accent/10 text-accent'
                : 'text-base-muted hover:bg-base-panel-raised hover:text-base-text'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{t(LABEL_KEYS[section])}</span>
          </button>
        );
      })}
    </nav>
  );
}
