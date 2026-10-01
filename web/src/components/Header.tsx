import { X } from 'lucide-react';
import type { RefObject } from 'react';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { StatusPill } from './StatusPill';
import { useI18n } from '../hooks/useI18n';
import type { SearchResultItem } from '../lib/search';
import type { ContentPayload, StatusSnapshot } from '../types/content';

interface Props {
  content: ContentPayload;
  status: StatusSnapshot | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectResult: (result: SearchResultItem) => void;
  onClose: () => void;
  searchInputRef: RefObject<HTMLInputElement>;
}

export function Header({ content, status, query, onQueryChange, onSelectResult, onClose, searchInputRef }: Props) {
  const { t } = useI18n();
  const showStatus = content.overview.ShowLiveStats && content.status.enabled && status;

  return (
    <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-base-border px-4 py-3 sm:px-5">
      <Logo src={content.general.Logo} serverName={content.general.ServerName} />

      <div className="min-w-0 flex-1 basis-40">
        <h1 className="truncate text-base font-semibold leading-tight text-base-text" title={content.general.ServerName}>
          {content.general.ServerName}
        </h1>
        {content.general.Subtitle && (
          <p className="hidden truncate text-xs text-base-muted sm:block" title={content.general.Subtitle}>
            {content.general.Subtitle}
          </p>
        )}
      </div>

      {showStatus && (
        <StatusPill
          className="hidden md:inline-flex"
          state="online"
          label={t('status.playersValue', { online: status.online, max: status.max })}
        />
      )}

      <div className="order-last w-full sm:order-none sm:w-auto">
        <SearchBar
          content={content}
          query={query}
          onQueryChange={onQueryChange}
          onSelect={onSelectResult}
          inputRef={searchInputRef}
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={t('app.close')}
        title={t('app.close')}
        className="hs-focus-ring shrink-0 rounded-hs border border-base-border p-2 text-base-muted transition-colors hover:border-accent hover:text-accent"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </header>
  );
}
