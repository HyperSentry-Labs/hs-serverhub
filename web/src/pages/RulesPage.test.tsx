import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { RulesPage } from './RulesPage';
import { fakeFavorites, content, renderI18n } from '../test/utils';

const rules = content().rules;

describe('RulesPage', () => {
  it('groups rules under category headings', () => {
    renderI18n(<RulesPage rules={rules} favorites={fakeFavorites()} />);
    expect(screen.getByRole('heading', { level: 2, name: 'Rules' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /General/ })).toBeInTheDocument();
    expect(screen.getByText('Respect every player')).toBeInTheDocument();
  });

  it('filters by category and reports the pressed state', async () => {
    renderI18n(<RulesPage rules={rules} favorites={fakeFavorites()} />);
    const pill = screen.getByRole('button', { name: 'Police' });
    await userEvent.click(pill);
    expect(pill).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Police interaction')).toBeInTheDocument();
    expect(screen.queryByText('Respect every player')).not.toBeInTheDocument();
  });

  it('filters by text and shows a no-matches state', async () => {
    renderI18n(<RulesPage rules={rules} favorites={fakeFavorites()} />);
    const input = screen.getByRole('searchbox', { name: 'Search rules...' });
    await userEvent.type(input, 'deathmatch');
    expect(screen.getByText('No random deathmatch')).toBeInTheDocument();
    expect(screen.queryByText('Respect every player')).not.toBeInTheDocument();
    await userEvent.clear(input);
    await userEvent.type(input, 'qqqq');
    expect(screen.getByText('No rules match your search.')).toBeInTheDocument();
  });

  it('shows the empty state when there are no rules', () => {
    renderI18n(<RulesPage rules={{ categories: [], items: [] }} favorites={fakeFavorites()} />);
    expect(screen.getByText('No rules configured yet.')).toBeInTheDocument();
  });

  it('collapses long descriptions behind a details toggle', async () => {
    renderI18n(<RulesPage rules={rules} favorites={fakeFavorites()} />);
    const toggle = screen.getByRole('button', { name: 'Show details' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('pins and unpins through the favorites API', async () => {
    const favorites = fakeFavorites([{ kind: 'rules', id: 'general-2' }]);
    renderI18n(<RulesPage rules={rules} favorites={favorites} />);
    const pinnedBtn = screen.getByRole('button', { name: 'Unpin "One account per person"' });
    expect(pinnedBtn).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Pin "Respect every player"' }));
    expect(favorites.toggle).toHaveBeenCalledWith({ kind: 'rules', id: 'general-1' });
  });

  it('marks the navigated-to rule as highlighted and resets filters', () => {
    renderI18n(<RulesPage rules={rules} favorites={fakeFavorites()} highlightId="police-1" />);
    const row = screen.getByText('Police interaction').closest('li');
    expect(row).toHaveAttribute('data-highlighted', 'true');
    expect(within(row as HTMLElement).getByText('police-1')).toBeInTheDocument();
  });

  it('renders long rule text without breaking layout classes', () => {
    const long = 'word '.repeat(200);
    renderI18n(<RulesPage rules={{ categories: [], items: [{ id: 'l', category: 'x', title: long, description: long }] }} favorites={fakeFavorites()} />);
    expect(screen.getByRole('button', { name: 'Show details' })).toBeInTheDocument();
  });
});
