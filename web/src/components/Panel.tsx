import type { HTMLAttributes } from 'react';

export function Panel({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-hs border border-base-border bg-base-panel ${className}`}
      {...rest}
    />
  );
}
