export function formatUptime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (hours <= 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export function formatDate(isoDate: string, language?: string): string {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString(language, { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Featured news wins the Overview slot; otherwise the newest item. Input must be newest-first. */
export function pickFeaturedNews<T extends { featured?: boolean }>(items: T[]): T | undefined {
  return items.find((item) => item.featured) ?? items[0];
}
