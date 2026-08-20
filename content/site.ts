import type { VerificationStatus } from './verification'

/**
 * Single source of truth for company identity and contact details.
 *
 * Contact values are configuration placeholders: no real NEOMAX phone number,
 * address, or social handle was supplied, so none is invented here. Set the
 * matching environment variables to publish real details.
 */

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://neomax.tech'

export type ContactChannel = {
  value: string
  /** false until a real, supplied value replaces the placeholder */
  configured: boolean
}

function channel(envValue: string | undefined, placeholder: string): ContactChannel {
  return envValue
    ? { value: envValue, configured: true }
    : { value: placeholder, configured: false }
}

export const site = {
  name: 'NEOMAX',
  legalName: 'NEOMAX Technologies',
  url: siteUrl,
  domain: 'neomax.tech',
  tagline: 'We don’t just market your business. We engineer its growth.',
  description:
    'NEOMAX is a global growth agency delivering high-performance digital marketing, revenue-focused sales systems, and conversion-optimized e-commerce for brands ready to scale.',
  shortDescription:
    'Global growth partner for ambitious companies: performance marketing, revenue systems, and e-commerce growth.',

  contact: {
    email: channel(process.env.NEXT_PUBLIC_CONTACT_EMAIL, 'hello@neomax.tech'),
    phone: channel(process.env.NEXT_PUBLIC_CONTACT_PHONE, ''),
    bookingUrl: channel(process.env.NEXT_PUBLIC_BOOKING_URL, '/contact'),
  },

  /**
   * Incorporation. The draft claims "Canadian-Incorporated"; that is a legal
   * statement, so it stays unverified until NEOMAX confirms it, and the footer
   * and proof pillar both respect this flag.
   */
  incorporation: {
    statement: 'Canadian incorporated',
    country: 'Canada',
    verificationStatus: 'pending' as VerificationStatus,
  },

  /**
   * Social profiles are only rendered when a URL is supplied. No handles were
   * provided, so the array is empty by default rather than guessed.
   */
  social: [] as { label: string; url: string }[],

  /** Response-time and offer claims — unverified until NEOMAX confirms. */
  promises: [
    { label: 'No contract required to start', verificationStatus: 'pending' as VerificationStatus },
    { label: 'Free initial growth audit', verificationStatus: 'pending' as VerificationStatus },
    { label: 'Response within 24 hours', verificationStatus: 'pending' as VerificationStatus },
  ],

  /** Country reach claim used in the hero credibility line. */
  reach: {
    countries: 15,
    label: 'Trusted by growing businesses across 15+ countries',
    verificationStatus: 'pending' as VerificationStatus,
  },
} as const

export const OG_IMAGE = '/opengraph-image'
