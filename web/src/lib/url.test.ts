import { describe, expect, it } from 'vitest';
import { isSafeUrl } from './url';

describe('isSafeUrl', () => {
  it('accepts http and https only', () => {
    expect(isSafeUrl('https://example.com/a?b=1')).toBe(true);
    expect(isSafeUrl('http://example.com')).toBe(true);
  });
  it.each(['javascript:alert(1)', 'data:text/html,x', 'file:///etc/passwd', 'ftp://example.com', 'example.com', '', ' javascript:alert(1)'])(
    'rejects %s',
    (value) => expect(isSafeUrl(value)).toBe(false),
  );
  it('rejects non-strings', () => {
    expect(isSafeUrl(undefined)).toBe(false);
    expect(isSafeUrl({})).toBe(false);
  });
});
