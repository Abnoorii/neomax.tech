import type { VerificationStatus } from './verification'

/**
 * About page content.
 *
 * No individual team members are described: real team data was not supplied,
 * and inventing profiles would be a fabrication. The team is explained by
 * discipline instead, which is accurate and independently useful to a buyer.
 */
export const positioning = {
  eyebrow: 'About NEOMAX',
  headline: 'A growth partner that operates like an operator, not a vendor.',
  lead: 'NEOMAX exists for companies that already know marketing matters and are tired of buying activity instead of outcomes. We work inside your accounts, on your numbers, against targets you agreed to.',
}

export const story: { heading: string; paragraphs: string[] } = {
  heading: 'Why we work this way',
  paragraphs: [
    'Most agency relationships fail in the same place. The agency reports on the metrics it controls, the client cares about the metrics on the P&L, and the two never quite reconcile. Nobody is lying. The reporting was just never built to answer the question the client was actually asking.',
    'NEOMAX was built around closing that gap. Every engagement starts by validating measurement, because a number nobody trusts cannot be optimised and cannot settle an argument. Once the baseline holds, the work becomes straightforward: change something specific, measure what it did, keep it or retire it, and write down which.',
    'That is a slower opening than most agencies offer. It is also why our reviews tend to be short — when the measurement was agreed in advance, the results are not open to interpretation.',
  ],
}

export const operatingPrinciples: { title: string; detail: string }[] = [
  {
    title: 'Measurement before optimisation',
    detail: 'No channel is optimised until its tracking has been validated. Fixing the reporting first is unglamorous, and it is the difference between improvement and the appearance of improvement.',
  },
  {
    title: 'One number, agreed in advance',
    detail: 'Each engagement is judged on a KPI set defined during the roadmap phase. We do not select a favourable metric after the fact.',
  },
  {
    title: 'Your accounts, your access',
    detail: 'We work inside your platforms under delegated access. Nothing is held in an agency account you cannot reach, and access remains yours if the engagement ends.',
  },
  {
    title: 'Written decisions',
    detail: 'Tests carry a written hypothesis and a kill threshold before they run, so results are read against a prediction rather than rationalised afterwards.',
  },
  {
    title: 'Say what did not work',
    detail: 'Every review covers the work that failed as well as the work that landed. An agency that only reports wins is not reporting.',
  },
  {
    title: 'Scope honestly',
    detail: 'If a smaller engagement would serve you better, we will say so. Selling a plan that cannot produce a return is a short relationship.',
  },
]

export const philosophy = {
  heading: 'How we think about growth',
  paragraphs: [
    'Growth is not a channel problem. It is a systems problem that shows up first in whichever channel is easiest to blame.',
    'A company with weak follow-up does not have a lead-generation problem, even though more leads is what it will ask for. A store with a leaking checkout does not have a traffic problem. Buying more of the input rarely fixes a constraint further down the system, which is why we diagnose the whole path from first impression to closed revenue before recommending where budget should go.',
    'This is also why the three practices are not sold in isolation. Acquisition, sales conversion, and on-site experience are the same funnel viewed from different points, and optimising one while ignoring the next is how spend gets wasted efficiently.',
  ],
}

/** Team described by discipline. No individual profiles are invented. */
export const teamStructure: { discipline: string; responsibility: string; worksOn: string }[] = [
  { discipline: 'Growth strategy', responsibility: 'Owns the diagnosis, the roadmap, and the KPI set the engagement is judged on.', worksOn: 'Audit, roadmap, quarterly planning' },
  { discipline: 'Performance media', responsibility: 'Runs paid channels day to day, including structure, bidding, and budget reallocation.', worksOn: 'Google Ads, Meta, paid social' },
  { discipline: 'Search and content', responsibility: 'Technical SEO, information architecture, and the editorial programme.', worksOn: 'Organic search, content production' },
  { discipline: 'Creative', responsibility: 'Produces and iterates ad creative against the testing calendar.', worksOn: 'Concepts, production, variant testing' },
  { discipline: 'Revenue systems', responsibility: 'CRM architecture, qualification logic, routing, and follow-up automation.', worksOn: 'HubSpot, Pipedrive, Salesforce' },
  { discipline: 'E-commerce engineering', responsibility: 'Storefront, product page, and checkout implementation and performance.', worksOn: 'Shopify, WooCommerce' },
  { discipline: 'Analytics', responsibility: 'Measurement design, tracking implementation, and reporting models.', worksOn: 'GA4, server-side tracking, dashboards' },
]

export const workingModel: { title: string; detail: string }[] = [
  { title: 'A named lead', detail: 'One person owns the relationship and the roadmap. You are not routed through an account manager who relays questions to the people doing the work.' },
  { title: 'Fixed cycles', detail: 'Work ships in cycles with a defined scope, so results can be attributed to specific changes rather than to everything at once.' },
  { title: 'Shared channel', detail: 'Day-to-day communication happens in a shared channel rather than through scheduled status meetings.' },
  { title: 'Written reviews', detail: 'Each cycle closes with a written review covering what changed, what it cost, and what we recommend next.' },
]

export const globalExperience = {
  heading: 'Working across markets',
  body: 'Multi-market work is scoped per region rather than translated from a single campaign. That means local compliance constraints, currency and payment handling, market-specific creative, and separate performance baselines per region — because a channel that carries one market often underperforms in the next.',
  verificationStatus: 'pending' as VerificationStatus,
}
