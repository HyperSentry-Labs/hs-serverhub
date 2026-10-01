import { useMemo } from 'react';
import { ExternalLink as ExternalLinkIcon, Newspaper } from 'lucide-react';
import { Badge } from '../components/Badge';
import { CategoryFilter } from '../components/CategoryFilter';
import { EmptyState } from '../components/EmptyState';
import { ExternalLink } from '../components/ExternalLink';
import { HighlightItem } from '../components/HighlightItem';
import { ListSearchInput } from '../components/ListSearchInput';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { PriorityBadge } from '../components/SeverityBadge';
import { useI18n } from '../hooks/useI18n';
import { useListFilters } from '../hooks/useListFilters';
import { formatDate } from '../lib/format';
import { getIcon } from '../lib/icons';
import { matchesAllTerms, normalizeText } from '../lib/text';
import type { ContentPayload, NewsItem } from '../types/content';

interface Props {
  news: ContentPayload['news'];
  highlightId?: string;
}

export function NewsPage({ news, highlightId }: Props) {
  const { t } = useI18n();
  const { category, setCategory, query, setQuery } = useListFilters(highlightId);

  const categories = useMemo(
    () => Array.from(new Set(news.items.map((n) => n.category).filter((c): c is string => Boolean(c)))).map((c) => ({ id: c, label: c })),
    [news.items],
  );

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    return news.items.filter((item) => {
      if (category && item.category !== category) return false;
      return matchesAllTerms(normalizeText(`${item.title} ${item.description} ${item.category ?? ''} ${item.version ?? ''}`), q);
    });
  }, [news.items, category, query]);

  if (news.items.length === 0) {
    return (
      <>
        <PageHeader title={t('nav.news')} />
        <EmptyState message={t('news.empty')} icon={Newspaper} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('nav.news')} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {categories.length > 0 ? <CategoryFilter categories={categories} active={category} onChange={setCategory} /> : <span />}
        <ListSearchInput value={query} onChange={setQuery} placeholder={t('news.searchPlaceholder')} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('news.noMatches')} />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((item) => (
            <HighlightItem key={item.id} highlighted={highlightId === item.id}>
              <NewsCard item={item} />
            </HighlightItem>
          ))}
        </ul>
      )}
    </>
  );
}

export function NewsCard({ item, clamp = false }: { item: NewsItem; clamp?: boolean }) {
  const { t, language } = useI18n();
  const Icon = item.icon ? getIcon(item.icon) : null;
  return (
    <Panel className={`p-4 ${item.featured ? 'border-accent/40' : ''}`}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-base-muted">
        {Icon && <Icon className="h-3.5 w-3.5 text-base-muted" aria-hidden="true" />}
        <time dateTime={item.date}>{formatDate(item.date, language)}</time>
        {item.version && <span dir="ltr" className="font-mono text-accent-secondary">{item.version}</span>}
        {item.category && <Badge>{item.category}</Badge>}
        {item.featured && <Badge tone="accent">{t('news.featured')}</Badge>}
        <PriorityBadge priority={item.priority} />
      </div>
      <h3 className="mt-1.5 break-words text-sm font-medium text-base-text">{item.title}</h3>
      <p className={`mt-1 break-words text-sm text-base-muted ${clamp ? 'line-clamp-3' : ''}`}>{item.description}</p>
      {item.url && (
        <ExternalLink href={item.url} className="hs-focus-ring mt-2 inline-flex items-center gap-1 rounded text-sm font-medium text-accent hover:underline">
          {t('common.readMore')}
          <ExternalLinkIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">({t('common.opensExternally')})</span>
        </ExternalLink>
      )}
    </Panel>
  );
}
