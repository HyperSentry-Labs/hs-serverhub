import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import { ExternalLink } from '../components/ExternalLink';
import { PinnedRow, QuickActionTile, ResourceChip, SectionLabel, Stat } from '../components/OverviewParts';
import { Panel } from '../components/Panel';
import { ProgressBar } from '../components/ProgressBar';
import { StatusPill } from '../components/StatusPill';
import { NewsCard } from './NewsPage';
import type { FavoritesApi } from '../hooks/useFavorites';
import { useI18n } from '../hooks/useI18n';
import type { ProgressApi } from '../hooks/useProgress';
import { formatUptime, pickFeaturedNews } from '../lib/format';
import { getIcon } from '../lib/icons';
import { resolvePinned } from '../lib/pinned';
import type { ContentPayload, SectionId, StatusSnapshot } from '../types/content';

interface Props {
  content: ContentPayload;
  status: StatusSnapshot | null;
  favorites: FavoritesApi;
  progress: ProgressApi;
  onNavigate: (section: SectionId, highlightId?: string) => void;
}

/** Home screen: identity -> live state -> quick actions -> what's new / next -> pinned -> community. */
export function OverviewPage({ content, status, favorites, progress, onNavigate }: Props) {
  const { t } = useI18n();
  const { overview, general } = content;

  const announcement = overview.ShowLatestAnnouncement ? pickFeaturedNews(content.news.items) : undefined;
  const showLive = overview.ShowLiveStats && content.status.enabled;
  const pinned = useMemo(() => resolvePinned(content, favorites.favorites), [content, favorites.favorites]);
  const communityLinks = useMemo(
    () => (content.community.links.length > 0 ? content.community.links : content.community.groups.flatMap((g) => g.links)).slice(0, 4),
    [content.community],
  );

  const steps = content.gettingStarted.steps;
  const showGuide = content.gettingStarted.enableProgress && steps.length > 0;
  const done = steps.filter((s) => progress.completed.has(s.id)).length;
  const nextStep = steps.find((s) => !progress.completed.has(s.id));

  return (
    <div className="flex flex-col gap-6">
      <Panel className="p-5 sm:p-6">
        <h2 className="break-words text-xl font-semibold tracking-tight text-base-text">
          {t('overview.welcome', { name: general.ServerName })}
        </h2>
        {general.Subtitle && <p className="mt-0.5 break-words text-sm text-accent">{general.Subtitle}</p>}
        {general.Description && <p className="mt-3 max-w-2xl break-words text-sm leading-relaxed text-base-muted">{general.Description}</p>}

        {showLive && (
          <div className="mt-5 flex flex-col gap-3 border-t border-base-border pt-4">
            {status ? (
              <>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <StatusPill state="online" label={t('status.online')} />
                  <Stat label={t('status.players')} value={`${status.online} / ${status.max}`} />
                  {content.status.showUptime && status.uptimeSeconds !== undefined && (
                    <Stat label={t('status.uptime')} value={formatUptime(status.uptimeSeconds)} />
                  )}
                  {content.stats.map((stat) => (
                    <Stat key={stat.key} label={stat.label} value={String(stat.value)} />
                  ))}
                </div>
                {status.max > 0 && (
                  <ProgressBar value={status.online} max={status.max} label={t('status.players')} />
                )}
                {status.monitoredResources.length > 0 && (
                  <ul aria-label={t('status.resources')} className="flex flex-wrap gap-2">
                    {status.monitoredResources.map((res) => (
                      <ResourceChip key={res.name} name={res.name} state={res.state} />
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <StatusPill state="unknown" label={t('status.unavailable')} />
            )}
          </div>
        )}
      </Panel>

      {overview.QuickLinks.length > 0 && (
        <section>
          <SectionLabel>{t('overview.quickAccess')}</SectionLabel>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {overview.QuickLinks.map((link) => (
              <li key={link.id}>
                <QuickActionTile link={link} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {overview.ShowLatestAnnouncement && (
          <section>
            <SectionLabel
              actions={
                <button type="button" onClick={() => onNavigate('news')} className="hs-focus-ring rounded text-xs text-accent hover:underline">
                  {t('overview.viewAll')}
                </button>
              }
            >
              {t(announcement?.featured ? 'overview.featuredAnnouncement' : 'overview.latestAnnouncement')}
            </SectionLabel>
            {announcement ? (
              <NewsCard item={announcement} clamp />
            ) : (
              <Panel className="p-4 text-sm text-base-muted">{t('overview.noAnnouncement')}</Panel>
            )}
          </section>
        )}

        {showGuide && (
          <section>
            <SectionLabel
              actions={
                <button type="button" onClick={() => onNavigate('getting-started')} className="hs-focus-ring rounded text-xs text-accent hover:underline">
                  {t('overview.viewAll')}
                </button>
              }
            >
              {t('overview.gettingStarted')}
            </SectionLabel>
            <Panel className="flex flex-col gap-3 p-4">
              <ProgressBar value={done} max={steps.length} label={t('overview.progress', { done, total: steps.length })} />
              {nextStep ? (
                <button
                  type="button"
                  onClick={() => onNavigate('getting-started', nextStep.id)}
                  className="hs-focus-ring flex items-center gap-2 rounded-hs border border-base-border px-3 py-2 text-start text-sm text-base-text transition-colors hover:border-accent/50"
                >
                  {(() => {
                    const Icon = getIcon(nextStep.icon);
                    return <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />;
                  })()}
                  <span className="min-w-0 flex-1 truncate">{t('overview.nextStep', { title: nextStep.title })}</span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-base-muted rtl:rotate-180" aria-hidden="true" />
                </button>
              ) : (
                <p className="text-sm text-base-muted">{t('overview.allDone')}</p>
              )}
            </Panel>
          </section>
        )}
      </div>

      {pinned.length > 0 && (
        <section>
          <SectionLabel
            actions={
              <button type="button" onClick={favorites.clear} className="hs-focus-ring rounded text-xs text-base-muted hover:text-base-text">
                {t('overview.clearPinned')}
              </button>
            }
          >
            {t('overview.pinned')}
          </SectionLabel>
          <Panel>
            <ul className="divide-y divide-base-border">
              {pinned.map((item) => (
                <PinnedRow
                  key={`${item.ref.kind}:${item.ref.id}`}
                  item={item}
                  onOpen={() => onNavigate(item.section, item.ref.id)}
                  onUnpin={() => favorites.toggle(item.ref)}
                />
              ))}
            </ul>
          </Panel>
        </section>
      )}

      {communityLinks.length > 0 && (
        <section>
          <SectionLabel
            actions={
              <button type="button" onClick={() => onNavigate('community')} className="hs-focus-ring rounded text-xs text-accent hover:underline">
                {t('overview.viewAll')}
              </button>
            }
          >
            {t('overview.community')}
          </SectionLabel>
          <Panel>
            <ul className="divide-y divide-base-border">
              {communityLinks.map((link) => (
                <li key={link.id}>
                  <ExternalLink href={link.url} className="hs-focus-ring flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-base-text transition-colors hover:text-accent">
                    <span className="truncate">{link.label}</span>
                    <span className="sr-only">({t('common.opensExternally')})</span>
                  </ExternalLink>
                </li>
              ))}
            </ul>
          </Panel>
        </section>
      )}
    </div>
  );
}

