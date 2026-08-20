import type { Metadata } from 'next'
import { privacy } from '@/content/legal'
import { PageHero } from '@/components/site/marketing/PageHero'
import { LegalDocumentBody } from '@/components/site/marketing/LegalDocument'
import { Section } from '@/components/site/layout/Section'
import { buildMetadata } from '@/lib/site/seo'

export const metadata: Metadata = buildMetadata({
  title: privacy.title,
  description: privacy.intro,
  path: '/privacy',
})

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={privacy.title}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: privacy.title, path: '/privacy' },
        ]}
        meta={
          <p className="text-body-sm text-muted-dark">
            Last updated{' '}
            <time dateTime={privacy.updatedAt}>
              {new Intl.DateTimeFormat('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              }).format(new Date(privacy.updatedAt))}
            </time>
          </p>
        }
      />

      <Section tone="light">
        <LegalDocumentBody document={privacy} />
      </Section>
    </>
  )
}
