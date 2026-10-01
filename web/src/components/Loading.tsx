import { Loader2 } from 'lucide-react';
import { useI18n } from '../hooks/useI18n';

export function Loading() {
  const { t } = useI18n();
  return (
    <div role="status" className="flex items-center justify-center gap-2 py-20 text-sm text-base-muted">
      <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      {t('app.loading')}
    </div>
  );
}
