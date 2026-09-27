import { Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { searchContent } from '../lib/search';
import type { ContentPayload, SectionId } from '../types/content';
import { useI18n } from '../hooks/useI18n';

interface Props {
  content: ContentPayload;
  query: string;
  onQueryChange: (query: string) => void;
  onNavigate: (section: SectionId) => void;
}

export function SearchBar({ content, query, onQueryChange, onNavigate }: Props) {
  const { t } = useI18n();
  const [focused, setFocused] = useState(false);
  const groups = useMemo(() => searchContent(content, query), [content, query]);
  const showDropdown = focused && query.trim().length > 0;

  return (
    <div className="relative w-full max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" />
      <input
        type="text"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        placeholder={t('app.searchPlaceholder')}
        className="hs-focus-ring w-full rounded-hs border border-base-border bg-base-panel-raised py-2 pl-9 pr-8 text-sm text-base-text placeholder:text-base-muted focus:border-accent"
      />
      {query.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onQueryChange('')}
          className="hs-focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 text-base-muted hover:text-base-text"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-20 max-h-96 overflow-y-auto rounded-hs border border-base-border bg-base-panel-raised shadow-lg">
          {groups.length === 0 ? (
            <p className="px-3 py-4 text-sm text-base-muted">{t('app.noSearchResults', { query })}</p>
          ) : (
            groups.map((group) => (
              <div key={group.section} className="border-b border-base-border py-2 last:border-b-0">
                <p className="px-3 pb-1 text-xs font-medium uppercase tracking-wide text-base-muted">
                  {group.label}
                </p>
                {group.results.map((result) => (
                  <button
                    key={result.id}
                    type="button"
                    onClick={() => {
                      onNavigate(group.section);
                      onQueryChange('');
                    }}
                    className="hs-focus-ring flex w-full flex-col items-start gap-0.5 px-3 py-1.5 text-left hover:bg-base-panel"
                  >
                    <span className="text-sm font-medium text-base-text">{result.title}</span>
                    <span className="line-clamp-1 text-xs text-base-muted">{result.subtitle}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
