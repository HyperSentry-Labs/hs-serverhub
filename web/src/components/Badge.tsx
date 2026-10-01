import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'info' | 'warning' | 'critical' | 'accent';

const TONES: Record<BadgeTone, string> = {
  neutral: 'border-base-border text-base-muted',
  info: 'border-accent-secondary/40 text-accent-secondary',
  warning: 'border-status-warn/40 text-status-warn',
  critical: 'border-status-critical/40 text-status-critical',
  accent: 'border-accent/40 text-accent',
};

export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-xs font-medium ${TONES[tone]}`}>
      {children}
    </span>
  );
}
