import type { Metadata } from 'next'
import { terms } from '@/content/legal'
import { PageHero } from '@/components/site/marketing/PageHero'
import { LegalDocumentBody } from '@/components/site/marketing/LegalDocument'
import { Section } from '@/components/site/layout/Section'
import { buildMetadata } from '@/lib/site/seo'

export const metadata: Metadata = buildMetadata({
  title: terms.title,
  description: terms.intro,
  path: '/terms',
})

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={terms.title}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: terms.title, path: '/terms' },
        ]}
        meta={
          <p className="text-body-sm text-muted-dark">
            Last updated{' '}
            <time dateTime={terms.updatedAt}>
              {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              }).format(new Date(terms.updatedAt))}
            </time>
          </p>
        }
      />

      <Section tone="light">
        <LegalDocumentBody document={terms} />
      </Section>
    </>
  )
}
