import { useEffect, type RefObject } from 'react';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

/**
 * Focuses the search box on Ctrl/Cmd+K, or on "/" when the player is not
 * already typing somewhere. Only active while ServerHub is open, and the
 * "/" shortcut never fires inside another input, so it can't swallow a
 * slash typed into a filter box.
 */
export function useGlobalSearchShortcut(enabled: boolean, inputRef: RefObject<HTMLInputElement>): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (event: KeyboardEvent) => {
      const isCtrlK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      const isSlash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !isTypingTarget(event.target);
      if (isCtrlK || isSlash) {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [enabled, inputRef]);
}
