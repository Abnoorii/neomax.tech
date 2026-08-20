import type { VerificationStatus } from './verification'

export type BillingPeriod = 'monthly' | 'quarterly'

/** Quarterly billing advertises a 10% discount; prices are derived, never hardcoded. */
export const QUARTERLY_DISCOUNT = 0.1

export type Plan = {
  id: string
  name: string
  /** Who the plan is intended for. */
  intendedFor: string
  description: string
  /** Monthly list price in USD. `null` means quoted, not published. */
  monthlyPrice: number | null
  featured: boolean
  ctaLabel: string
  ctaHref: string
  included: string[]
  limits: { label: string; value: string }[]
  reporting: string
  support: string
  verificationStatus: VerificationStatus
}

export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    intendedFor: 'Small businesses and startups running their first structured acquisition programme.',
    description: 'Enough channel coverage and measurement to establish a reliable baseline.',
    monthlyPrice: 1500,
    featured: false,
    ctaLabel: 'Get started',
    ctaHref: '/contact?plan=starter',
    included: [
      'Two paid channels, actively managed',
      'SEO foundations: technical health and on-page',
      'Conversion tracking setup and validation',
      'Monthly performance report',
      'Email support',
    ],
    limits: [
      { label: 'Paid channels', value: '2' },
      { label: 'Creative concepts', value: '2 per month' },
      { label: 'Strategy calls', value: 'Monthly' },
    ],
    reporting: 'Monthly written report',
    support: 'Email support, next business day',
    verificationStatus: 'pending',
  },
  {
    id: 'growth',
    name: 'Growth',
    intendedFor: 'Scaling businesses that need marketing, sales, and reporting operating as one system.',
    description: 'The full growth engine: more channels, content production, and CRM connected to spend.',
    monthlyPrice: 3500,
    featured: true,
    ctaLabel: 'Start growing',
    ctaHref: '/contact?plan=growth',
    included: [
      'Four paid channels, actively managed',
      'Full SEO programme including content',
      'Content production on a fixed cadence',
      'CRM setup and pipeline reporting',
      'Bi-weekly strategy calls',
      'Live performance dashboard',
    ],
    limits: [
      { label: 'Paid channels', value: '4' },
      { label: 'Creative concepts', value: '6 per month' },
      { label: 'Strategy calls', value: 'Bi-weekly' },
    ],
    reporting: 'Live dashboard plus bi-weekly review',
    support: 'Shared channel, same business day',
    verificationStatus: 'pending',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    intendedFor: 'Large brands and multi-market campaigns needing dedicated strategic ownership.',
    description: 'A dedicated team, custom strategy, and reporting shaped to your internal governance.',
    monthlyPrice: null,
    featured: false,
    ctaLabel: 'Book a call',
    ctaHref: '/contact?plan=enterprise',
    included: [
      'Full-service team across all three practices',
      'Dedicated strategists and named account lead',
      'Custom strategy and multi-market execution',
      'Weekly strategy calls',
      'Custom reporting built to your requirements',
    ],
    limits: [
      { label: 'Paid channels', value: 'Unlimited' },
      { label: 'Creative concepts', value: 'Scoped per engagement' },
      { label: 'Strategy calls', value: 'Weekly' },
    ],
    reporting: 'Custom reporting and cadence',
    support: 'Dedicated account lead',
    verificationStatus: 'pending',
  },
]

/**
 * Effective monthly price for a billing period.
 * Quarterly applies the advertised 10% discount to the monthly rate.
 */
export function effectiveMonthlyPrice(plan: Plan, period: BillingPeriod): number | null {
  if (plan.monthlyPrice === null) return null
  if (period === 'monthly') return plan.monthlyPrice
  return Math.round(plan.monthlyPrice * (1 - QUARTERLY_DISCOUNT))
}

/** Total billed up front for a quarterly commitment. */
export function quarterlyTotal(plan: Plan): number | null {
  const monthly = effectiveMonthlyPrice(plan, 'quarterly')
  return monthly === null ? null : monthly * 3
}

/** Rows for the expandable comparison table, derived from plan data. */
export type ComparisonRow = { feature: string; values: (string | boolean)[] }

export const comparisonRows: ComparisonRow[] = [
  { feature: 'Paid channels managed', values: ['2', '4', 'Unlimited'] },
  { feature: 'SEO programme', values: ['Foundations', 'Full programme', 'Full programme'] },
  { feature: 'Content production', values: [false, true, true] },
  { feature: 'Creative concepts per month', values: ['2', '6', 'Scoped per engagement'] },
  { feature: 'Conversion tracking setup', values: [true, true, true] },
  { feature: 'CRM setup and pipeline reporting', values: [false, true, true] },
  { feature: 'Outbound and SDR support', values: [false, false, true] },
  { feature: 'E-commerce CRO programme', values: [false, true, true] },
  { feature: 'Live performance dashboard', values: [false, true, true] },
  { feature: 'Reporting cadence', values: ['Monthly', 'Bi-weekly', 'Custom'] },
  { feature: 'Strategy calls', values: ['Monthly', 'Bi-weekly', 'Weekly'] },
  { feature: 'Dedicated account lead', values: [false, false, true] },
  { feature: 'Support', values: ['Email, next day', 'Shared channel, same day', 'Dedicated lead'] },
]

/** Onboarding offer from the draft — unconfirmed, so it is gated like any claim. */
export const pricingNote = {
  text: 'All plans include a free initial audit and onboarding.',
  verificationStatus: 'pending' as VerificationStatus,
}
