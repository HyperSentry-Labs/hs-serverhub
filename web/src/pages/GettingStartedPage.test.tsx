import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GettingStartedPage } from './GettingStartedPage';
import { content, fakeProgress, renderI18n } from '../test/utils';

const gs = content().gettingStarted;

describe('GettingStartedPage', () => {
  it('shows progress and recommends the first incomplete step', () => {
    renderI18n(<GettingStartedPage gettingStarted={gs} progress={fakeProgress(['step-character'])} onNavigate={vi.fn()} />);
    expect(screen.getByRole('progressbar', { name: '1 of 6 complete' })).toHaveAttribute('aria-valuenow', '1');
    const recommended = screen.getAllByText('Recommended next');
    expect(recommended).toHaveLength(1);
    expect(recommended[0]?.closest('li')).toHaveTextContent('Learn your identity system');
  });

  it('toggles completion through the progress API using an accessible checkbox', async () => {
    const progress = fakeProgress(['step-character']);
    renderI18n(<GettingStartedPage gettingStarted={gs} progress={progress} onNavigate={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Mark "Create your character" as not done' })).toBeChecked();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Mark "Find your first job" as done' }));
    expect(progress.toggle).toHaveBeenCalledWith('step-job');
  });

  it('offers a reset only once something is complete', async () => {
    const none = fakeProgress();
    const { unmount } = renderI18n(<GettingStartedPage gettingStarted={gs} progress={none} onNavigate={vi.fn()} />);
    expect(screen.queryByRole('button', { name: 'Reset progress' })).not.toBeInTheDocument();
    unmount();
    const some = fakeProgress(['step-job']);
    renderI18n(<GettingStartedPage gettingStarted={gs} progress={some} onNavigate={vi.fn()} />);
    await userEvent.click(screen.getByRole('button', { name: 'Reset progress' }));
    expect(some.reset).toHaveBeenCalled();
  });

  it('hides all progress UI when progress tracking is disabled', () => {
    renderI18n(<GettingStartedPage gettingStarted={{ ...gs, enableProgress: false }} progress={fakeProgress()} onNavigate={vi.fn()} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Recommended next')).not.toBeInTheDocument();
    expect(screen.getByText('Create your character')).toBeInTheDocument();
  });

  it('shows the optional time estimate only when configured', () => {
    renderI18n(<GettingStartedPage gettingStarted={gs} progress={fakeProgress()} onNavigate={vi.fn()} />);
    expect(screen.getByText('~3 min')).toBeInTheDocument();
    expect(screen.getAllByText(/min$/)).toHaveLength(3);
  });

  it('navigates to internal sections and opens external links safely', async () => {
    const onNavigate = vi.fn();
    renderI18n(<GettingStartedPage gettingStarted={gs} progress={fakeProgress()} onNavigate={onNavigate} />);
    await userEvent.click(screen.getByRole('button', { name: /Open Rules/ }));
    expect(onNavigate).toHaveBeenCalledWith('rules');
    expect(screen.getByRole('link', { name: /Join Discord/ })).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('shows the empty state', () => {
    renderI18n(<GettingStartedPage gettingStarted={{ steps: [], enableProgress: true }} progress={fakeProgress()} onNavigate={vi.fn()} />);
    expect(screen.getByText('No getting-started steps configured yet.')).toBeInTheDocument();
  });
});
