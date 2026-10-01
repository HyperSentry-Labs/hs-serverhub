import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExternalLink } from './ExternalLink';

describe('ExternalLink', () => {
  it('renders a safe link that opens externally', () => {
    render(<ExternalLink href="https://example.com">Go</ExternalLink>);
    const link = screen.getByRole('link', { name: 'Go' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
  it.each(['javascript:alert(1)', 'data:text/html,x', undefined])('never renders a live link for %s', (href) => {
    render(<ExternalLink href={href}>Go</ExternalLink>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Go')).toBeInTheDocument();
  });
});
