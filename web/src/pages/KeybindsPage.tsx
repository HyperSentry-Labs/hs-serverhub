import { useState } from 'react';
import { Search } from 'lucide-react';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/EmptyState';
import { Panel } from '../components/Panel';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload } from '../types/content';

export function KeybindsPage({ keybinds }: { keybinds: ContentPayload['keybinds'] }) {
  const { t } = useI18n();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = keybinds.items.filter((k) => {
    if (category && k.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return k.key.toLowerCase().includes(q) || k.title.toLowerCase().includes(q) || k.description.toLowerCase().includes(q);
  });

  if (keybinds.items.length === 0) {
    return <EmptyState message={t('keybinds.empty')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          categories={keybinds.categories}
          active={category}
          onChange={setCategory}
          allLabel={t('rules.allCategories')}
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('keybinds.searchPlaceholder')}
            className="hs-focus-ring w-full rounded-hs border border-base-border bg-base-panel-raised py-1.5 pl-9 pr-3 text-sm placeholder:text-base-muted focus:border-accent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('keybinds.empty')} />
      ) : (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {filtered.map((k) => (
            <li key={k.id}>
              <Panel className="flex items-center gap-3 p-3">
                <kbd className="flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-hs border border-base-border bg-base-panel-raised px-2 font-mono text-sm text-base-text">
                  {k.key}
                </kbd>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-base-text">{k.title}</p>
                  <p className="truncate text-xs text-base-muted">{k.description}</p>
                </div>
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
