import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusPill, type StatusState } from './StatusPill';

describe('StatusPill', () => {
  it.each<StatusState>(['online', 'offline', 'warning', 'unknown'])('renders a text label and an icon for %s (never colour alone)', (state) => {
    const { container } = render(<StatusPill state={state} label={`state-${state}`} />);
    expect(screen.getByText(`state-${state}`)).toBeInTheDocument();
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});
