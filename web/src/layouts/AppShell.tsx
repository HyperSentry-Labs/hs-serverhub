import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  label: string;
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
  /** Changing this scrolls the content area back to the top (unless `resetScroll` is false). */
  scrollKey?: string;
  resetScroll?: boolean;
}

/**
 * Stays mounted while closed (invisible + non-interactive) so state (search
 * query, active section, scroll position) survives a quick close/reopen,
 * and so there is never a blank-frame flash on open.
 */
export function AppShell({ isOpen, label, header, sidebar, children, scrollKey, resetScroll = true }: Props) {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (resetScroll && mainRef.current) mainRef.current.scrollTop = 0;
    // Only a section change should reset scroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollKey]);

  return (
    <div
      role="dialog"
      aria-label={label}
      aria-hidden={!isOpen}
      className={`mx-auto flex h-[min(720px,92vh)] w-[min(1100px,94vw)] flex-col overflow-hidden rounded-hs border border-base-border bg-base-bg text-base-text shadow-2xl transition-[opacity,margin] duration-150 ${
        isOpen ? 'opacity-100' : 'pointer-events-none invisible opacity-0'
      }`}
      style={{ marginTop: isOpen ? '4vh' : '2vh' }}
    >
      {header}
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
