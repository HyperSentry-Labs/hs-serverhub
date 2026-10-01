import { Check, ChevronRight, Compass, RotateCcw } from 'lucide-react';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { ExternalLink } from '../components/ExternalLink';
import { HighlightItem } from '../components/HighlightItem';
import { PageHeader } from '../components/PageHeader';
import { Panel } from '../components/Panel';
import { ProgressBar } from '../components/ProgressBar';
import { useI18n } from '../hooks/useI18n';
import type { ProgressApi } from '../hooks/useProgress';
import { getIcon } from '../lib/icons';
import type { ContentPayload, GettingStartedStep, SectionId } from '../types/content';

interface Props {
  gettingStarted: ContentPayload['gettingStarted'];
  progress: ProgressApi;
  onNavigate: (section: SectionId, highlightId?: string) => void;
  highlightId?: string;
}

export function GettingStartedPage({ gettingStarted, progress, onNavigate, highlightId }: Props) {
  const { t } = useI18n();
  const { steps, enableProgress } = gettingStarted;

  if (steps.length === 0) {
    return (
      <>
        <PageHeader title={t('nav.gettingStarted')} />
        <EmptyState message={t('gettingStarted.empty')} icon={Compass} />
      </>
    );
  }

  const done = steps.filter((s) => progress.completed.has(s.id)).length;
  const recommendedId = enableProgress ? steps.find((s) => !progress.completed.has(s.id))?.id : undefined;

  return (
    <>
      <PageHeader
        title={t('nav.gettingStarted')}
        actions={
          enableProgress && done > 0 ? (
            <button
              type="button"
              onClick={progress.reset}
              className="hs-focus-ring inline-flex items-center gap-1.5 rounded-hs border border-base-border px-2.5 py-1.5 text-xs text-base-muted transition-colors hover:border-accent hover:text-accent"
            >
              <RotateCcw className="h-3 w-3" aria-hidden="true" />
              {t('gettingStarted.resetProgress')}
            </button>
          ) : undefined
        }
      />

      {enableProgress && (
        <div className="mb-4">
          <ProgressBar value={done} max={steps.length} label={t('gettingStarted.progress', { done, total: steps.length })} />
          <p className="mt-1.5 text-xs text-base-muted/80">{t('gettingStarted.localOnly')}</p>
        </div>
      )}

      <ol className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <HighlightItem key={step.id} highlighted={highlightId === step.id}>
            <StepRow
              step={step}
              index={index}
              enableProgress={enableProgress}
              complete={progress.completed.has(step.id)}
              recommended={recommendedId === step.id}
              onToggle={() => progress.toggle(step.id)}
              onNavigate={onNavigate}
            />
          </HighlightItem>
        ))}
      </ol>
    </>
  );
}

interface RowProps {
  step: GettingStartedStep;
  index: number;
  enableProgress: boolean;
  complete: boolean;
  recommended: boolean;
  onToggle: () => void;
  onNavigate: (section: SectionId) => void;
}

function StepRow({ step, index, enableProgress, complete, recommended, onToggle, onNavigate }: RowProps) {
  const { t } = useI18n();
  const Icon = getIcon(step.icon);
  const number = String(index + 1).padStart(2, '0');

  return (
    <Panel className={`flex items-start gap-3 p-4 ${recommended ? 'border-accent/50' : ''} ${complete ? 'opacity-70' : ''}`}>
      {enableProgress ? (
        <button
          type="button"
          role="checkbox"
          aria-checked={complete}
          aria-label={t(complete ? 'gettingStarted.markUndone' : 'gettingStarted.markDone', { title: step.title })}
          onClick={onToggle}
          className={`hs-focus-ring flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-xs transition-colors ${
            complete ? 'border-accent bg-accent text-base-bg' : 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20'
          }`}
        >
          {complete ? <Check className="h-4 w-4" aria-hidden="true" /> : number}
        </button>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-xs text-accent" aria-hidden="true">
          {number}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-base-muted" aria-hidden="true" />
          <h3 className={`break-words text-sm font-medium text-base-text ${complete ? 'line-through decoration-base-muted/50' : ''}`}>{step.title}</h3>
          {recommended && <Badge tone="accent">{t('gettingStarted.recommended')}</Badge>}
          {step.estimatedMinutes !== undefined && step.estimatedMinutes > 0 && (
            <span className="text-xs text-base-muted">{t('gettingStarted.minutes', { minutes: step.estimatedMinutes })}</span>
          )}
        </div>
        <p className="mt-1 break-words text-sm text-base-muted">{step.description}</p>

        {step.linkTarget && (
          <button
            type="button"
            onClick={() => onNavigate(step.linkTarget as SectionId)}
            className="hs-focus-ring mt-2 inline-flex items-center gap-1 rounded text-sm font-medium text-accent hover:underline"
          >
            {step.linkLabel ?? t(`nav.${step.linkTarget === 'getting-started' ? 'gettingStarted' : step.linkTarget}`)}
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
          </button>
        )}
        {step.linkUrl && !step.linkTarget && (
          <ExternalLink href={step.linkUrl} className="hs-focus-ring mt-2 inline-flex items-center gap-1 rounded text-sm font-medium text-accent hover:underline">
            {step.linkLabel ?? step.linkUrl}
            <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
            <span className="sr-only">({t('common.opensExternally')})</span>
          </ExternalLink>
        )}
      </div>
    </Panel>
  );
}
