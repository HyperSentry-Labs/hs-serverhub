import { useRef, useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchBar } from './SearchBar';
import { useGlobalSearchShortcut } from '../hooks/useGlobalSearchShortcut';
import { content, renderI18n } from '../test/utils';
import type { SearchResultItem } from '../lib/search';

function Harness({ onSelect, onEscapeBubble }: { onSelect: (r: SearchResultItem) => void; onEscapeBubble?: () => void }) {
  const [query, setQuery] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useGlobalSearchShortcut(true, ref);
  return (
    <div onKeyDown={(e) => e.key === 'Escape' && onEscapeBubble?.()}>
      <input aria-label="other field" />
      <SearchBar content={content()} query={query} onQueryChange={setQuery} onSelect={onSelect} inputRef={ref} />
    </div>
  );
}

const box = () => screen.getByRole('combobox', { name: 'Search ServerHub' });

describe('SearchBar', () => {
  it('shows results grouped by section', async () => {
    renderI18n(<Harness onSelect={() => undefined} />);
    await userEvent.type(box(), 'police');
    expect(screen.getByRole('group', { name: 'Keybinds' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Rules' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'News' })).toBeInTheDocument();
    expect(screen.getByText('Police Menu')).toBeInTheDocument();
  });

  it('shows an empty state for no results', async () => {
    renderI18n(<Harness onSelect={() => undefined} />);
    await userEvent.type(box(), 'zzzzqqq');
    expect(screen.getByRole('status')).toHaveTextContent('No results for "zzzzqqq"');
  });

  it('navigates with the arrow keys and opens the highlighted result with Enter', async () => {
    const onSelect = vi.fn();
    renderI18n(<Harness onSelect={onSelect} />);
    await userEvent.type(box(), 'police');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    const options = screen.getAllByRole('option');
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(box()).toHaveAttribute('aria-activedescendant', options[1]?.id);
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: expect.any(String), section: expect.any(String) });
    expect(box()).toHaveValue('');
  });

  it('opens the first result on Enter when nothing is highlighted', async () => {
    const onSelect = vi.fn();
    renderI18n(<Harness onSelect={onSelect} />);
    await userEvent.type(box(), '911{Enter}');
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: 'cmd-911', section: 'commands' });
  });

  it('opens a result on click', async () => {
    const onSelect = vi.fn();
    renderI18n(<Harness onSelect={onSelect} />);
    await userEvent.type(box(), 'discord');
    await userEvent.click(screen.getAllByRole('option')[0] as HTMLElement);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('Escape clears the query first and does not bubble; a second Escape does', async () => {
    const bubble = vi.fn();
    renderI18n(<Harness onSelect={() => undefined} onEscapeBubble={bubble} />);
    await userEvent.type(box(), 'police');
    await userEvent.keyboard('{Escape}');
    expect(box()).toHaveValue('');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(bubble).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    expect(bubble).toHaveBeenCalledTimes(1);
  });

  it('Ctrl+K focuses the search box', async () => {
    renderI18n(<Harness onSelect={() => undefined} />);
    fireEvent.keyDown(document.body, { key: 'k', ctrlKey: true });
    expect(box()).toHaveFocus();
  });

  it('"/" focuses search, but only when not already typing in another field', async () => {
    renderI18n(<Harness onSelect={() => undefined} />);
    fireEvent.keyDown(document.body, { key: '/' });
    expect(box()).toHaveFocus();

    screen.getByLabelText('other field').focus();
    fireEvent.keyDown(screen.getByLabelText('other field'), { key: '/' });
    expect(screen.getByLabelText('other field')).toHaveFocus();
  });

  it('works with Persian text and an RTL locale', async () => {
    renderI18n(<Harness onSelect={() => undefined} />, 'fa');
    const input = screen.getByRole('combobox', { name: 'جستجو در ServerHub' });
    await userEvent.type(input, 'zzzzqqq');
    expect(screen.getByRole('status')).toHaveTextContent('نتیجه‌ای برای «zzzzqqq» پیدا نشد');
  });
});
