import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './AppShell';

const shell = (isOpen: boolean) => (
  <AppShell isOpen={isOpen} label="Test Server" header={<header>HEADER</header>} sidebar={<nav>SIDEBAR</nav>}>
    <p>CONTENT</p>
  </AppShell>
);

describe('AppShell', () => {
  it('renders header, sidebar and content inside a labelled dialog', () => {
    render(shell(true));
    expect(screen.getByRole('dialog', { name: 'Test Server' })).toBeInTheDocument();
    expect(screen.getByText('HEADER')).toBeInTheDocument();
    expect(screen.getByText('SIDEBAR')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('CONTENT');
  });

  it('stays mounted but is hidden from assistive tech and pointer input while closed', () => {
    render(shell(false));
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).toHaveAttribute('aria-hidden', 'true');
    expect(dialog.className).toContain('pointer-events-none');
    expect(screen.getByText('CONTENT')).toBeInTheDocument();
  });
});
