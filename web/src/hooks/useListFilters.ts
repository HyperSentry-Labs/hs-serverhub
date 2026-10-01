import { useEffect, useState } from 'react';

/**
 * Category + text filter state shared by list pages. When a search result
 * or pinned item navigates to a row, filters reset so the target can't be
 * hidden by a stale filter.
 */
export function useListFilters(highlightId?: string) {
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (highlightId) {
      setCategory(null);
      setQuery('');
    }
  }, [highlightId]);

  return { category, setCategory, query, setQuery };
}
