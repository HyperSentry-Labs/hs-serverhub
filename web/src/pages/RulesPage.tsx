import { useMemo, useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { CategoryFilter } from '../components/CategoryFilter';
import { CategoryHeading } from '../components/CategoryHeading';
import { EmptyState } from '../components/EmptyState';
import { FavoriteButton } from '../components/FavoriteButton';
import { HighlightItem } from '../components/HighlightItem';
import { ListSearchInput } from '../components/ListSearchInput';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { SeverityBadge } from '../components/SeverityBadge';
import type { FavoritesApi } from '../hooks/useFavorites';
import { useI18n } from '../hooks/useI18n';
import { useListFilters } from '../hooks/useListFilters';
import { groupByCategory } from '../lib/group';
import { matchesAllTerms, normalizeText } from '../lib/text';
import type { ContentPayload, RuleItem } from '../types/content';

interface Props {
  rules: ContentPayload['rules'];
  favorites: FavoritesApi;
  highlightId?: string;
}

const LONG_DESCRIPTION = 200;

export function RulesPage({ rules, favorites, highlightId }: Props) {
  const { t } = useI18n();
  const { category, setCategory, query, setQuery } = useListFilters(highlightId);

  const labels = useMemo(() => new Map(rules.categories.map((c) => [c.id, c.label])), [rules.categories]);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    return rules.items.filter((rule) => {
      if (category && rule.category !== category) return false;
      const haystack = normalizeText(`${rule.title} ${rule.description} ${rule.id} ${labels.get(rule.category) ?? rule.category}`);
      return matchesAllTerms(haystack, q);
    });
  }, [rules.items, category, query, labels]);

  const groups = useMemo(() => groupByCategory(filtered, rules.categories), [filtered, rules.categories]);
  const showHeadings = category === null && groups.length > 1;

  if (rules.items.length === 0) {
    return (
      <>
        <PageHeader title={t('nav.rules')} />
        <EmptyState message={t('rules.empty')} icon={ShieldCheck} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('nav.rules')} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter categories={rules.categories} active={category} onChange={setCategory} />
        <ListSearchInput value={query} onChange={setQuery} placeholder={t('rules.searchPlaceholder')} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('rules.noMatches')} />
      ) : (
        groups.map((group) => (
          <section key={group.id}>
            {showHeadings && <CategoryHeading label={group.label} count={group.items.length} />}
            <ul className="flex flex-col gap-2">
              {group.items.map((rule) => (
                <HighlightItem key={rule.id} highlighted={highlightId === rule.id}>
                  <RuleRow rule={rule} pinned={favorites.isFavorite({ kind: 'rules', id: rule.id })} onTogglePin={() => favorites.toggle({ kind: 'rules', id: rule.id })} autoExpand={highlightId === rule.id} />
                </HighlightItem>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

function RuleRow({ rule, pinned, onTogglePin, autoExpand }: { rule: RuleItem; pinned: boolean; onTogglePin: () => void; autoExpand: boolean }) {
  const { t } = useI18n();
  const isLong = rule.description.length > LONG_DESCRIPTION || rule.description.includes('\n');
  const [expanded, setExpanded] = useState(false);
  const open = expanded || autoExpand || !isLong;

  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="min-w-0 break-words text-sm font-medium text-base-text">{rule.title}</h4>
            <SeverityBadge severity={rule.severity} />
          </div>
          <p className={`mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-base-muted ${open ? '' : 'line-clamp-2'}`}>
            {rule.description}
          </p>
          {isLong && !autoExpand && (
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setExpanded((v) => !v)}
              className="hs-focus-ring mt-1.5 inline-flex items-center gap-1 rounded text-xs font-medium text-accent hover:underline"
            >
              {t(open ? 'common.showLess' : 'common.showMore')}
              <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <FavoriteButton title={rule.title} pinned={pinned} onToggle={onTogglePin} />
          <span dir="ltr" className="font-mono text-[10px] text-base-muted/70" title={t('rules.ruleId', { id: rule.id })}>
            {rule.id}
          </span>
        </div>
      </div>
    </Panel>
  );
}
