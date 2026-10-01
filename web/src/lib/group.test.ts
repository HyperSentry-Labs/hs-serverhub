import { describe, expect, it } from 'vitest';
import { groupByCategory } from './group';

describe('groupByCategory', () => {
  const categories = [
    { id: 'b', label: 'Bravo' },
    { id: 'a', label: 'Alpha' },
  ];
  it('orders groups by configured category order and keeps item order', () => {
    const groups = groupByCategory(
      [
        { id: '1', category: 'a' },
        { id: '2', category: 'b' },
        { id: '3', category: 'a' },
      ],
      categories,
    );
    expect(groups.map((g) => g.label)).toEqual(['Bravo', 'Alpha']);
    expect(groups[1]?.items.map((i) => i.id)).toEqual(['1', '3']);
  });
  it('keeps items with an unconfigured category instead of hiding them', () => {
    const groups = groupByCategory([{ id: '1', category: 'typo' }], categories);
    expect(groups).toEqual([{ id: 'typo', label: 'typo', items: [{ id: '1', category: 'typo' }] }]);
  });
  it('omits categories with no items', () => {
    expect(groupByCategory([], categories)).toEqual([]);
  });
});
