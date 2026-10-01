import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Sidebar } from './Sidebar';
import { renderI18n } from '../test/utils';

describe('Sidebar', () => {
  it('renders one button per section and marks the active one', () => {
    renderI18n(<Sidebar sections={['overview', 'rules', 'news']} active="rules" onSelect={() => undefined} />);
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Rules' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'News' })).not.toHaveAttribute('aria-current');
  });

  it('calls onSelect with the clicked section', async () => {
    const onSelect = vi.fn();
    renderI18n(<Sidebar sections={['overview', 'rules']} active="overview" onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Rules' }));
    expect(onSelect).toHaveBeenCalledWith('rules');
  });

  it('localizes labels (Persian)', () => {
    renderI18n(<Sidebar sections={['rules']} active="rules" onSelect={() => undefined} />, 'fa');
    expect(screen.getByRole('button', { name: 'قوانین' })).toBeInTheDocument();
  });

  it('is exposed as a labelled navigation landmark', () => {
    renderI18n(<Sidebar sections={['rules']} active="rules" onSelect={() => undefined} />);
    expect(screen.getByRole('navigation', { name: 'ServerHub sections' })).toBeInTheDocument();
  });
});
