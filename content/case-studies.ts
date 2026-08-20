import type { VerificationStatus } from './verification'
import type { ServiceSlug } from './services'

/**
 * Case studies from the supplied draft.
 *
 * Client names, markets, and results are all unconfirmed, so every entry is
 * `demo`. In demo mode the cards render under a visible "Illustrative" label
 * and client names are shown as anonymised industry descriptors. In
 * verified-only mode they are removed from the site entirely.
 *
 * Note on charts: only figures actually stated in the source are stored. The
 * draft gives start and end points, never a monthly series, so case studies
 * render before/after comparisons and never an invented time series.
 */
export type CaseStudyResult = {
  label: string
  value: string
  /** Both endpoints, present only where the source genuinely stated them. */
  before?: number
  after?: number
  unit?: 'currency' | 'multiplier' | 'percent' | 'count'
}

export type CaseStudy = {
  slug: string
  /** Shown when verified. */
  client: string
  /** Shown in place of the client name while unverified. */
  anonymisedLabel: string
  industry: string
  businessModel: 'DTC' | 'B2B SaaS' | 'Local services' | 'E-commerce'
  market: string
  countryCode: string
  services: ServiceSlug[]
  summary: string
  /** 1. Client overview */
  overview: string
  /** 2. Market context */
  marketContext: string
  /** 3. Core challenge */
  challenge: string
  /** 4. Initial diagnosis */
  diagnosis: string[]
  /** 5. Strategy */
  strategy: string
  /** 6. Execution */
  execution: { title: string; detail: string }[]
  /** 7. Systems and channels used */
  systems: string[]
  /** 8. Results */
  results: CaseStudyResult[]
  /** 9. Timeline */
  timeline: { phase: string; window: string; focus: string }[]
  /** 10. Testimonial, only rendered when verified. */
  testimonialId?: string
  verificationStatus: VerificationStatus
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'aurora-fashion-uae',
    client: 'Aurora Atelier',
    anonymisedLabel: 'Premium fashion DTC brand',
    industry: 'E-commerce',
    businessModel: 'DTC',
    market: 'United Arab Emirates',
    countryCode: 'AE',
    services: ['performance-marketing', 'ecommerce-growth'],
    summary:
      'Broad prospecting was consuming budget while DTC sales stayed flat against rising organic traffic. Attribution was opaque and creative was fatiguing faster than it could be replaced.',
    overview:
      'A premium fashion label selling direct to consumer across the Gulf, with a growing organic audience and an in-house creative team of two.',
    marketContext:
      'A regional market with high mobile share, strong seasonal peaks around retail events, and rising competition for the same prospecting audiences.',
    challenge:
      'Ad budget was going into broad prospecting while DTC sales stayed flat, even as organic traffic grew. Nobody could say which spend produced which order, so the account was optimised on platform-reported numbers that did not reconcile with revenue.',
    diagnosis: [
      'Conversion events fired inconsistently, so platform-reported ROAS overstated paid contribution.',
      'Prospecting and retargeting shared budget and competed for the same users.',
      'Creative refresh rate was slower than the rate at which variants fatigued.',
      'Organic traffic growth was not routed to pages built to convert it.',
    ],
    strategy:
      'Rebuild measurement first so a baseline could be trusted, then separate prospecting from retargeting, put creative on a fixed production cadence, and give the growing organic audience landing paths designed to convert.',
    execution: [
      { title: 'Measurement rebuild', detail: 'Server-side events with deduplication, so paid and organic contribution could be separated.' },
      { title: 'Account restructure', detail: 'Prospecting and retargeting split with independent budgets and success criteria.' },
      { title: 'Creative cadence', detail: 'A standing weekly production and testing slate with defined kill thresholds per variant.' },
      { title: 'Organic conversion paths', detail: 'Category and product landing pages rebuilt around what organic visitors arrived looking for.' },
    ],
    systems: ['Meta Ads', 'Google Ads', 'GA4', 'Shopify', 'Klaviyo'],
    results: [
      { label: 'Organic traffic', value: '+280%', unit: 'percent' },
      { label: 'Average ROAS', value: '4.2x', unit: 'multiplier' },
      { label: 'Net new revenue', value: '+$1.2M', unit: 'currency' },
    ],
    timeline: [
      { phase: 'Audit', window: 'Weeks 1–2', focus: 'Tracking validation and baseline' },
      { phase: 'Rebuild', window: 'Weeks 3–6', focus: 'Measurement and account restructure' },
      { phase: 'Scale', window: 'Weeks 7–20', focus: 'Creative cadence and budget reallocation' },
    ],
    testimonialId: 'halcyon-growth',
    verificationStatus: 'demo',
  },
  {
    slug: 'northwind-saas-canada',
    client: 'Northwind',
    anonymisedLabel: 'B2B SaaS platform',
    industry: 'SaaS',
    businessModel: 'B2B SaaS',
    market: 'Canada',
    countryCode: 'CA',
    services: ['revenue-sales', 'performance-marketing'],
    summary:
      'High acquisition cost and a weak inbound pipeline were blocking Series A targets, while sales hand-picked leads out of a CRM nobody maintained.',
    overview:
      'A B2B SaaS platform selling to mid-market operations teams, preparing for a Series A raise with a small internal sales function.',
    marketContext:
      'A category with long evaluation cycles and multiple stakeholders per deal, where speed of response materially affects win rate.',
    challenge:
      'Customer acquisition cost was too high to support the growth targets, and inbound pipeline was thin. Sales was manually hand-picking leads out of a HubSpot instance whose data had stopped being reliable.',
    diagnosis: [
      'Pipeline stages were defined by rep sentiment, so forecasting was unreliable.',
      'No shared written definition of a qualified lead existed between marketing and sales.',
      'Speed to first response was measured in days.',
      'Paid spend was optimised to form fills rather than to booked meetings.',
    ],
    strategy:
      'Rebuild the CRM around observable buyer behaviour, agree qualification criteria in writing, automate routing and follow-up, then repoint paid spend at booked meetings rather than raw form fills.',
    execution: [
      { title: 'CRM rebuild', detail: 'Pipeline stages redefined by buyer action, with required fields enforced at each transition.' },
      { title: 'Qualification criteria', detail: 'A written, shared definition of qualified, enforced in the CRM rather than negotiated per deal.' },
      { title: 'Routing and follow-up', detail: 'Automated assignment and multi-touch cadences with defined exit rules.' },
      { title: 'Spend repointing', detail: 'Paid campaigns optimised toward booked meetings, using offline conversion import.' },
    ],
    systems: ['HubSpot', 'Google Ads', 'LinkedIn Ads', 'Apollo', 'Zapier'],
    results: [
      { label: 'Customer acquisition cost', value: '−51%', unit: 'percent' },
      { label: 'Pipeline', value: '3.8x', unit: 'multiplier' },
      { label: 'Marketing qualified leads', value: '+220%', unit: 'percent' },
    ],
    timeline: [
      { phase: 'Audit', window: 'Weeks 1–2', focus: 'CRM and pipeline data review' },
      { phase: 'Rebuild', window: 'Weeks 3–8', focus: 'Stages, qualification, and automation' },
      { phase: 'Scale', window: 'Weeks 9–24', focus: 'Outbound volume and spend reallocation' },
    ],
    testimonialId: 'northwind-ceo',
    verificationStatus: 'demo',
  },
  {
    slug: 'halcyon-clinic-usa',
    client: 'Halcyon Health',
    anonymisedLabel: 'Multi-location healthcare group',
    industry: 'Healthcare',
    businessModel: 'Local services',
    market: 'United States',
    countryCode: 'US',
    services: ['performance-marketing', 'revenue-sales'],
    summary:
      'Lead quality varied widely across twelve clinic locations, with no connection between marketing spend and appointments actually booked.',
    overview:
      'A multi-location clinical services group operating twelve sites, with booking handled locally by each location’s front desk.',
    marketContext:
      'Local search-driven demand where each location competes in its own catchment, and where regulated categories constrain ad messaging.',
    challenge:
      'Lead quality was inconsistent across the twelve locations and there was no attribution between marketing spend and booked appointments. Budget decisions were made on lead volume, which varied in quality by site.',
    diagnosis: [
      'No connection existed between ad platforms and the booking system.',
      'Location-level performance was invisible; spend was managed as one pooled budget.',
      'Front-desk follow-up on missed calls was inconsistent between sites.',
      'Landing experiences did not distinguish between locations.',
    ],
    strategy:
      'Connect spend to booked appointments per location, split budget by catchment performance, and standardise the follow-up process for missed enquiries across all sites.',
    execution: [
      { title: 'Booking attribution', detail: 'Ad platforms connected to the booking system so spend could be measured against appointments.' },
      { title: 'Location-level structure', detail: 'Campaigns and budgets split by catchment, with per-location reporting.' },
      { title: 'Follow-up standardisation', detail: 'A single missed-enquiry process applied across all twelve sites.' },
      { title: 'Local landing experiences', detail: 'Location-specific pages replacing a single generic booking page.' },
    ],
    systems: ['Google Ads', 'Meta Ads', 'GA4', 'Booking platform integration', 'Call tracking'],
    results: [
      { label: 'Bookings', value: '+410%', unit: 'percent' },
      { label: 'Cost per lead', value: '−38%', unit: 'percent' },
      { label: 'Markets covered', value: '12', unit: 'count' },
    ],
    timeline: [
      { phase: 'Audit', window: 'Weeks 1–3', focus: 'Attribution gap and location baselines' },
      { phase: 'Rebuild', window: 'Weeks 4–10', focus: 'Booking integration and campaign split' },
      { phase: 'Scale', window: 'Weeks 11–28', focus: 'Per-location budget reallocation' },
    ],
    verificationStatus: 'demo',
  },
  {
    slug: 'lumen-beauty-uk',
    client: 'Lumen Beauty',
    anonymisedLabel: 'D2C beauty brand',
    industry: 'Beauty',
    businessModel: 'E-commerce',
    market: 'United Kingdom',
    countryCode: 'GB',
    services: ['ecommerce-growth', 'performance-marketing'],
    summary:
      'A profitable brand stalled at a monthly revenue ceiling as rising paid social costs ate into product margin.',
    overview:
      'A direct-to-consumer beauty brand selling on Shopify, profitable but plateaued, with paid social as the dominant acquisition channel.',
    marketContext:
      'A crowded category with high creative saturation, where rising costs per thousand impressions compress margin faster than price increases can offset.',
    challenge:
      'Paid social had plateaued and rising CPMs were eating into product margin. The brand was profitable but stuck at roughly $400K per month, and buying more traffic was no longer accretive.',
    diagnosis: [
      'Revenue per session had not moved while traffic costs rose.',
      'Product pages did not address the objections that actually blocked purchase.',
      'Nothing in the flow encouraged a larger basket.',
      'Retention rested on a single generic post-purchase email.',
    ],
    strategy:
      'Stop trying to buy the ceiling away. Raise what each existing session is worth by working the product page, the basket, and retention, then let paid economics improve as a result.',
    execution: [
      { title: 'Funnel diagnosis', detail: 'Instrumented each step from landing to payment and quantified the value lost at each.' },
      { title: 'Product page rebuild', detail: 'Page structure reordered to answer purchase objections in the sequence they arise.' },
      { title: 'Basket construction', detail: 'Bundling and merchandising designed to raise order value without discounting margin away.' },
      { title: 'Retention flows', detail: 'Segmented post-purchase, replenishment, and win-back flows replacing the single generic email.' },
    ],
    systems: ['Shopify', 'Klaviyo', 'Meta Ads', 'GA4', 'Microsoft Clarity'],
    results: [
      { label: 'ROAS', value: '6.1x', unit: 'multiplier' },
      { label: 'Average order value', value: '+195%', unit: 'percent' },
      { label: 'Cost per acquisition', value: '−44%', unit: 'percent' },
    ],
    timeline: [
      { phase: 'Audit', window: 'Weeks 1–2', focus: 'Funnel instrumentation and value-loss mapping' },
      { phase: 'Rebuild', window: 'Weeks 3–9', focus: 'Product page, basket, and retention' },
      { phase: 'Scale', window: 'Weeks 10–26', focus: 'Paid reallocation against improved economics' },
    ],
    testimonialId: 'lumen-founder',
    verificationStatus: 'demo',
  },
]

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find(study => study.slug === slug)
}

export function relatedCaseStudies(slug: string, limit = 2): CaseStudy[] {
  const current = getCaseStudy(slug)
  if (!current) return caseStudies.slice(0, limit)
  const sharesService = (study: CaseStudy) =>
    study.slug !== slug && study.services.some(service => current.services.includes(service))
  return [...caseStudies.filter(sharesService), ...caseStudies.filter(s => s.slug !== slug)]
    .filter((study, index, all) => all.findIndex(s => s.slug === study.slug) === index)
    .slice(0, limit)
}

/** Filter facets for the Work index, derived from the data rather than hardcoded. */
export function caseStudyFacets(studies: CaseStudy[]) {
  const unique = (values: string[]) => Array.from(new Set(values)).sort()
  return {
    industry: unique(studies.map(s => s.industry)),
    market: unique(studies.map(s => s.market)),
    businessModel: unique(studies.map(s => s.businessModel)),
    service: unique(studies.flatMap(s => s.services)),
  }
}
