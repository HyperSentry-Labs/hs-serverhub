import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CommandsPage } from './CommandsPage';
import { KeybindsPage } from './KeybindsPage';
import { content, fakeFavorites, renderI18n } from '../test/utils';

const c = content();

describe('CommandsPage', () => {
  it('shows aliases, usage, permission and keybind metadata', () => {
    renderI18n(<CommandsPage commands={c.commands} favorites={fakeFavorites()} />);
    expect(screen.getByText('/911')).toBeInTheDocument();
    expect(screen.getByText('/112')).toBeInTheDocument();
    expect(screen.getByText('/report [message]')).toBeInTheDocument();
    expect(screen.getAllByText('Everyone').length).toBeGreaterThan(0);
    expect(screen.getByText('F6')).toBeInTheDocument();
  });

  it('only shows usage where it is configured', () => {
    renderI18n(<CommandsPage commands={{ categories: [], items: [{ id: 'x', command: '/x', title: 'X', description: 'd', category: 'g' }] }} favorites={fakeFavorites()} />);
    expect(screen.queryByText('Usage')).not.toBeInTheDocument();
  });

  it('finds a command by alias in the in-page filter', async () => {
    renderI18n(<CommandsPage commands={c.commands} favorites={fakeFavorites()} />);
    await userEvent.type(screen.getByRole('searchbox'), '112');
    expect(screen.getByText('/911')).toBeInTheDocument();
    expect(screen.queryByText('/report')).not.toBeInTheDocument();
  });

  it('shows empty and no-match states', async () => {
    const { unmount } = renderI18n(<CommandsPage commands={{ categories: [], items: [] }} favorites={fakeFavorites()} />);
    expect(screen.getByText('No commands configured yet.')).toBeInTheDocument();
    unmount();
    renderI18n(<CommandsPage commands={c.commands} favorites={fakeFavorites()} />);
    await userEvent.type(screen.getByRole('searchbox'), 'qqqq');
    expect(screen.getByText('No commands match your search.')).toBeInTheDocument();
  });

  it('handles many items', () => {
    const items = Array.from({ length: 80 }, (_, i) => ({ id: `c${i}`, command: `/c${i}`, title: `T${i}`, description: 'd', category: 'g' }));
    renderI18n(<CommandsPage commands={{ categories: [], items }} favorites={fakeFavorites()} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(80);
  });
});

describe('KeybindsPage', () => {
  it('shows key, resource and context', () => {
    renderI18n(<KeybindsPage keybinds={c.keybinds} favorites={fakeFavorites()} />);
    expect(screen.getByText('F6')).toBeInTheDocument();
    expect(screen.getByText('my-police')).toBeInTheDocument();
    expect(screen.getByText(/Duty only/)).toBeInTheDocument();
  });

  it('filters by resource name', async () => {
    renderI18n(<KeybindsPage keybinds={c.keybinds} favorites={fakeFavorites()} />);
    await userEvent.type(screen.getByRole('searchbox'), 'my-police');
    expect(screen.getByText('Police Menu')).toBeInTheDocument();
    expect(screen.queryByText('Phone')).not.toBeInTheDocument();
  });

  it('shows the empty state', () => {
    renderI18n(<KeybindsPage keybinds={{ categories: [], items: [] }} favorites={fakeFavorites()} />);
    expect(screen.getByText('No keybinds configured yet.')).toBeInTheDocument();
  });
});
