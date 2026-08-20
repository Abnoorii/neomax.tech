import type { MetadataRoute } from 'next'
import { site } from '@/content/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // The internal payroll app is not public-facing content.
        disallow: ['/en/', '/dari/', '/pashto/', '/api/', '/auth/'],
      },
    ],
    sitemap: new URL('/sitemap.xml', site.url).toString(),
  }
}
