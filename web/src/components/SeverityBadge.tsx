import { Badge, type BadgeTone } from './Badge';
import { useI18n } from '../hooks/useI18n';
import type { Priority, Severity } from '../types/content';

const SEVERITY_TONE: Record<Severity, BadgeTone> = { info: 'neutral', warning: 'warning', critical: 'critical' };
const PRIORITY_TONE: Record<Priority, BadgeTone> = { normal: 'neutral', important: 'warning', critical: 'critical' };

/** Rule severity. `info` is the default and is still labelled, so it is never colour-only. */
export function SeverityBadge({ severity = 'info' }: { severity?: Severity }) {
  const { t } = useI18n();
  const safe: Severity = severity in SEVERITY_TONE ? severity : 'info';
  return <Badge tone={SEVERITY_TONE[safe]}>{t(`severity.${safe}`)}</Badge>;
}

/** Announcement priority. Normal announcements show no badge at all. */
export function PriorityBadge({ priority = 'normal' }: { priority?: Priority }) {
  const { t } = useI18n();
  if (priority === 'normal' || !(priority in PRIORITY_TONE)) return null;
  return <Badge tone={PRIORITY_TONE[priority]}>{t(`priority.${priority}`)}</Badge>;
}
