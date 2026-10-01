import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { resetBridgeForTests } from './bridge';

// jsdom has no layout engine.
beforeEach(() => {
  resetBridgeForTests();
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => vi.useRealTimers());

const nav = (name: string) => within(screen.getByRole('navigation', { name: 'ServerHub sections' })).getByRole('button', { name });

async function renderLoaded() {
  render(<App />);
  // The mock bridge emits open -> bootstrap after a short delay.
  await screen.findByRole('heading', { name: 'Welcome to Northgate Roleplay' });
}

describe('App (browser mock bridge)', () => {
  it('shows a loading state, then the Overview home screen', async () => {
    render(<App />);
    expect(screen.getByText('Loading server information...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Welcome to Northgate Roleplay' })).toBeInTheDocument();
    expect(nav('Overview')).toHaveAttribute('aria-current', 'page');
  });

  it('navigates between sections from the sidebar', async () => {
    await renderLoaded();
    await userEvent.click(nav('Commands'));
    expect(screen.getByRole('heading', { level: 2, name: 'Commands' })).toBeInTheDocument();
    expect(nav('Commands')).toHaveAttribute('aria-current', 'page');
  });

  it('a search result jumps to its section and highlights the row, then clears the highlight', async () => {
    await renderLoaded();
    await userEvent.type(screen.getByRole('combobox', { name: 'Search ServerHub' }), 'dispatch');
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('heading', { level: 2, name: 'Commands' })).toBeInTheDocument();
    const row = screen.getByText('/dispatch').closest('li');
    expect(row).toHaveAttribute('data-highlighted', 'true');
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    await waitFor(() => expect(row).not.toHaveAttribute('data-highlighted'), { timeout: 3000 });
  });

  it('clears any highlight when navigating with the sidebar', async () => {
    await renderLoaded();
    await userEvent.type(screen.getByRole('combobox', { name: 'Search ServerHub' }), 'dispatch{Enter}');
    await userEvent.click(nav('Rules'));
    expect(document.querySelector('[data-highlighted]')).toBeNull();
  });

  it('pinning an item shows it on Overview and it can be opened from there', async () => {
    await renderLoaded();
    await userEvent.click(nav('Commands'));
    await userEvent.click(screen.getByRole('button', { name: 'Pin "/report"' }));
    await userEvent.click(nav('Overview'));
    expect(screen.getByText('Pinned')).toBeInTheDocument();
    await userEvent.click(screen.getByText('Report a player or issue'));
    expect(screen.getByRole('heading', { level: 2, name: 'Commands' })).toBeInTheDocument();
    expect(screen.getByText('/report').closest('li')).toHaveAttribute('data-highlighted', 'true');
  });

  it('persists pinned items across a remount (local storage) and clears them on request', async () => {
    const first = render(<App />);
    await screen.findByRole('heading', { name: 'Welcome to Northgate Roleplay' });
    await userEvent.click(nav('Rules'));
    await userEvent.click(screen.getByRole('button', { name: 'Pin "Respect every player"' }));
    first.unmount();
    resetBridgeForTests();

    render(<App />);
    await screen.findByRole('heading', { name: 'Welcome to Northgate Roleplay' });
    expect(screen.getByText('Respect every player')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear pinned' }));
    expect(screen.queryByText('Pinned')).not.toBeInTheDocument();
  });

  it('Escape closes ServerHub, but the first Escape in a non-empty search only clears the search', async () => {
    await renderLoaded();
    const dialog = () => screen.getByRole('dialog', { hidden: true });
    await userEvent.type(screen.getByRole('combobox', { name: 'Search ServerHub' }), 'rules');
    await userEvent.keyboard('{Escape}');
    expect(dialog()).toHaveAttribute('aria-hidden', 'false');
    await act(async () => {
      await userEvent.keyboard('{Escape}');
    });
    expect(dialog()).toHaveAttribute('aria-hidden', 'true');
  });

  it('close button hides the UI', async () => {
    await renderLoaded();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('aria-hidden', 'true');
  });
});
