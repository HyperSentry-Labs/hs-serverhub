import { ExternalLink as ExternalLinkIcon, Users } from 'lucide-react';
import { CategoryHeading } from '../components/CategoryHeading';
import { EmptyState } from '../components/EmptyState';
import { ExternalLink } from '../components/ExternalLink';
import { HighlightItem } from '../components/HighlightItem';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { useI18n } from '../hooks/useI18n';
import { getIcon } from '../lib/icons';
import type { CommunityLink, ContentPayload } from '../types/content';

interface Props {
  community: ContentPayload['community'];
  highlightId?: string;
}

export function CommunityPage({ community, highlightId }: Props) {
  const { t } = useI18n();
  // Groups win when configured; empty groups are hidden (a group with no
  // usable links has nothing to show). Otherwise fall back to the flat list.
  const groups = community.groups.filter((g) => g.links.length > 0);
  const hasContent = groups.length > 0 || community.links.length > 0;

  if (!hasContent) {
    return (
      <>
        <PageHeader title={t('nav.community')} />
        <EmptyState message={t('community.empty')} icon={Users} />
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('nav.community')} />
      {groups.length > 0 ? (
        groups.map((group) => (
          <section key={group.id} aria-label={group.label}>
            <CategoryHeading label={group.label} count={group.links.length} />
            <LinkGrid links={group.links} highlightId={highlightId} />
          </section>
        ))
      ) : (
        <LinkGrid links={community.links} highlightId={highlightId} />
      )}
    </>
  );
}

function LinkGrid({ links, highlightId }: { links: CommunityLink[]; highlightId?: string }) {
  const { t } = useI18n();
  return (
    <ul className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      {links.map((link) => {
        const Icon = getIcon(link.icon);
        return (
          <HighlightItem key={link.id} highlighted={highlightId === link.id}>
            <ExternalLink href={link.url} className="hs-focus-ring block rounded-hs">
              <Panel className="flex items-start gap-3 p-4 transition-colors hover:border-accent/50">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-medium text-base-text">{link.label}</p>
                  {link.description && <p className="mt-0.5 break-words text-sm text-base-muted">{link.description}</p>}
                </div>
                <ExternalLinkIcon className="h-4 w-4 shrink-0 text-base-muted" aria-hidden="true" />
                <span className="sr-only">({t('common.opensExternally')})</span>
              </Panel>
            </ExternalLink>
          </HighlightItem>
        );
      })}
    </ul>
  );
}
