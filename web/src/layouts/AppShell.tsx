import type { ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  header: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
}

/**
 * Stays mounted while closed (opacity/pointer-events only) so state (search
 * query, active section, scroll position) survives a quick close/reopen,
 * and so there is never a blank-frame flash on open.
 */
export function AppShell({ isOpen, header, sidebar, children }: Props) {
  return (
    <div
      className={`mx-auto flex h-[min(720px,92vh)] w-[min(1100px,94vw)] flex-col overflow-hidden rounded-hs border border-base-border bg-base-bg text-base-text shadow-2xl transition-all duration-150 ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      style={{ marginTop: isOpen ? '4vh' : '2vh' }}
    >
      {header}
      <div className="flex min-h-0 flex-1">
        {sidebar}
        <main className="min-w-0 flex-1 overflow-y-auto p-5">{children}</main>
      </div>
    </div>
  );
}
