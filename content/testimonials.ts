import type { VerificationStatus } from './verification'

/**
 * Testimonials from the supplied draft.
 *
 * The draft repeated the same eight quotes several times; duplicates were
 * removed and the unique set is kept here. None has been confirmed with the
 * named individual, so every entry is `demo`: in demo mode names and companies
 * are withheld and the quote is attributed by role and market only, and in
 * verified-only mode the section does not render at all.
 */
export type Testimonial = {
  id: string
  quote: string
  /** Withheld from render while unverified — kept so verification is one edit. */
  name: string
  role: string
  company: string
  countryCode: string
  country: string
  verificationStatus: VerificationStatus
}

export const testimonials: Testimonial[] = [
  {
    id: 'aurora-cmo',
    quote: 'NEOMAX rebuilt our funnel and tripled qualified pipeline in one quarter.',
    name: 'Sara Khan',
    role: 'CMO',
    company: 'Aurora Labs',
    countryCode: 'CA',
    country: 'Canada',
    verificationStatus: 'demo',
  },
  {
    id: 'vertex-founder',
    quote: 'The most sophisticated paid media team we have ever worked with. Period.',
    name: 'Daniel Reyes',
    role: 'Founder',
    company: 'Vertex DTC',
    countryCode: 'US',
    country: 'United States',
    verificationStatus: 'demo',
  },
  {
    id: 'halcyon-growth',
    quote: 'We went from 1.4x to 5.6x ROAS in 90 days. The dashboards are gold.',
    name: 'Aisha Al-Mansoori',
    role: 'Head of Growth',
    company: 'Halcyon',
    countryCode: 'AE',
    country: 'United Arab Emirates',
    verificationStatus: 'demo',
  },
  {
    id: 'northwind-ceo',
    quote: 'Strategic, fast, transparent. They actually act like a partner, not a vendor.',
    name: 'Marcus Lee',
    role: 'CEO',
    company: 'Northwind SaaS',
    countryCode: 'SG',
    country: 'Singapore',
    verificationStatus: 'demo',
  },
  {
    id: 'lumen-founder',
    quote: 'Our Shopify revenue quadrupled in six months without increasing ad spend.',
    name: 'Elena Rossi',
    role: 'Founder',
    company: 'Lumen Beauty',
    countryCode: 'GB',
    country: 'United Kingdom',
    verificationStatus: 'demo',
  },
  {
    id: 'obsidian-vp',
    quote: 'Best onboarding I have experienced. They knew our market better than we did.',
    name: 'Ravi Mehta',
    role: 'VP Marketing',
    company: 'Obsidian',
    countryCode: 'IN',
    country: 'India',
    verificationStatus: 'demo',
  },
  {
    id: 'aurora-cfo',
    quote: 'Reporting is so clean we share it directly with our board every month.',
    name: 'Hannah Becker',
    role: 'CFO',
    company: 'Aurora Labs',
    countryCode: 'DE',
    country: 'Germany',
    verificationStatus: 'demo',
  },
  {
    id: 'northwind-latam',
    quote: 'If you are serious about growth, hire NEOMAX yesterday.',
    name: 'Tomás Álvarez',
    role: 'Founder',
    company: 'Northwind LATAM',
    countryCode: 'MX',
    country: 'Mexico',
    verificationStatus: 'demo',
  },
]

/** Homepage shows at most five, per the brief. */
export const homepageTestimonials = testimonials.slice(0, 5)
