import { AlertTriangle, CheckCircle2, HelpCircle, Loader2, XCircle, type LucideIcon } from 'lucide-react';

export type StatusState = 'online' | 'offline' | 'warning' | 'unknown';

const ICONS: Record<StatusState, LucideIcon> = {
  online: CheckCircle2,
  offline: XCircle,
  warning: AlertTriangle,
  unknown: HelpCircle,
};

const TONES: Record<StatusState, string> = {
  online: 'text-status-online',
  offline: 'text-status-critical',
  warning: 'text-status-warn',
  unknown: 'text-base-muted',
};

interface Props {
  state: StatusState;
  label: string;
  /** Show the spinner glyph instead of the state glyph (e.g. a resource that is starting). */
  busy?: boolean;
  className?: string;
}

/**
 * The single status indicator used across ServerHub. State is always
 * conveyed by BOTH a distinct glyph and a text label - never color alone.
 */
export function StatusPill({ state, label, busy = false, className = '' }: Props) {
  const Icon = busy ? Loader2 : ICONS[state];
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm text-base-muted ${className}`}>
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${TONES[state]} ${busy ? 'animate-spin motion-reduce:animate-none' : ''}`}
        aria-hidden="true"
      />
      <span>{label}</span>
    </span>
  );
}
