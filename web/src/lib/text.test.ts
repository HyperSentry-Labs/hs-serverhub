import { describe, expect, it } from 'vitest';
import { matchesAllTerms, normalizeText } from './text';

describe('normalizeText', () => {
  it('case-folds, strips punctuation and collapses whitespace', () => {
    expect(normalizeText('  /Report!!   A  Player.. ')).toBe('report a player');
  });
  it('keeps letters and digits from non-Latin scripts', () => {
    expect(normalizeText('قوانین «پلیس» 911')).toBe('قوانین پلیس 911');
  });
  it('returns an empty string for non-strings', () => {
    expect(normalizeText(undefined)).toBe('');
    expect(normalizeText(42)).toBe('');
  });
});

describe('matchesAllTerms', () => {
  it('requires every term, in any order', () => {
    expect(matchesAllTerms('report a player to staff', 'staff report')).toBe(true);
    expect(matchesAllTerms('report a player', 'staff report')).toBe(false);
  });
  it('matches everything for an empty query', () => {
    expect(matchesAllTerms('anything', '')).toBe(true);
  });
});
