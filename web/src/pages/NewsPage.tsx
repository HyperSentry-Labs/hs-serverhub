import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { ExternalLink } from '../components/ExternalLink';
import { Panel } from '../components/Panel';
import { formatDate } from '../lib/format';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload } from '../types/content';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

export function NewsPage({ news }: { news: ContentPayload['news'] }) {
  const { t } = useI18n();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set(news.items.map((n) => n.category).filter(Boolean) as string[]);
    return Array.from(set);
  }, [news.items]);

  const sorted = useMemo(
    () => [...news.items].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [news.items],
  );

  const filtered = sorted.filter((item) => {
    if (category && item.category !== category) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
  });

  if (news.items.length === 0) {
    return <EmptyState message={t('news.empty')} />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`hs-focus-ring rounded-full border px-3 py-1 text-sm ${
                category === null ? 'border-accent bg-accent/10 text-accent' : 'border-base-border text-base-muted'
              }`}
            >
              {t('rules.allCategories')}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`hs-focus-ring rounded-full border px-3 py-1 text-sm ${
                  category === c ? 'border-accent bg-accent/10 text-accent' : 'border-base-border text-base-muted'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('news.searchPlaceholder')}
            className="hs-focus-ring w-full rounded-hs border border-base-border bg-base-panel-raised py-1.5 pl-9 pr-3 text-sm placeholder:text-base-muted focus:border-accent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('news.empty')} />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((item) => (
            <li key={item.id}>
              <Panel className="p-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-base-muted">
                  <span>{formatDate(item.date)}</span>
                  {item.version && <span className="font-mono text-accent-secondary">{item.version}</span>}
                  {item.category && (
                    <span className="rounded-full border border-base-border px-2 py-0.5">{item.category}</span>
                  )}
                </div>
                <p className="mt-1.5 text-sm font-medium text-base-text">{item.title}</p>
                <p className="mt-1 text-sm text-base-muted">{item.description}</p>
                {item.url && (
                  <ExternalLink
                    href={item.url}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                  >
                    Read more <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </ExternalLink>
                )}
              </Panel>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
