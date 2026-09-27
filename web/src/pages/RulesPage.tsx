import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/EmptyState';
import { Panel } from '../components/Panel';
import { SeverityBadge } from '../components/SeverityBadge';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload } from '../types/content';

export function RulesPage({ rules }: { rules: ContentPayload['rules'] }) {
  const { t } = useI18n();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const categoryLabel = useMemo(() => {
    const map = new Map(rules.categories.map((c) => [c.id, c.label]));
    return (id: string) => map.get(id) ?? id;
  }, [rules.categories]);

  const filtered = rules.items.filter((rule) => {
    if (category && rule.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return rule.title.toLowerCase().includes(q) || rule.description.toLowerCase().includes(q);
  });

  if (rules.items.length === 0) {
    return <EmptyState message={t('rules.empty')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          categories={rules.categories}
          active={category}
          onChange={setCategory}
          allLabel={t('rules.allCategories')}
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('rules.searchPlaceholder')}
            className="hs-focus-ring w-full rounded-hs border border-base-border bg-base-panel-raised py-1.5 pl-9 pr-3 text-sm placeholder:text-base-muted focus:border-accent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('rules.empty')} />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((rule) => (
            <li key={rule.id}>
              <Panel className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-base-text">{rule.title}</p>
                    <p className="mt-1 text-sm text-base-muted">{rule.description}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <SeverityBadge severity={rule.severity} />
                    <span className="text-xs text-base-muted">{categoryLabel(rule.category)}</span>
                  </div>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
