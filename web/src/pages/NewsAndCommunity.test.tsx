import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CommunityPage } from './CommunityPage';
import { NewsPage } from './NewsPage';
import { content, renderI18n } from '../test/utils';

const c = content();

describe('NewsPage', () => {
  it('lists announcements newest first with priority and featured labels', () => {
    renderI18n(<NewsPage news={c.news} />);
    const titles = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(titles[0]).toBe('Scheduled maintenance this weekend');
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('shows no priority badge for normal announcements', () => {
    renderI18n(<NewsPage news={{ items: [{ id: 'n', title: 'Plain', date: '2026-01-01', description: 'd' }] }} />);
    expect(screen.queryByText('Normal')).not.toBeInTheDocument();
  });

  it('filters by category', async () => {
    renderI18n(<NewsPage news={c.news} />);
    await userEvent.click(screen.getByRole('button', { name: 'Maintenance' }));
    expect(screen.getByText('Scheduled maintenance this weekend')).toBeInTheDocument();
    expect(screen.queryByText('Economy adjustments')).not.toBeInTheDocument();
  });

  it('only renders "Read more" as a link when a safe url exists', () => {
    renderI18n(<NewsPage news={c.news} />);
    expect(screen.getAllByRole('link', { name: /Read more/ })).toHaveLength(1);
  });

  it('shows the empty state', () => {
    renderI18n(<NewsPage news={{ items: [] }} />);
    expect(screen.getByText('No announcements yet.')).toBeInTheDocument();
  });
});

describe('CommunityPage', () => {
  it('renders configured groups with headings', () => {
    renderI18n(<CommunityPage community={c.community} />);
    expect(screen.getByRole('heading', { name: /Support/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Store/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ticket system/ })).toHaveAttribute('href', 'https://northgate.example.com/support');
  });

  it('falls back to the flat list when there are no groups', () => {
    renderI18n(<CommunityPage community={{ ...c.community, groups: [] }} />);
    expect(screen.getAllByRole('link')).toHaveLength(3);
    expect(screen.queryByRole('heading', { level: 3 })).not.toBeInTheDocument();
  });

  it('hides a group with no usable links', () => {
    renderI18n(<CommunityPage community={{ links: [], groups: [{ id: 'e', label: 'Empty group', links: [] }, ...c.community.groups.slice(0, 1)] }} />);
    expect(screen.queryByText('Empty group')).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Community/ })).toBeInTheDocument();
  });

  it('shows the empty state', () => {
    renderI18n(<CommunityPage community={{ links: [], groups: [] }} />);
    expect(screen.getByText('No community links configured yet.')).toBeInTheDocument();
  });
});
