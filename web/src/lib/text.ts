/**
 * Search/filter normalization: case-folded, punctuation-insensitive,
 * whitespace-collapsed. Letters and digits from any script are kept (so
 * Persian text works); everything else becomes a single space. A leading
 * slash on commands therefore never blocks a match ("report" finds
 * "/report", and "/rep" finds "report").
 */
export function normalizeText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** Every whitespace-separated query term must appear somewhere in the haystack. */
export function matchesAllTerms(haystack: string, query: string): boolean {
  if (!query) return true;
  return query.split(' ').every((term) => haystack.includes(term));
}
