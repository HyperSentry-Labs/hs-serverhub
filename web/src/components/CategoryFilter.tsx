import type { Category } from '../types/content';
import { useI18n } from '../hooks/useI18n';

interface Props {
  categories: Category[];
  active: string | null;
  onChange: (categoryId: string | null) => void;
}

/** Toggle-button group (not tabs: it filters one list, it doesn't switch panels). */
export function CategoryFilter({ categories, active, onChange }: Props) {
  const { t } = useI18n();
  if (categories.length === 0) return null;

  return (
    <div role="group" aria-label={t('app.filterByCategory')} className="flex flex-wrap gap-1.5">
      <FilterPill label={t('common.all')} isActive={active === null} onClick={() => onChange(null)} />
      {categories.map((category) => (
        <FilterPill
          key={category.id}
          label={category.label}
          isActive={active === category.id}
          onClick={() => onChange(category.id)}
        />
      ))}
    </div>
  );
}

function FilterPill({ label, isActive, onClick }: { label: string; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={`hs-focus-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        isActive
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-base-border text-base-muted hover:border-base-muted/50 hover:text-base-text'
      }`}
    >
      {label}
    </button>
  );
}
