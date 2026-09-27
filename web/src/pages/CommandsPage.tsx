import { useState } from 'react';
import { Search } from 'lucide-react';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/EmptyState';
import { Panel } from '../components/Panel';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload } from '../types/content';

export function CommandsPage({ commands }: { commands: ContentPayload['commands'] }) {
  const { t } = useI18n();
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const filtered = commands.items.filter((cmd) => {
    if (category && cmd.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      cmd.command.toLowerCase().includes(q) ||
      cmd.title.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  if (commands.items.length === 0) {
    return <EmptyState message={t('commands.empty')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter
          categories={commands.categories}
          active={category}
          onChange={setCategory}
          allLabel={t('rules.allCategories')}
        />
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('commands.searchPlaceholder')}
            className="hs-focus-ring w-full rounded-hs border border-base-border bg-base-panel-raised py-1.5 pl-9 pr-3 text-sm placeholder:text-base-muted focus:border-accent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('commands.empty')} />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((cmd) => (
            <li key={cmd.id}>
              <Panel className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <code className="font-mono text-sm text-accent">{cmd.command}</code>
                    {cmd.aliases && cmd.aliases.length > 0 && (
                      <span className="text-xs text-base-muted">
                        {t('commands.aliasLabel')} {cmd.aliases.join(', ')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm font-medium text-base-text">{cmd.title}</p>
                  <p className="text-sm text-base-muted">{cmd.description}</p>
                </div>
                {cmd.permission && (
                  <span className="shrink-0 rounded-full border border-base-border px-2 py-0.5 text-xs text-base-muted">
                    {cmd.permission}
                  </span>
                )}
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
