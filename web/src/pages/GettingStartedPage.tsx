import { ChevronRight } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { ExternalLink } from '../components/ExternalLink';
import { Panel } from '../components/Panel';
import { getIcon } from '../lib/icons';
import { useI18n } from '../hooks/useI18n';
import type { ContentPayload, SectionId } from '../types/content';

interface Props {
  steps: ContentPayload['gettingStarted']['steps'];
  onNavigate: (section: SectionId) => void;
}

export function GettingStartedPage({ steps, onNavigate }: Props) {
  const { t } = useI18n();

  if (steps.length === 0) {
    return <EmptyState message={t('gettingStarted.empty')} />;
  }

  return (
    <ol className="flex flex-col gap-2">
      {steps.map((step, index) => {
        const Icon = getIcon(step.icon);
        return (
          <li key={step.id}>
            <Panel className="flex items-start gap-4 p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-sm text-accent">
                {String(index + 1).padStart(2, '0')}
              </div>
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-base-muted" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-base-text">{step.title}</p>
                <p className="mt-1 text-sm text-base-muted">{step.description}</p>
                {step.linkTarget && (
                  <button
                    type="button"
                    onClick={() => onNavigate(step.linkTarget as SectionId)}
                    className="hs-focus-ring mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                  >
                    {step.linkLabel ?? step.linkTarget}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
                {step.linkUrl && !step.linkTarget && (
                  <ExternalLink
                    href={step.linkUrl}
                    className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                  >
                    {step.linkLabel ?? step.linkUrl}
                    <ChevronRight className="h-3.5 w-3.5" />
                  </ExternalLink>
                )}
              </div>
            </Panel>
          </li>
        );
      })}
    </ol>
  );
}
