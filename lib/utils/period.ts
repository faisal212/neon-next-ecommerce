export type Period = 'today' | '7d' | '30d' | 'all';

export const PERIODS: { value: Period; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: 'all', label: 'All time' },
];

export function parsePeriod(raw: string | string[] | undefined): Period {
  if (raw === 'today' || raw === '7d' || raw === '30d' || raw === 'all') return raw;
  return '30d';
}

/**
 * Returns the inclusive lower bound for a period, or `null` for all-time.
 *
 * Day boundaries are calendar days in UTC. This is a Pakistan-only store
 * (PKT = UTC+5), so "today" includes a 5-hour sliver of yesterday-PKT in
 * the early morning. Acceptable for ops dashboards; revisit if/when
 * reports need to cross-check against finance day-close numbers.
 */
export function periodSince(period: Period): Date | null {
  if (period === 'all') return null;
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (period === 'today') return d;
  if (period === '7d') {
    d.setUTCDate(d.getUTCDate() - 6);
    return d;
  }
  if (period === '30d') {
    d.setUTCDate(d.getUTCDate() - 29);
    return d;
  }
  return null;
}
