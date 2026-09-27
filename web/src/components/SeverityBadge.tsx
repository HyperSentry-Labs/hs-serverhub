import type { Severity } from '../types/content';

const STYLES: Record<Severity, string> = {
  info: 'text-base-muted border-base-border',
  warning: 'text-status-warn border-status-warn/40',
  critical: 'text-status-critical border-status-critical/40',
};

const LABELS: Record<Severity, string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
};

export function SeverityBadge({ severity = 'info' }: { severity?: Severity }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium ${STYLES[severity]}`}
    >
      {LABELS[severity]}
    </span>
  );
}
