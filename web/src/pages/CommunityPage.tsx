import { ExternalLink as ExternalLinkIcon } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { ExternalLink } from '../components/ExternalLink';
import { Panel } from '../components/Panel';
import { getIcon } from '../lib/icons';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload } from '../types/content';

export function CommunityPage({ community }: { community: ContentPayload['community'] }) {
  const { t } = useI18n();

  if (community.links.length === 0) {
    return <EmptyState message={t('community.empty')} />;
  }

  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {community.links.map((link) => {
        const Icon = getIcon(link.icon);
        return (
          <li key={link.id}>
            <ExternalLink href={link.url} className="block">
              <Panel className="flex items-start gap-3 p-4 transition-colors hover:border-accent/50">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-base-text">{link.label}</p>
                  {link.description && <p className="mt-1 text-sm text-base-muted">{link.description}</p>}
                </div>
                <ExternalLinkIcon className="h-4 w-4 shrink-0 text-base-muted" aria-hidden="true" />
              </Panel>
            </ExternalLink>
          </li>
        );
      })}
    </ul>
  );
}
