import { SECTION_ICONS } from '../lib/icons';
import { SECTION_LABEL_KEYS } from '../lib/sections';
import { useI18n } from '../hooks/useI18n';
import type { SectionId } from '../types/content';

interface Props {
  sections: SectionId[];
  active: SectionId;
  onSelect: (section: SectionId) => void;
}

/** Icon rail on narrow viewports, labelled list from `sm` up. */
export function Sidebar({ sections, active, onSelect }: Props) {
  const { t } = useI18n();

  return (
    <nav aria-label={t('app.sections')} className="flex w-14 shrink-0 flex-col gap-0.5 border-e border-base-border p-2 sm:w-52 sm:p-3">
      {sections.map((section) => {
        const Icon = SECTION_ICONS[section];
        const isActive = section === active;
        const label = t(SECTION_LABEL_KEYS[section]);
        return (
          <button
            key={section}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            title={label}
            onClick={() => onSelect(section)}
            className={`hs-focus-ring relative flex items-center justify-center gap-2.5 rounded-hs px-2 py-2 text-start text-sm transition-colors sm:justify-start sm:px-3 ${
              isActive
                ? 'bg-accent/10 font-medium text-accent'
                : 'text-base-muted hover:bg-base-panel-raised hover:text-base-text'
            }`}
          >
            {isActive && <span aria-hidden="true" className="absolute inset-y-1.5 start-0 w-0.5 rounded-full bg-accent" />}
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="sr-only truncate sm:not-sr-only">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
