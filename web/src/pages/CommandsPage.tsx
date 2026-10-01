import { useMemo } from 'react';
import { Terminal } from 'lucide-react';
import { Badge } from '../components/Badge';
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
import type { CommandItem, ContentPayload } from '../types/content';

interface Props {
  commands: ContentPayload['commands'];
  favorites: FavoritesApi;
  highlightId?: string;
}

export function CommandsPage({ commands, favorites, highlightId }: Props) {
  const { t } = useI18n();
  const { category, setCategory, query, setQuery } = useListFilters(highlightId);

  const filtered = useMemo(() => {
    const q = normalizeText(query);
    return commands.items.filter((cmd) => {
      if (category && cmd.category !== category) return false;
      const haystack = normalizeText(
        [cmd.command, cmd.title, cmd.description, cmd.category, cmd.usage, cmd.keybind, ...(cmd.aliases ?? [])].join(' '),
      );
      return matchesAllTerms(haystack, q);
    });
  }, [commands.items, category, query]);

  const groups = useMemo(() => groupByCategory(filtered, commands.categories), [filtered, commands.categories]);
  const showHeadings = category === null && groups.length > 1;

  if (commands.items.length === 0) {
    return (
      <>
        <PageHeader title={t('nav.commands')} />
        <EmptyState message={t('commands.empty')} icon={Terminal} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('nav.commands')} />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CategoryFilter categories={commands.categories} active={category} onChange={setCategory} />
        <ListSearchInput value={query} onChange={setQuery} placeholder={t('commands.searchPlaceholder')} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t('commands.noMatches')} />
      ) : (
        groups.map((group) => (
          <section key={group.id}>
            {showHeadings && <CategoryHeading label={group.label} count={group.items.length} />}
            <ul className="flex flex-col gap-2">
              {group.items.map((cmd) => (
                <HighlightItem key={cmd.id} highlighted={highlightId === cmd.id}>
                  <CommandRow cmd={cmd} pinned={favorites.isFavorite({ kind: 'commands', id: cmd.id })} onTogglePin={() => favorites.toggle({ kind: 'commands', id: cmd.id })} />
                </HighlightItem>
              ))}
            </ul>
          </section>
        ))
      )}
    </>
  );
}

function CommandRow({ cmd, pinned, onTogglePin }: { cmd: CommandItem; pinned: boolean; onTogglePin: () => void }) {
  const { t } = useI18n();
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div dir="ltr" className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-start">
            <code className="break-all font-mono text-sm font-medium text-accent">{cmd.command}</code>
            {cmd.aliases && cmd.aliases.length > 0 && (
              <span className="text-xs text-base-muted">
                {t('commands.aliasLabel')} <span className="font-mono">{cmd.aliases.join(', ')}</span>
              </span>
            )}
          </div>
          <p className="mt-1 break-words text-sm font-medium text-base-text">{cmd.title}</p>
          <p className="break-words text-sm text-base-muted">{cmd.description}</p>
          {cmd.usage && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-xs text-base-muted">
              <span>{t('commands.usage')}</span>
              <code dir="ltr" className="break-all rounded border border-base-border bg-base-panel-raised px-1.5 py-0.5 font-mono text-base-text">
                {cmd.usage}
              </code>
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <FavoriteButton title={cmd.command} pinned={pinned} onToggle={onTogglePin} />
          {cmd.permission && <Badge>{cmd.permission}</Badge>}
          {cmd.keybind && (
            <kbd dir="ltr" className="rounded border border-base-border bg-base-panel-raised px-1.5 py-0.5 font-mono text-xs text-base-text">
              {cmd.keybind}
            </kbd>
          )}
        </div>
      </div>
    </Panel>
  );
}
