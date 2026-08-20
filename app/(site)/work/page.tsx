import type { Metadata } from 'next'
import { caseStudies } from '@/content/case-studies'
import { publishable, showsUnverified } from '@/content/verification'
import { PageHero } from '@/components/site/marketing/PageHero'
import { WorkFilters } from '@/components/site/marketing/WorkFilters'
import { ConversionCTA } from '@/components/site/marketing/ConversionCTA'
import { Section } from '@/components/site/layout/Section'
import { UnverifiedNotice } from '@/components/site/ui/UnverifiedNotice'
import { JsonLd } from '@/components/site/JsonLd'
import { buildMetadata, breadcrumbSchema } from '@/lib/site/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Work',
  description:
    'Selected NEOMAX engagements across e-commerce, B2B SaaS, healthcare, and D2C — the challenge, the intervention, and what moved.',
  path: '/work',
})

export default function WorkPage() {
  const studies = publishable(caseStudies)

  return (
    <>
      <PageHero
        eyebrow="Work"
        title="What we changed, and what it moved."
        lead="Each engagement states the constraint we found, what we did about it, and the numbers that followed — including the conditions those numbers depend on."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
        ]}
      />

      <Section tone="light" aria-labelledby="work-list-heading">
        <h2 id="work-list-heading" className="sr-only">
          Case studies
        </h2>

        {showsUnverified ? (
          <UnverifiedNotice className="mb-10">
            These case studies come from the supplied draft and have not been verified.
            Client names are withheld and shown as industry descriptors, and results
            should be treated as illustrative until each engagement is confirmed.
          </UnverifiedNotice>
        ) : null}

        {studies.length > 0 ? (
          <WorkFilters studies={studies} />
        ) : (
          <div className="rounded-lg border border-dashed border-soft-gray bg-off-white p-12 text-center">
            <p className="text-body font-medium text-navy">No published case studies yet.</p>
            <p className="mx-auto mt-2 max-w-measure-sm text-body-sm text-slate-strong">
              Case studies appear here once each engagement has been verified and approved
              for publication.
            </p>
          </div>
        )}
      </Section>

      <ConversionCTA
        title="Want to see what this would look like for you?"
        lead="Book a free 30-minute call and we will walk through the closest comparable engagement we have run."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
        ])}
      />
    </>
  )
}
