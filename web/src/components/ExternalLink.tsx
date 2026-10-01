import type { AnchorHTMLAttributes } from 'react';
import { isSafeUrl } from '../lib/url';

/**
 * FiveM's CEF opens target="_blank" links in the player's default OS
 * browser. This is the only mechanism ServerHub uses to open external
 * URLs - there is no client-Lua "open URL" callback, which keeps the
 * client script surface small.
 *
 * Only http/https URLs ever become a real link; anything else renders its
 * children as inert text (see lib/url.ts).
 */
export function ExternalLink({ children, href, className, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (!isSafeUrl(href)) {
    return <span className={className}>{children}</span>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
    </a>
  );
}
