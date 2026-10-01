import type { Category } from '../types/content';

export interface CategoryGroup<T> {
  id: string;
  label: string;
  items: T[];
}

/**
 * Groups items by category, in the order categories are configured (which
 * is how server owners control ordering). Items whose category isn't in
 * the configured list are kept, grouped after the known ones under their
 * raw id - a mis-typed category never hides an item.
 */
export function groupByCategory<T extends { category: string }>(
  items: T[],
  categories: Category[],
): Array<CategoryGroup<T>> {
  const buckets = new Map<string, T[]>();
  for (const item of items) {
    const list = buckets.get(item.category);
    if (list) list.push(item);
    else buckets.set(item.category, [item]);
  }
  const groups: Array<CategoryGroup<T>> = [];
  for (const category of categories) {
    const list = buckets.get(category.id);
    if (list) {
      groups.push({ id: category.id, label: category.label, items: list });
      buckets.delete(category.id);
    }
  }
  for (const [id, list] of buckets) groups.push({ id, label: id, items: list });
  return groups;
}
