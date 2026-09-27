import { useState } from 'react';

interface Props {
  src: string;
  serverName: string;
}

/**
 * ServerHub ships with no logo file by default (see web/public/branding/).
 * That's deliberate: the <img> below simply 404s, `onError` fires, and the
 * monogram fallback renders instead - proving the "missing logo never
 * breaks the UI" requirement rather than just documenting it.
 */
export function Logo({ src, serverName }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = serverName.trim().charAt(0).toUpperCase() || 'S';

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-hs border border-base-border bg-base-panel-raised text-sm font-semibold text-accent"
      >
        {initial}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      aria-hidden="true"
      className="h-9 w-9 shrink-0 rounded-hs object-contain"
      onError={() => setFailed(true)}
    />
  );
}
