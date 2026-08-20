import type { Metadata } from 'next'
import { site } from '@/content/site'

/**
 * Metadata helper. Every route builds its metadata through this so titles,
 * canonicals, and social cards stay consistent and always resolve against the
 * configured production domain rather than a hardcoded URL.
 */
export function buildMetadata({
  title,
  description,
  path,
  type = 'website',
  publishedTime,
  modifiedTime,
  noIndex,
}: {
  title: string
  description: string
  path: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  noIndex?: boolean
}): Metadata {
  const url = new URL(path, site.url).toString()
  // The route-group layout owns the "%s | NEOMAX" template, so page titles are
  // passed bare and only the homepage opts out of the suffix entirely.
  const fullTitle = path === '/' ? title : `${title} | ${site.name}`

  return {
    title: path === '/' ? { absolute: title } : title,
    description,
    metadataBase: new URL(site.url),
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: site.legalName,
      type,
      locale: 'en_US',
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
  }
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.legalName,
    alternateName: site.name,
    url: site.url,
    description: site.description,
    ...(site.contact.email.configured ? { email: site.contact.email.value } : {}),
    ...(site.social.length > 0 ? { sameAs: site.social.map(profile => profile.url) } : {}),
  }
}

/**
 * ProfessionalService schema. No aggregateRating is emitted: testimonials are
 * unverified and inventing review data as structured markup would be a
 * misrepresentation to search engines.
 */
export function professionalServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.legalName,
    url: site.url,
    description: site.description,
    serviceType: ['Digital marketing', 'Sales enablement', 'E-commerce optimization'],
  }
}

export function serviceSchema({
  name,
  description,
  path,
}: {
  name: string
  description: string
  path: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: new URL(path, site.url).toString(),
    provider: { '@type': 'Organization', name: site.legalName, url: site.url },
  }
}

export function articleSchema({
  title,
  description,
  path,
  publishedAt,
  updatedAt,
  authorName,
}: {
  title: string
  description: string
  path: string
  publishedAt: string
  updatedAt?: string
  authorName: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    url: new URL(path, site.url).toString(),
    datePublished: publishedAt,
    dateModified: updatedAt ?? publishedAt,
    author: { '@type': 'Organization', name: authorName },
    publisher: { '@type': 'Organization', name: site.legalName, url: site.url },
  }
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: new URL(crumb.path, site.url).toString(),
    })),
  }
}

/** Only ever called with FAQ content that is visibly rendered on the page. */
export function faqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}
