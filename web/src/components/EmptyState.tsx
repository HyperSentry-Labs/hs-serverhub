import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';

export function EmptyState({ icon: Icon = Info, message }: { icon?: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-hs border border-dashed border-base-border py-16 text-center text-base-muted">
      <Icon className="h-6 w-6" aria-hidden="true" />
      <p className="max-w-xs text-sm">{message}</p>
    </div>
  );
}
