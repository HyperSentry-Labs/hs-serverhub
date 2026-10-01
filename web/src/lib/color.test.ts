import { describe, expect, it } from 'vitest';
import { applyTheme, isSafeColor, safeColor } from './color';

describe('isSafeColor', () => {
  it.each(['#fff', '#E3A857', '#E3A85780', 'rgb(1, 2, 3)', 'hsla(200, 50%, 40%, 0.5)'])('accepts %s', (c) => {
    expect(isSafeColor(c)).toBe(true);
  });
  it.each(['red', 'url(x)', '#12345', 'var(--x)', '#fff; background: url(x)', 'expression(alert(1))', '', 5])('rejects %s', (c) => {
    expect(isSafeColor(c)).toBe(false);
  });
});

describe('safeColor / applyTheme', () => {
  it('falls back for invalid values', () => {
    expect(safeColor('nonsense', '#111111')).toBe('#111111');
  });
  it('applies valid tokens, ignores invalid ones and clears absent ones', () => {
    const root = document.createElement('div');
    root.style.setProperty('--hs-border', '#000000');
    applyTheme(root, '#123456', 'not-a-color', { Text: '#ffffff', Border: 'javascript:1' });
    expect(root.style.getPropertyValue('--hs-accent')).toBe('#123456');
    expect(root.style.getPropertyValue('--hs-accent-secondary')).toBe('#5fb3b3');
    expect(root.style.getPropertyValue('--hs-text')).toBe('#ffffff');
    expect(root.style.getPropertyValue('--hs-border')).toBe('');
  });
});
