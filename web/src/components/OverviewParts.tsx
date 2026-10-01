import { ExternalLink as ExternalLinkIcon, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { ExternalLink } from './ExternalLink';
import { StatusPill, type StatusState } from './StatusPill';
import { useI18n } from '../hooks/useI18n';
import { getIcon } from '../lib/icons';
import type { PinnedItem } from '../lib/pinned';
import type { QuickLink, ResourceState, SectionId } from '../types/content';

export function SectionLabel({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-base-muted">{children}</h3>
      {actions}
    </div>
  );
}

const RESOURCE_STATE: Record<ResourceState, { state: StatusState; key: string; busy?: boolean }> = {
  started: { state: 'online', key: 'status.started' },
  starting: { state: 'warning', key: 'status.starting', busy: true },
  stopped: { state: 'offline', key: 'status.stopped' },
  unknown: { state: 'unknown', key: 'status.unknown' },
};

export function ResourceChip({ name, state }: { name: string; state: ResourceState }) {
  const { t } = useI18n();
  const meta = RESOURCE_STATE[state] ?? RESOURCE_STATE.unknown;
  return (
    <li className="flex items-center gap-1.5 rounded-full border border-base-border px-2.5 py-1 text-xs">
      <span dir="ltr" className="font-mono text-base-text">{name}</span>
      <StatusPill state={meta.state} busy={meta.busy} label={t(meta.key)} className="!text-xs" />
    </li>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span dir="ltr" className="font-mono text-sm text-base-text">{value}</span>
      <span className="text-xs text-base-muted">{label}</span>
    </div>
  );
}

const TILE =
  'hs-focus-ring flex h-full flex-col items-center gap-2 rounded-hs border border-base-border bg-base-panel p-4 text-center transition-colors hover:border-accent/50 hover:bg-base-panel-raised';

export function QuickActionTile({ link, onNavigate }: { link: QuickLink; onNavigate: (section: SectionId) => void }) {
  const { t } = useI18n();
  const Icon = getIcon(link.icon);
  const body = (
    <>
      <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
      <span className="flex items-center gap-1 text-sm text-base-text">
        {link.label}
        {link.type === 'url' && <ExternalLinkIcon className="h-3 w-3 text-base-muted" aria-hidden="true" />}
      </span>
    </>
  );

  if (link.type === 'url') {
    return (
      <ExternalLink href={link.url} className={TILE}>
        {body}
        <span className="sr-only">({t('common.opensExternally')})</span>
      </ExternalLink>
    );
  }
  return (
    <button type="button" className={TILE} onClick={() => link.target && onNavigate(link.target)}>
      {body}
    </button>
  );
}

export function PinnedRow({ item, onOpen, onUnpin }: { item: PinnedItem; onOpen: () => void; onUnpin: () => void }) {
  const { t } = useI18n();
  const mono = item.section === 'commands' || item.section === 'keybinds';
  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <button type="button" onClick={onOpen} className="hs-focus-ring min-w-0 flex-1 rounded text-start">
        <span className={`block truncate text-sm font-medium ${mono ? 'font-mono text-accent' : 'text-base-text'}`}>{item.title}</span>
        <span className="block truncate text-xs text-base-muted">{item.subtitle}</span>
      </button>
      <button
        type="button"
        aria-label={t('common.unpin', { title: item.title })}
        onClick={onUnpin}
        className="hs-focus-ring shrink-0 rounded p-1 text-base-muted hover:text-base-text"
      >
        <X className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </li>
  );
}

