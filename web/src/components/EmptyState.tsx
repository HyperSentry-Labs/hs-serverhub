import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Info } from 'lucide-react';

export function EmptyState({
  icon: Icon = Info,
  message,
  children,
}: {
  icon?: LucideIcon;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-3 rounded-hs border border-dashed border-base-border px-4 py-14 text-center text-base-muted"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <p className="max-w-xs text-sm">{message}</p>
      {children}
    </div>
  );
}
