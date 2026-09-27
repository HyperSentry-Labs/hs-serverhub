import type { Category } from '../types/content';

interface Props {
  categories: Category[];
  active: string | null;
  onChange: (categoryId: string | null) => void;
  allLabel: string;
}

export function CategoryFilter({ categories, active, onChange, allLabel }: Props) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
      <FilterPill label={allLabel} isActive={active === null} onClick={() => onChange(null)} />
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
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`hs-focus-ring rounded-full border px-3 py-1 text-sm transition-colors ${
        isActive
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-base-border text-base-muted hover:text-base-text'
      }`}
    >
      {label}
    </button>
  );
}
