import { X } from 'lucide-react';
import { Logo } from './Logo';
import { SearchBar } from './SearchBar';
import { StatusPill } from './StatusPill';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload, SectionId, StatusSnapshot } from '../types/content';

interface Props {
  content: ContentPayload;
  status: StatusSnapshot | null;
  query: string;
  onQueryChange: (query: string) => void;
  onNavigate: (section: SectionId) => void;
  onClose: () => void;
}

export function Header({ content, status, query, onQueryChange, onNavigate, onClose }: Props) {
  const { t } = useI18n();
  const showStats = content.overview.ShowLiveStats && content.status.enabled && status;

  return (
    <header className="flex items-center gap-4 border-b border-base-border px-5 py-3">
      <Logo src={content.general.Logo} serverName={content.general.ServerName} />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <h1 className="truncate text-base font-semibold text-base-text">{content.general.ServerName}</h1>
          {showStats && (
            <StatusPill online label={`${status!.online} / ${status!.max} ${t('status.players')}`} />
          )}
        </div>
        {content.general.Subtitle && (
          <p className="truncate text-xs text-base-muted">{content.general.Subtitle}</p>
        )}
      </div>

      <SearchBar content={content} query={query} onQueryChange={onQueryChange} onNavigate={onNavigate} />

      <button
        type="button"
        onClick={onClose}
        aria-label={t('app.close')}
        className="hs-focus-ring shrink-0 rounded-hs border border-base-border p-2 text-base-muted transition-colors hover:border-accent hover:text-accent"
      >
        <X className="h-4 w-4" />
      </button>
    </header>
  );
}
