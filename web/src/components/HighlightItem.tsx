import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  highlighted: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * A list row that scrolls into view and briefly rings itself when a
 * search result (or pinned item) navigated to it. The ring is cleared by
 * App after a short delay; reduced-motion players get an instant scroll.
 */
export function HighlightItem({ highlighted, children, className = '' }: Props) {
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!highlighted || !ref.current) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    ref.current.scrollIntoView?.({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }, [highlighted]);

  return (
    <li ref={ref} data-highlighted={highlighted || undefined} className={`${highlighted ? 'hs-highlight' : ''} ${className}`}>
      {children}
    </li>
  );
}
