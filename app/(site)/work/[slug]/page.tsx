import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { caseStudies, getCaseStudy, relatedCaseStudies } from '@/content/case-studies'
import { getService } from '@/content/services'
import { testimonials } from '@/content/testimonials'
import { canPublish, needsLabel, isVerified, showsUnverified } from '@/content/verification'
import { PageHero } from '@/components/site/marketing/PageHero'
import { CaseStudyCard } from '@/components/site/marketing/CaseStudyCard'
import { ConversionCTA } from '@/components/site/marketing/ConversionCTA'
import { Section } from '@/components/site/layout/Section'
import { SectionHeading } from '@/components/site/ui/SectionHeading'
import { UnverifiedNotice } from '@/components/site/ui/UnverifiedNotice'
import { JsonLd } from '@/components/site/JsonLd'
import { buildMetadata, breadcrumbSchema } from '@/lib/site/seo'

export function generateStaticParams() {
  return caseStudies.map(study => ({ slug: study.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study) return buildMetadata({ title: 'Not found', description: '', path: '/work', noIndex: true })

  const name = needsLabel(study) ? study.anonymisedLabel : study.client
  return buildMetadata({
    title: `${name} — ${study.industry} case study`,
    description: study.summary,
    path: `/work/${study.slug}`,
    // Unverified case studies are kept out of the index rather than published as fact.
    noIndex: needsLabel(study),
  })
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const study = getCaseStudy(slug)
  if (!study || !canPublish(study)) notFound()

  const name = needsLabel(study) ? study.anonymisedLabel : study.client
  const path = `/work/${study.slug}`
  const related = relatedCaseStudies(study.slug)

  // Testimonial renders only when the quote itself has been verified.
  const testimonial = study.testimonialId
    ? testimonials.find(t => t.id === study.testimonialId)
    : undefined
  const showTestimonial = testimonial && isVerified(testimonial)

  return (
    <>
      <PageHero
        eyebrow={`${study.industry} · ${study.market}`}
        title={name}
        lead={study.summary}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name, path },
        ]}
        aside={
          <div className="rounded-lg border border-white/12 bg-surface-dark p-6">
            {/* Results are three separate headline numbers, so they are stat
                tiles. Charting them would imply a series the data does not have. */}
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
              Results
            </p>
            <dl className="mt-4 space-y-5">
              {study.results.map(result => (
                <div key={result.label} className="border-t border-white/10 pt-4 first:border-t-0 first:pt-0">
                  <dd className="tabular font-display text-metric-sm text-white">{result.value}</dd>
                  <dt className="mt-1 text-body-sm text-muted-dark">{result.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        }
        meta={
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
                Business model
              </dt>
              <dd className="mt-1 text-body-sm text-white">{study.businessModel}</dd>
            </div>
            <div>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
                Services
              </dt>
              <dd className="mt-1 text-body-sm text-white">
                {study.services.map(s => getService(s)?.name ?? s).join(', ')}
              </dd>
            </div>
            <div>
              <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
                Market
              </dt>
              <dd className="mt-1 text-body-sm text-white">{study.market}</dd>
            </div>
          </dl>
        }
      />

      <Section tone="light" aria-labelledby="story-heading">
        <h2 id="story-heading" className="sr-only">
          Engagement detail
        </h2>

        {showsUnverified && needsLabel(study) ? (
          <UnverifiedNotice className="mb-12">
            <strong className="font-medium text-navy">Unverified case study.</strong> This
            engagement came from the supplied draft and has not been confirmed. The client
            name is withheld and the results below should be treated as illustrative, not
            as a statement of past performance.
          </UnverifiedNotice>
        ) : null}

        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <div className="space-y-12">
              <Block title="Client overview" body={study.overview} />
              <Block title="Market context" body={study.marketContext} />
              <Block title="The core challenge" body={study.challenge} />

              <div>
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                  Initial diagnosis
                </h3>
                <ul className="mt-4 space-y-3">
                  {study.diagnosis.map((item, index) => (
                    <li key={item} className="flex gap-4">
                      <span className="font-mono text-body-sm text-violet-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="max-w-measure text-body text-slate-strong">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Block title="Strategy" body={study.strategy} />

              <div>
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                  Execution
                </h3>
                <ol className="mt-4 divide-y divide-soft-gray border-y border-soft-gray">
                  {study.execution.map(item => (
                    <li key={item.title} className="py-5">
                      <p className="text-subheading text-navy">{item.title}</p>
                      <p className="mt-1.5 max-w-measure text-body-sm text-slate-strong">
                        {item.detail}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <aside className="min-w-0 lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-lg border border-soft-gray bg-off-white p-6">
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                  Systems and channels
                </h3>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {study.systems.map(system => (
                    <li
                      key={system}
                      className="rounded-sm border border-soft-gray bg-white px-2.5 py-1 text-body-sm text-slate-strong"
                    >
                      {system}
                    </li>
                  ))}
                </ul>

                <h3 className="mt-8 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                  Timeline
                </h3>
                <ol className="mt-4 space-y-4">
                  {study.timeline.map(phase => (
                    <li key={phase.phase} className="border-l-2 border-violet-500 pl-4">
                      <p className="text-body-sm font-medium text-navy">{phase.phase}</p>
                      <p className="tabular font-mono text-[0.75rem] text-slate">{phase.window}</p>
                      <p className="mt-1 text-body-sm text-slate-strong">{phase.focus}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      {showTestimonial ? (
        <Section tone="ink" aria-labelledby="testimonial-heading">
          <h2 id="testimonial-heading" className="sr-only">
            Client testimonial
          </h2>
          <figure className="mx-auto max-w-3xl text-center">
            <blockquote>
              <p className="font-display text-display-md text-balance text-white">
                “{testimonial.quote}”
              </p>
            </blockquote>
            <figcaption className="mt-7 text-body-sm text-muted-dark">
              {testimonial.name} — {testimonial.role}, {testimonial.company}
            </figcaption>
          </figure>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section tone="off-white" aria-labelledby="related-work-heading">
          <SectionHeading
            id="related-work-heading"
            eyebrow="Related work"
            title="Similar engagements"
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            {related.map(item => (
              <CaseStudyCard key={item.slug} study={item} className="h-full" />
            ))}
          </div>
        </Section>
      ) : null}

      <ConversionCTA
        title="Facing something similar?"
        lead="Book a free 30-minute call. We will tell you how close your situation actually is to this one — and where it differs."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Work', path: '/work' },
          { name, path },
        ])}
      />
    </>
  )
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">{title}</h3>
      <p className="mt-3 max-w-measure text-body-lg text-slate-strong">{body}</p>
    </div>
  )
}
