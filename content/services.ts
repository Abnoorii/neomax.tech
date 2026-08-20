import type { LucideIcon } from 'lucide-react'
import { BarChart3, Workflow, ShoppingCart, Palette, Bot, Megaphone, LineChart } from 'lucide-react'

export type ServiceSlug = 'performance-marketing' | 'revenue-sales' | 'ecommerce-growth'

export type Capability = {
  name: string
  detail: string
}

export type ServiceFAQ = {
  question: string
  answer: string
}

export type Service = {
  slug: ServiceSlug
  /** Ordinal shown in the practice list — kept in data so markup stays dumb. */
  index: string
  name: string
  /** One-line summary used on cards and in navigation. */
  summary: string
  /** Hero statement on the service detail page. */
  heroStatement: string
  heroSupport: string
  idealClient: string
  /** The commercial problem this practice exists to solve. */
  problem: string
  /** How NEOMAX approaches it. */
  approach: string
  /** The commercial result the client is buying. */
  outcome: string
  painPoints: string[]
  outcomes: { title: string; detail: string }[]
  capabilities: Capability[]
  deliverables: string[]
  kpis: string[]
  /** Operating process specific to this practice. */
  operating: { title: string; detail: string }[]
  /** Platforms the practice runs on. Tooling, not partnerships. */
  ecosystem: string[]
  reporting: string
  faqs: ServiceFAQ[]
  relatedCaseStudy: string
  icon: LucideIcon
}

export const services: Service[] = [
  {
    slug: 'performance-marketing',
    index: '01',
    name: 'Performance Marketing',
    summary: 'SEO, paid search, paid social, email, and creative — engineered around return, not reach.',
    heroStatement: 'Paid media that is measured in revenue, not impressions.',
    heroSupport:
      'We rebuild acquisition around a single question: what does one more dollar of spend return? Channels, creative, and tracking are all pointed at that answer.',
    idealClient:
      'Companies already spending on acquisition who cannot confidently explain which channel produced last month’s revenue.',
    problem:
      'Budget is spread across channels that each report their own version of success. Platform-reported conversions overlap, creative fatigue goes unnoticed, and spend keeps rising while contribution margin quietly falls.',
    approach:
      'We instrument measurement first, then rebuild the account structure around incrementality. Creative moves to a testing cadence with a named hypothesis per variant, and budget follows verified contribution rather than last-click credit.',
    outcome:
      'A clear cost of acquisition per channel, a repeatable creative pipeline, and a spend plan you can defend to a board.',
    painPoints: [
      'Platform-reported ROAS does not reconcile with what lands in the bank.',
      'Creative output is inconsistent, and losing variants stay live for weeks.',
      'Organic and paid teams compete for the same terms instead of covering each other.',
      'Nobody can say which channel to cut first if budget tightened tomorrow.',
    ],
    outcomes: [
      { title: 'Defensible attribution', detail: 'One reporting model that reconciles platform data against actual revenue, so budget decisions stop being arguments.' },
      { title: 'A creative engine', detail: 'A standing production and testing cadence, with each variant tied to a written hypothesis and a kill threshold.' },
      { title: 'Channel-level economics', detail: 'Cost per acquisition and contribution margin per channel, refreshed on a fixed reporting rhythm.' },
    ],
    capabilities: [
      { name: 'SEO', detail: 'Technical health, information architecture, and content built for how search now surfaces answers.' },
      { name: 'Google Ads', detail: 'Search, Shopping, and Performance Max structured for margin rather than volume.' },
      { name: 'Meta Ads', detail: 'Account structure, audience strategy, and creative rotation tied to a test calendar.' },
      { name: 'Paid social', detail: 'Channel expansion beyond Meta where the audience and unit economics justify it.' },
      { name: 'Email marketing', detail: 'Lifecycle flows, segmentation, and campaign calendars that carry their own revenue line.' },
      { name: 'Content strategy', detail: 'Editorial planning mapped to real buying questions, not keyword volume alone.' },
      { name: 'Conversion tracking', detail: 'Server-side events, deduplication, and consent-aware measurement.' },
      { name: 'Analytics', detail: 'Reporting models that reconcile ad platforms with your source of truth.' },
      { name: 'Creative testing', detail: 'Structured variant testing with named hypotheses and pre-set kill thresholds.' },
      { name: 'Attribution', detail: 'Blended and incrementality-aware views instead of a single last-click number.' },
    ],
    deliverables: [
      'Measurement and tracking audit with a prioritised fix list',
      'Rebuilt campaign architecture across active channels',
      'Creative testing calendar and production pipeline',
      'Channel-level economics dashboard',
      'Monthly performance review with next-cycle plan',
    ],
    kpis: ['Blended CAC', 'Contribution margin per channel', 'ROAS (verified, not platform-reported)', 'Creative win rate', 'Organic non-brand traffic'],
    operating: [
      { title: 'Instrument', detail: 'Fix tracking before touching spend. A channel cannot be optimised while its numbers are wrong.' },
      { title: 'Restructure', detail: 'Rebuild account structure so budget can move between intents without resetting learning.' },
      { title: 'Test', detail: 'Run a fixed weekly creative and audience test slate with written hypotheses.' },
      { title: 'Reallocate', detail: 'Shift budget on verified contribution at a set cadence, not on reactive daily edits.' },
    ],
    ecosystem: ['Google Ads', 'Meta Ads Manager', 'GA4', 'Google Tag Manager', 'Google Search Console', 'Looker Studio', 'Klaviyo', 'Ahrefs or Semrush'],
    reporting:
      'A live dashboard plus a written monthly review. The dashboard carries channel economics; the review explains what changed, what it cost, and what we are doing next cycle.',
    faqs: [
      { question: 'Do you require a minimum ad spend?', answer: 'No fixed minimum, but below roughly $5,000 per month there is rarely enough signal to test channels against each other, and a narrower engagement usually serves the client better.' },
      { question: 'Who owns the ad accounts?', answer: 'You do. We work inside your accounts under delegated access, and access remains yours if the engagement ends.' },
      { question: 'How long before results are visible?', answer: 'Tracking and structural fixes land in the first weeks. Paid channels typically need one to two full optimisation cycles before reallocation decisions are reliable, and SEO works on a longer horizon than paid.' },
      { question: 'Do you produce the creative?', answer: 'Yes. Creative production runs on a standing cadence, and testing is structured so losing variants are retired on a defined threshold rather than left running.' },
    ],
    relatedCaseStudy: 'aurora-fashion-uae',
    icon: BarChart3,
  },
  {
    slug: 'revenue-sales',
    index: '02',
    name: 'Revenue & Sales',
    summary: 'CRM, funnels, outbound, and SDR systems that turn generated demand into booked pipeline.',
    heroStatement: 'Demand is only worth what your sales system converts.',
    heroSupport:
      'Most pipeline problems are not lead-volume problems. They are routing, qualification, and follow-up problems. We rebuild the system between a lead arriving and a deal closing.',
    idealClient:
      'B2B and considered-purchase companies where leads arrive but conversion depends on manual, inconsistent follow-up.',
    problem:
      'Leads land in a CRM nobody trusts. Qualification is subjective, follow-up depends on who remembers, and forecasting is guesswork because pipeline stages mean different things to different reps.',
    approach:
      'We define stages by observable buyer behaviour, then build the routing, scoring, and follow-up automation that enforces them. Outbound is added only once inbound handling is reliable.',
    outcome:
      'A pipeline you can forecast from, follow-up that happens regardless of workload, and a clear read on which sources produce closed revenue.',
    painPoints: [
      'CRM data is stale, so forecasts are built on optimism.',
      'Speed-to-lead is measured in days when it should be minutes.',
      'Reps spend selling hours on unqualified conversations.',
      'Marketing and sales disagree about what "qualified" means.',
    ],
    outcomes: [
      { title: 'A pipeline you can forecast', detail: 'Stages defined by buyer behaviour rather than rep sentiment, so stage-to-stage conversion becomes a real number.' },
      { title: 'Follow-up that always happens', detail: 'Sequenced, automated follow-up so no qualified lead depends on someone remembering.' },
      { title: 'Source-level revenue truth', detail: 'Closed revenue attributed back to the source that produced it, closing the loop with marketing.' },
    ],
    capabilities: [
      { name: 'CRM setup', detail: 'Object model, pipeline stages, and required fields built to match how you actually sell.' },
      { name: 'Sales funnels', detail: 'Offer, landing, and booking flows designed against qualification criteria.' },
      { name: 'Cold outreach', detail: 'Targeted outbound with deliverability infrastructure and researched messaging.' },
      { name: 'Lead qualification', detail: 'A shared, written definition of qualified, enforced in the CRM rather than in meetings.' },
      { name: 'Automation', detail: 'Routing, task creation, reminders, and hand-offs that run without manual intervention.' },
      { name: 'SDR as a Service', detail: 'Trained outbound resource operating inside your CRM and your messaging.' },
      { name: 'Pipeline reporting', detail: 'Stage conversion, velocity, and ageing surfaced where leadership already looks.' },
      { name: 'Lead scoring', detail: 'Behavioural and firmographic scoring that changes routing, not just a display field.' },
      { name: 'Follow-up systems', detail: 'Multi-touch cadences across email, phone, and social with defined exit rules.' },
      { name: 'Sales enablement', detail: 'Call frameworks, objection handling, and collateral tied to real pipeline blockers.' },
    ],
    deliverables: [
      'CRM audit and rebuilt pipeline architecture',
      'Written qualification criteria agreed by marketing and sales',
      'Routing, scoring, and follow-up automation',
      'Outbound infrastructure and sequences, where in scope',
      'Pipeline reporting with stage conversion and velocity',
    ],
    kpis: ['Speed to first response', 'MQL to SQL conversion', 'Stage-to-stage conversion', 'Pipeline velocity', 'Cost per booked meeting'],
    operating: [
      { title: 'Map', detail: 'Document how a deal actually moves today, including the informal steps nobody wrote down.' },
      { title: 'Define', detail: 'Agree qualification criteria in writing, then enforce them in the CRM.' },
      { title: 'Automate', detail: 'Build routing and follow-up so the defined process runs without depending on memory.' },
      { title: 'Scale', detail: 'Add outbound volume only once inbound handling is proven reliable.' },
    ],
    ecosystem: ['HubSpot', 'Pipedrive', 'Salesforce', 'Instantly or Smartlead', 'Apollo', 'Zapier or Make', 'Calendly', 'Slack'],
    reporting:
      'Pipeline reporting delivered inside your CRM so it stays live, plus a scheduled review covering stage conversion, velocity, and where deals are ageing.',
    faqs: [
      { question: 'Do we need to change CRM?', answer: 'Usually not. Most engagements rebuild the configuration of the CRM you already own. We only recommend migrating when the current platform genuinely cannot support the process.' },
      { question: 'What does SDR-as-a-Service include?', answer: 'A trained outbound resource working inside your CRM, your messaging, and your qualification criteria, reporting into the same pipeline metrics as your internal team.' },
      { question: 'Is cold outreach compliant?', answer: 'Outbound is scoped per market against the rules that apply there, including consent requirements where relevant. Deliverability infrastructure and suppression handling are set up as part of the build.' },
      { question: 'Will this replace our sales team?', answer: 'No. It removes administrative and follow-up load so the team spends more hours in qualified conversations.' },
    ],
    relatedCaseStudy: 'northwind-saas-canada',
    icon: Workflow,
  },
  {
    slug: 'ecommerce-growth',
    index: '03',
    name: 'E-commerce Growth',
    summary: 'Storefront, product page, and checkout work that lifts what each existing session is worth.',
    heroStatement: 'Grow revenue without buying more traffic.',
    heroSupport:
      'When acquisition costs rise, the fastest available margin is in the traffic you already pay for. We work the storefront, product page, and checkout as one connected system.',
    idealClient:
      'Shopify and WooCommerce brands with meaningful traffic whose conversion rate or average order value has plateaued.',
    problem:
      'Rising CPMs squeeze margin, so the store has to earn more per visit. But product pages answer the wrong objections, checkout leaks on mobile, and retention is left to a single generic email flow.',
    approach:
      'We diagnose where value is lost between landing and payment, then work the highest-leverage step first. Changes ship as tests where traffic supports it and as reasoned builds where it does not.',
    outcome:
      'More revenue per session, a checkout that holds on mobile, and retention flows that lift repeat rate without extra spend.',
    painPoints: [
      'Traffic grows but conversion rate does not move.',
      'Mobile checkout abandons at a materially higher rate than desktop.',
      'Product pages describe features and never address real purchase objections.',
      'Average order value is flat because nothing encourages a larger basket.',
    ],
    outcomes: [
      { title: 'Higher revenue per session', detail: 'The same traffic, worth more, because the path from landing to payment loses fewer people.' },
      { title: 'A checkout that holds', detail: 'Friction, payment options, and mobile behaviour addressed at the step where money is actually lost.' },
      { title: 'Repeat revenue', detail: 'Post-purchase and retention flows that raise repeat rate without additional acquisition spend.' },
    ],
    capabilities: [
      { name: 'Shopify', detail: 'Theme architecture, app rationalisation, and performance work on Shopify and Shopify Plus.' },
      { name: 'WooCommerce', detail: 'Build, optimisation, and performance work for WordPress-based stores.' },
      { name: 'Store design', detail: 'Merchandising and navigation designed around how the catalogue is actually browsed.' },
      { name: 'Conversion-rate optimization', detail: 'Prioritised testing against the steps that lose the most value.' },
      { name: 'Product-page optimization', detail: 'Page structure built to answer purchase objections in the order they arise.' },
      { name: 'Checkout optimization', detail: 'Friction, payment methods, and mobile behaviour at the point of payment.' },
      { name: 'Integrations', detail: 'Subscriptions, reviews, loyalty, ERP, and fulfilment connected without bloating the stack.' },
      { name: 'Analytics', detail: 'Funnel and cohort instrumentation that shows where value is lost, step by step.' },
      { name: 'Retention', detail: 'Post-purchase flows, win-back, and lifecycle segmentation.' },
      { name: 'Ongoing support', detail: 'A standing build and optimisation cadence rather than one-off project work.' },
    ],
    deliverables: [
      'Funnel diagnosis from landing through payment',
      'Prioritised CRO backlog scored by value at risk',
      'Product page and checkout implementation',
      'Retention and post-purchase flow build',
      'Cohort and funnel reporting',
    ],
    kpis: ['Conversion rate by device', 'Average order value', 'Revenue per session', 'Checkout completion rate', 'Repeat purchase rate'],
    operating: [
      { title: 'Diagnose', detail: 'Instrument the funnel and quantify the value lost at each step before changing anything.' },
      { title: 'Prioritise', detail: 'Rank the backlog by value at risk against implementation effort.' },
      { title: 'Ship', detail: 'Test where traffic supports significance; build on reasoned judgement where it does not.' },
      { title: 'Retain', detail: 'Extend past the first purchase into repeat rate and lifetime value.' },
    ],
    ecosystem: ['Shopify', 'Shopify Plus', 'WooCommerce', 'Klaviyo', 'GA4', 'Recharge', 'Stripe', 'Microsoft Clarity'],
    reporting:
      'Funnel and cohort reporting refreshed on the engagement’s cadence, with each shipped change logged against the metric it was intended to move.',
    faqs: [
      { question: 'Do you rebuild the whole store?', answer: 'Only when the current build is the constraint. Most engagements are targeted work on the steps losing the most value, which returns faster than a full replatform.' },
      { question: 'How much traffic is needed for testing?', answer: 'Reliable A/B testing generally needs a few thousand sessions per variant per week. Below that we ship reasoned changes and measure against a cohort baseline instead of claiming significance we do not have.' },
      { question: 'Do you work with headless builds?', answer: 'Yes, though we will say plainly when headless is not the constraint. Most plateaued stores have more to gain from merchandising and checkout work than from a replatform.' },
      { question: 'Can you work alongside our developers?', answer: 'Yes. We can specify and hand off, or implement directly in your theme and repository, depending on how your team prefers to work.' },
    ],
    relatedCaseStudy: 'lumen-beauty-uk',
    icon: ShoppingCart,
  },
]

export function getService(slug: string): Service | undefined {
  return services.find(service => service.slug === slug)
}

/** Supporting capabilities that sit across all three practices. */
export const supportingCapabilities: { name: string; detail: string; icon: LucideIcon }[] = [
  { name: 'Branding & Creative', detail: 'Positioning, identity, and campaign creative that stays consistent across channels.', icon: Palette },
  { name: 'Marketing Automation', detail: 'Lifecycle and trigger-based automation connecting marketing to the CRM.', icon: Bot },
  { name: 'Influencer Marketing', detail: 'Creator sourcing, briefing, and performance tracking against agreed metrics.', icon: Megaphone },
  { name: 'Analytics & Reporting', detail: 'One reporting model across channels so numbers reconcile in a single place.', icon: LineChart },
]
