import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { OverviewPage } from './OverviewPage';
import { demoStatus } from '../mock/demoContent';
import { content, fakeFavorites, fakeProgress, renderI18n } from '../test/utils';

const props = () => ({ favorites: fakeFavorites(), progress: fakeProgress(), onNavigate: vi.fn() });

describe('OverviewPage', () => {
  it('shows identity, live status, and resource states with text labels', () => {
    renderI18n(<OverviewPage content={content()} status={demoStatus} {...props()} />);
    expect(screen.getByRole('heading', { name: 'Welcome to Northgate Roleplay' })).toBeInTheDocument();
    expect(screen.getByText('128 / 256')).toBeInTheDocument();
    expect(screen.getByText('14h 22m')).toBeInTheDocument();
    const resources = screen.getByRole('list', { name: 'Resources' });
    expect(within(resources).getAllByText('Running')).toHaveLength(2);
    expect(within(resources).getByText('Starting')).toBeInTheDocument();
    expect(within(resources).getByText('Stopped')).toBeInTheDocument();
  });

  it('shows an honest "unavailable" state before the first status arrives', () => {
    renderI18n(<OverviewPage content={content()} status={null} {...props()} />);
    expect(screen.getByText('Status unavailable')).toBeInTheDocument();
    expect(screen.queryByText('128 / 256')).not.toBeInTheDocument();
  });

  it('hides live status entirely when disabled', () => {
    renderI18n(<OverviewPage content={content({ status: { enabled: false, showUptime: false } })} status={demoStatus} {...props()} />);
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
    expect(screen.queryByText('Status unavailable')).not.toBeInTheDocument();
  });

  it('section quick actions navigate; url quick actions are real external links', async () => {
    const p = props();
    renderI18n(<OverviewPage content={content()} status={demoStatus} {...p} />);
    await userEvent.click(screen.getByRole('button', { name: 'Rules' }));
    expect(p.onNavigate).toHaveBeenCalledWith('rules');
    const discord = screen.getByRole('link', { name: /Join Discord/ });
    expect(discord).toHaveAttribute('href', 'https://discord.example.com/northgate');
    expect(discord).toHaveAttribute('target', '_blank');
  });

  it('prefers the featured announcement over a newer plain one', () => {
    renderI18n(<OverviewPage content={content({ news: { items: [
      { id: 'new', title: 'Newest plain', date: '2026-09-10', description: 'd' },
      { id: 'feat', title: 'Older featured', date: '2026-09-01', description: 'd', featured: true },
    ] } })} status={demoStatus} {...props()} />);
    expect(screen.getByText('Older featured')).toBeInTheDocument();
    expect(screen.queryByText('Newest plain')).not.toBeInTheDocument();
    expect(screen.getByText('Featured announcement')).toBeInTheDocument();
  });

  it('shows guide progress with the next step and jumps to it', async () => {
    const p = { ...props(), progress: fakeProgress(['step-character']) };
    renderI18n(<OverviewPage content={content()} status={demoStatus} {...p} />);
    expect(screen.getByText('1 of 6 steps complete')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Next: Learn your identity system/ }));
    expect(p.onNavigate).toHaveBeenCalledWith('getting-started', 'step-id');
  });

  it('hides the guide card when progress tracking is disabled', () => {
    const c = content();
    renderI18n(<OverviewPage content={{ ...c, gettingStarted: { ...c.gettingStarted, enableProgress: false } }} status={demoStatus} {...props()} />);
    expect(screen.queryByText('Getting started')).not.toBeInTheDocument();
  });

  it('shows pinned items, skipping ones that no longer exist, and can open/unpin/clear them', async () => {
    const favorites = fakeFavorites([
      { kind: 'commands', id: 'cmd-report' },
      { kind: 'rules', id: 'deleted-rule' },
    ]);
    const onNavigate = vi.fn();
    renderI18n(<OverviewPage content={content()} status={demoStatus} favorites={favorites} progress={fakeProgress()} onNavigate={onNavigate} />);
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    expect(screen.getAllByText('/report')).toHaveLength(1);
    await userEvent.click(screen.getByText('/report'));
    expect(onNavigate).toHaveBeenCalledWith('commands', 'cmd-report');
    await userEvent.click(screen.getByRole('button', { name: 'Unpin "/report"' }));
    expect(favorites.toggle).toHaveBeenCalledWith({ kind: 'commands', id: 'cmd-report' });
    await userEvent.click(screen.getByRole('button', { name: 'Clear pinned' }));
    expect(favorites.clear).toHaveBeenCalled();
  });

  it('hides the pinned section when nothing is pinned', () => {
    renderI18n(<OverviewPage content={content()} status={demoStatus} {...props()} />);
    expect(screen.queryByText('Pinned')).not.toBeInTheDocument();
  });

  it('renders a sensible page for an empty server (no content at all)', () => {
    renderI18n(<OverviewPage content={content({ overview: { Enabled: true, ShowLiveStats: true, ShowLatestAnnouncement: true, QuickLinks: [] }, news: { items: [] }, community: { links: [], groups: [] }, gettingStarted: { steps: [], enableProgress: true } })} status={null} {...props()} />);
    expect(screen.getByText('No announcements yet.')).toBeInTheDocument();
    expect(screen.queryByText('Quick access')).not.toBeInTheDocument();
  });
});
