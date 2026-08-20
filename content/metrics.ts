import type { VerificationStatus } from './verification'

/**
 * Centralised company statistics.
 *
 * The supplied draft rendered these as malformed values (`-518+`, `$-216M+`,
 * `$-44M+`, `0+`, `0.0x`), so none of them could be trusted or reused. The
 * figures below are placeholders carrying `demo` status: they render only in
 * demo mode and always under a visible "Illustrative" caption. Replace the
 * `value` fields and flip `verificationStatus` to `verified` to publish.
 */
export type Metric = {
  id: string
  label: string
  value: number | null
  /** How the number is rendered: 1200000 -> "$1.2M+" etc. */
  format: 'count' | 'currency-compact' | 'multiplier'
  suffix?: string
  verificationStatus: VerificationStatus
}

export const companyMetrics: Metric[] = [
  { id: 'clients', label: 'Clients served', value: 180, format: 'count', suffix: '+', verificationStatus: 'demo' },
  { id: 'revenue', label: 'Revenue generated', value: 216_000_000, format: 'currency-compact', suffix: '+', verificationStatus: 'demo' },
  { id: 'adspend', label: 'Ad spend managed', value: 44_000_000, format: 'currency-compact', suffix: '+', verificationStatus: 'demo' },
  { id: 'countries', label: 'Countries reached', value: 15, format: 'count', suffix: '+', verificationStatus: 'demo' },
  { id: 'roas', label: 'Average ROAS', value: 4.8, format: 'multiplier', verificationStatus: 'demo' },
  { id: 'team', label: 'Team members', value: 32, format: 'count', suffix: '+', verificationStatus: 'demo' },
]

/** Hero dashboard figures. Illustrative product UI, not a live client account. */
export const heroDashboard = {
  roas: 4.8,
  revenueGrowthPct: 340,
  funnel: [
    { stage: 'Visits', pct: 100 },
    { stage: 'Leads', pct: 64 },
    { stage: 'Sales', pct: 28 },
  ],
  revenueSeries: [
    { month: 'Jan', value: 118 },
    { month: 'Feb', value: 131 },
    { month: 'Mar', value: 127 },
    { month: 'Apr', value: 158 },
    { month: 'May', value: 186 },
    { month: 'Jun', value: 204 },
    { month: 'Jul', value: 239 },
    { month: 'Aug', value: 268 },
  ],
  channels: [
    { name: 'Paid search', share: 34 },
    { name: 'Paid social', share: 28 },
    { name: 'Organic', share: 23 },
    { name: 'Email', share: 15 },
  ],
  timeRange: 'Last 8 months',
  verificationStatus: 'demo' as VerificationStatus,
}

export function formatMetric(metric: Metric): string {
  if (metric.value === null) return '—'
  const suffix = metric.suffix ?? ''
  switch (metric.format) {
    case 'currency-compact':
      return `${compactCurrency(metric.value)}${suffix}`
    case 'multiplier':
      return `${metric.value.toFixed(1)}x`
    case 'count':
    default:
      return `${new Intl.NumberFormat('en-US').format(metric.value)}${suffix}`
  }
}

export function compactCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
  // "$216.0M" reads as false precision; "$216M" is the intended figure.
  return formatted.replace(/\.0(?=[A-Za-z]|$)/, '')
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
