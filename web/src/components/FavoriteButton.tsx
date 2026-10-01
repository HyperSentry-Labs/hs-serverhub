import { Pin } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

interface Props {
  title: string;
  pinned: boolean;
  onToggle: () => void;
}

export function FavoriteButton({ title, pinned, onToggle }: Props) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      aria-pressed={pinned}
      aria-label={t(pinned ? 'common.unpin' : 'common.pin', { title })}
      title={t(pinned ? 'common.unpin' : 'common.pin', { title })}
      onClick={onToggle}
      className={`hs-focus-ring shrink-0 rounded-hs p-1.5 transition-colors ${
        pinned ? 'text-accent' : 'text-base-muted/70 hover:text-base-text'
      }`}
    >
      <Pin className={`h-3.5 w-3.5 ${pinned ? 'fill-current' : ''}`} aria-hidden="true" />
    </button>
  );
}
