import type { AnchorHTMLAttributes } from 'react';

/**
 * FiveM's CEF opens target="_blank" links in the player's default OS
 * browser. This is the only mechanism ServerHub uses to open external
 * URLs - there is no client-Lua "open URL" callback, which keeps the
 * client script surface smaller and avoids validating arbitrary URLs
 * server-side for something the browser already handles safely.
 */
export function ExternalLink({ children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}
