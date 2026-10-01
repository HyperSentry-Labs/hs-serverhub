import { useMemo } from 'react';
import { Keyboard } from 'lucide-react';
import { CategoryFilter } from '../components/CategoryFilter';
import { CategoryHeading } from '../components/CategoryHeading';
import { EmptyState } from '../components/EmptyState';
import { FavoriteButton } from '../components/FavoriteButton';
import { HighlightItem } from '../components/HighlightItem';
import { ListSearchInput } from '../components/ListSearchInput';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import type { FavoritesApi } from '../hooks/useFavorites';
import { useI18n } from '../hooks/useI18n';
import { useListFilters } from '../hooks/useListFilters';
import { groupByCategory } from '../lib/group';
import { matchesAllTerms, normalizeText } from '../lib/text';
import type { ContentPayload, KeybindItem } from '../types/content';

interface Props {
  keybinds: ContentPayload['keybinds'];
  favorites: FavoritesApi;
  highlightId?: string;
}

export function KeybindsPage({ keybinds, favorites, highlightId }: Props) {
  const { t } = useI18n();
  const { category, setCategory, query, setQuery } = useListFilters(highlightId);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    return keybinds.items.filter((k) => {
      if (category && k.category !== category) return false;
      const haystack = normalizeText([k.key, k.title, k.description, k.category, k.resource, k.context].join(' '));
      return matchesAllTerms(haystack, q);
    });
  }, [keybinds.items, category, query]);

  const groups = useMemo(() => groupByCategory(filtered, keybinds.categories), [filtered, keybinds.categories]);
  const showHeadings = category === null && groups.length > 1;

  if (keybinds.items.length === 0) {
    return (
      <>
        <PageHeader title={t('nav.keybinds')} />
        <EmptyState message={t('keybinds.empty')} icon={Keyboard} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('nav.keybinds')} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter categories={keybinds.categories} active={category} onChange={setCategory} />
        <ListSearchInput value={query} onChange={setQuery} placeholder={t('keybinds.searchPlaceholder')} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('keybinds.noMatches')} />
      ) : (
        groups.map((group) => (
          <section key={group.id}>
            {showHeadings && <CategoryHeading label={group.label} count={group.items.length} />}
            <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
              {group.items.map((k) => (
                <HighlightItem key={k.id} highlighted={highlightId === k.id}>
                  <KeybindRow item={k} pinned={favorites.isFavorite({ kind: 'keybinds', id: k.id })} onTogglePin={() => favorites.toggle({ kind: 'keybinds', id: k.id })} />
                </HighlightItem>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

function KeybindRow({ item, pinned, onTogglePin }: { item: KeybindItem; pinned: boolean; onTogglePin: () => void }) {
  const { t } = useI18n();
  return (
    <Panel className="flex h-full items-start gap-3 p-3">
      <kbd dir="ltr" className="flex h-9 min-w-[2.25rem] shrink-0 items-center justify-center rounded-hs border border-base-border bg-base-panel-raised px-2 font-mono text-sm text-base-text">
        {item.key}
      </kbd>
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-medium text-base-text">{item.title}</p>
        <p className="break-words text-xs text-base-muted">{item.description}</p>
        {(item.context || item.resource) && (
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-base-muted/80">
            {item.context && (
              <span>
                {t('keybinds.context')}: {item.context}
              </span>
            )}
            {item.resource && (
              <span>
                {t('keybinds.resource')}: <span dir="ltr" className="font-mono">{item.resource}</span>
              </span>
            )}
          </p>
        )}
      </div>
      <FavoriteButton title={`${item.title} (${item.key})`} pinned={pinned} onToggle={onTogglePin} />
    </Panel>
  );
}
