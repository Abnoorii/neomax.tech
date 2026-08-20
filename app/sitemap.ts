import type { MetadataRoute } from 'next'
import { site } from '@/content/site'
import { services } from '@/content/services'
import { caseStudies } from '@/content/case-studies'
import { articles } from '@/content/articles'
import { canPublish, needsLabel } from '@/content/verification'

/**
 * Sitemap. Only lists pages we are willing to have indexed: unverified case
 * studies and draft articles are excluded, matching their `noIndex` metadata.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, site.url).toString()
  const now = new Date()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: url('/services'), lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: url('/work'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: url('/insights'), lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: url('/contact'), lastModified: now, changeFrequency: 'yearly', priority: 0.9 },
    { url: url('/privacy'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: url('/terms'), lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const serviceRoutes: MetadataRoute.Sitemap = services.map(service => ({
    url: url(`/services/${service.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const workRoutes: MetadataRoute.Sitemap = caseStudies
    .filter(study => canPublish(study) && !needsLabel(study))
    .map(study => ({
      url: url(`/work/${study.slug}`),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    }))

  const articleRoutes: MetadataRoute.Sitemap = articles
    .filter(article => article.status === 'published')
    .map(article => ({
      url: url(`/insights/${article.slug}`),
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: 'yearly',
      priority: 0.6,
    }))

  return [...staticRoutes, ...serviceRoutes, ...workRoutes, ...articleRoutes]
}
