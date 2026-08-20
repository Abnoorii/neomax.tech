import type { Metadata } from 'next'
import { Header } from '@/components/site/layout/Header'
import { Footer } from '@/components/site/layout/Footer'
import { site } from '@/content/site'
import { JsonLd } from '@/components/site/JsonLd'
import { organizationSchema, professionalServiceSchema } from '@/lib/site/seo'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — Growth engineered for ambitious companies`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.legalName,
  authors: [{ name: site.legalName }],
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/apple-icon.png' }],
  },
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="neomax-root flex min-h-screen flex-col bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-violet-500 focus:px-4 focus:py-3 focus:text-body-sm focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
      <JsonLd data={[organizationSchema(), professionalServiceSchema()]} />
    </div>
  )
}
