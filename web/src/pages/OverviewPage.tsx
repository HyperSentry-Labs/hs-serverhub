import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { ExternalLink } from '../components/ExternalLink';
import { Panel } from '../components/Panel';
import { StatusPill } from '../components/StatusPill';
import { formatDate, formatUptime } from '../lib/format';
import { getIcon } from '../lib/icons';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload, SectionId, StatusSnapshot } from '../types/content';

interface Props {
  content: ContentPayload;
  status: StatusSnapshot | null;
  onNavigate: (section: SectionId) => void;
}

export function OverviewPage({ content, status, onNavigate }: Props) {
  const { t } = useI18n();
  const { overview, general } = content;
  const latestAnnouncement = overview.ShowLatestAnnouncement ? content.news.items[0] : undefined;
  const showStats = overview.ShowLiveStats && content.status.enabled && status;

  return (
    <div className="flex flex-col gap-6">
      <Panel className="p-6">
        <h2 className="text-xl font-semibold text-base-text">Welcome to {general.ServerName}</h2>
        {general.Description && <p className="mt-2 max-w-2xl text-sm text-base-muted">{general.Description}</p>}

        {showStats && (
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-base-border pt-4">
            <StatusPill online label={t('status.online')} />
            <Stat label={t('status.players')} value={`${status!.online} / ${status!.max}`} />
            {content.status.showUptime && status!.uptimeSeconds !== undefined && (
              <Stat label={t('status.uptime')} value={formatUptime(status!.uptimeSeconds)} />
            )}
            {status!.monitoredResources.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {status!.monitoredResources.map((res) => (
                  <span key={res.name} className="flex items-center gap-1.5 text-xs text-base-muted">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${res.running ? 'bg-status-online' : 'bg-status-critical'}`}
                    />
                    <span className="font-mono">{res.name}</span>
                  </span>
                ))}
              </div>
            )}
            {content.stats.map((stat) => (
              <Stat key={stat.key} label={stat.label} value={String(stat.value)} />
            ))}
          </div>
        )}
      </Panel>

      {overview.QuickLinks.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-base-muted">
            {t('overview.quickAccess')}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {overview.QuickLinks.map((ql) => {
              const Icon = getIcon(ql.icon);
              return (
                <button
                  key={ql.id}
                  type="button"
                  onClick={() => onNavigate(ql.target)}
                  className="hs-focus-ring flex flex-col items-center gap-2 rounded-hs border border-base-border bg-base-panel p-4 text-center transition-colors hover:border-accent/50 hover:bg-base-panel-raised"
                >
                  <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                  <span className="text-sm text-base-text">{ql.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-base-muted">
            {t('overview.latestAnnouncement')}
          </p>
          {latestAnnouncement ? (
            <Panel className="p-4">
              <div className="flex items-center gap-2 text-xs text-base-muted">
                <span>{formatDate(latestAnnouncement.date)}</span>
                {latestAnnouncement.category && (
                  <span className="rounded-full border border-base-border px-2 py-0.5">
                    {latestAnnouncement.category}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm font-medium text-base-text">{latestAnnouncement.title}</p>
              <p className="mt-1 text-sm text-base-muted">{latestAnnouncement.description}</p>
            </Panel>
          ) : (
            <Panel className="p-4 text-sm text-base-muted">{t('overview.noAnnouncement')}</Panel>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-base-muted">
            {t('overview.community')}
          </p>
          <Panel className="flex flex-col divide-y divide-base-border">
            {content.community.links.slice(0, 3).map((link) => (
              <ExternalLink
                key={link.id}
                href={link.url}
                className="flex items-center justify-between gap-2 px-4 py-3 text-sm text-base-text hover:text-accent"
              >
                {link.label}
                <ExternalLinkIcon className="h-3.5 w-3.5 text-base-muted" aria-hidden="true" />
              </ExternalLink>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 text-sm">
      <span className="font-mono text-base-text">{value}</span>
      <span className="text-xs text-base-muted">{label}</span>
    </div>
  );
}
