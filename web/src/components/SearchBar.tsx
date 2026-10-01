import { useEffect, useId, useMemo, useState, type KeyboardEvent, type RefObject } from 'react';
import { Search, X } from 'lucide-react';
import { flattenResults, searchContent, type SearchResultItem } from '../lib/search';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload } from '../types/content';

interface Props {
  content: ContentPayload;
  query: string;
  onQueryChange: (query: string) => void;
  onSelect: (result: SearchResultItem) => void;
  inputRef: RefObject<HTMLInputElement>;
}

/**
 * Cross-section search, implemented as an ARIA combobox: the input keeps
 * focus while ArrowUp/ArrowDown move a virtual highlight through the
 * grouped results, Enter opens the highlighted (or first) result, and
 * Escape clears the query first - only an Escape with nothing left to
 * clear falls through to close ServerHub itself.
 */
export function SearchBar({ content, query, onQueryChange, onSelect, inputRef }: Props) {
  const { t, dir } = useI18n();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const groups = useMemo(() => searchContent(content, query), [content, query]);
  const flat = useMemo(() => flattenResults(groups), [groups]);
  const showDropdown = open && query.trim().length > 0;

  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  const optionId = (index: number) => `${listId}-opt-${index}`;

  const choose = (result: SearchResultItem) => {
    setOpen(false);
    onQueryChange('');
    onSelect(result);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        if (flat.length === 0) return;
        event.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (i + 1) % flat.length);
        break;
      case 'ArrowUp':
        if (flat.length === 0) return;
        event.preventDefault();
        setOpen(true);
        setActiveIndex((i) => (i <= 0 ? flat.length - 1 : i - 1));
        break;
      case 'Enter': {
        const target = flat[activeIndex] ?? flat[0];
        if (showDropdown && target) {
          event.preventDefault();
          choose(target);
        }
        break;
      }
      case 'Escape':
        if (query.length > 0 || open) {
          // Consume it: the first Escape only dismisses search, it must not close ServerHub.
          event.preventDefault();
          event.stopPropagation();
          setOpen(false);
          onQueryChange('');
        }
        break;
    }
  };

  let optionCounter = -1;

  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-base-muted" aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-label={t('app.searchLabel')}
        aria-expanded={showDropdown}
        aria-controls={showDropdown ? listId : undefined}
        aria-activedescendant={showDropdown && activeIndex >= 0 ? optionId(activeIndex) : undefined}
        aria-autocomplete="list"
        autoComplete="off"
        spellCheck={false}
        value={query}
        onChange={(e) => {
          onQueryChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder={t('app.searchPlaceholder')}
        className="hs-focus-ring w-full rounded-hs border border-base-border bg-base-panel-raised py-2 pe-16 ps-9 text-sm text-base-text placeholder:text-base-muted focus:border-accent"
      />
      {query.length > 0 ? (
        <button
          type="button"
          aria-label={t('app.clearSearch')}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            onQueryChange('');
            inputRef.current?.focus();
          }}
          className="hs-focus-ring absolute end-2 top-1/2 -translate-y-1/2 rounded p-1 text-base-muted hover:text-base-text"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute end-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-base-border px-1.5 py-0.5 font-mono text-[10px] text-base-muted sm:block"
        >
          {t('app.searchHint')}
        </kbd>
      )}

      {showDropdown && (
        <div
          dir={dir}
          className="absolute end-0 start-0 top-[calc(100%+6px)] z-20 max-h-96 overflow-y-auto rounded-hs border border-base-border bg-base-panel-raised shadow-lg"
        >
          {groups.length === 0 ? (
            <p role="status" className="px-3 py-4 text-sm text-base-muted">
              {t('app.noSearchResults', { query: query.trim() })}
            </p>
          ) : (
            <div id={listId} role="listbox" aria-label={t('app.searchResults')}>
              {groups.map((group) => (
                <div key={group.section} role="group" aria-label={t(group.labelKey)} className="border-b border-base-border py-1.5 last:border-b-0">
                  <p aria-hidden="true" className="px-3 pb-1 pt-0.5 text-[11px] font-semibold uppercase tracking-wider text-base-muted">
                    {t(group.labelKey)}
                  </p>
                  {group.results.map((result) => {
                    optionCounter += 1;
                    const index = optionCounter;
                    const isActive = index === activeIndex;
                    const mono = result.section === 'commands' || result.section === 'keybinds';
                    return (
                      <div
                        key={`${result.section}:${result.id}`}
                        id={optionId(index)}
                        role="option"
                        aria-selected={isActive}
                        onMouseDown={(e) => e.preventDefault()}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => choose(result)}
                        className={`flex cursor-pointer flex-col items-start gap-0.5 px-3 py-1.5 ${
                          isActive ? 'bg-accent/10' : 'hover:bg-base-panel'
                        }`}
                      >
                        <span className={`max-w-full truncate text-sm font-medium ${mono ? 'font-mono text-accent' : 'text-base-text'}`}>
                          {result.title}
                        </span>
                        {result.subtitle && (
                          <span className="line-clamp-1 max-w-full text-xs text-base-muted">{result.subtitle}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
