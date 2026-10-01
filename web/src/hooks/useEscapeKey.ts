import { useEffect } from 'react';

/**
 * Closes ServerHub on Escape. A handler that consumes Escape itself (the
 * search box, which first clears its own query) stops propagation, so this
 * document-level listener never sees that keypress.
 */
export function useEscapeKey(enabled: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) onEscape();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled, onEscape]);
}
