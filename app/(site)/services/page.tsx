import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { services } from '@/content/services'
import { getCaseStudy } from '@/content/case-studies'
import { canPublish, needsLabel } from '@/content/verification'
import { PageHero } from '@/components/site/marketing/PageHero'
import { ConversionCTA } from '@/components/site/marketing/ConversionCTA'
import { Section } from '@/components/site/layout/Section'
import { SectionHeading } from '@/components/site/ui/SectionHeading'
import { Reveal } from '@/components/site/ui/Reveal'
import { JsonLd } from '@/components/site/JsonLd'
import { buildMetadata, breadcrumbSchema } from '@/lib/site/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Services',
  description:
    'Performance marketing, revenue and sales systems, and e-commerce growth — three practices operating as one connected growth engine.',
  path: '/services',
})

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Three practices. One connected growth engine."
        lead="Acquisition, sales conversion, and on-site experience are the same funnel viewed from different points. We work them together, because optimising one while ignoring the next is how budget gets wasted efficiently."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ]}
      />

      {/* How the practices connect — the argument for buying them together. */}
      <Section tone="light" aria-labelledby="connected-heading">
        <SectionHeading
          id="connected-heading"
          eyebrow="How they connect"
          title="Most agencies sell channels. The constraint is rarely a channel."
          lead="A company with weak follow-up does not have a lead-generation problem, even though more leads is what it will ask for. A store with a leaking checkout does not have a traffic problem."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-soft-gray bg-soft-gray md:grid-cols-3">
          {[
            {
              step: 'Demand',
              practice: 'Performance Marketing',
              detail:
                'Creates qualified demand at a cost you can defend, with measurement that reconciles against actual revenue.',
              handoff: 'Hands off to →',
            },
            {
              step: 'Conversion',
              practice: 'Revenue & Sales',
              detail:
                'Converts that demand into booked pipeline through routing, qualification, and follow-up that runs without depending on memory.',
              handoff: 'Feeds back to ←',
            },
            {
              step: 'Value',
              practice: 'E-commerce Growth',
              detail:
                'Raises what each session is worth, which improves the economics the acquisition side is working against.',
              handoff: 'Improves →',
            },
          ].map(stage => (
            <div key={stage.step} className="bg-white p-7">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                {stage.step}
              </p>
              <h3 className="mt-3 font-display text-heading text-navy">{stage.practice}</h3>
              <p className="mt-3 text-body-sm text-slate-strong">{stage.detail}</p>
              <p className="mt-5 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-violet-600">
                {stage.handoff}
              </p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-measure text-body text-slate-strong">
          Closing that loop is the whole point: closed revenue is attributed back to the
          source that produced it, so the acquisition side optimises toward deals rather
          than toward form fills.
        </p>
      </Section>

      {/* Full detail per practice */}
      <Section tone="off-white" aria-labelledby="practices-heading">
        <SectionHeading
          id="practices-heading"
          eyebrow="The practices"
          title="What each practice does, in detail."
        />

        <div className="mt-14 space-y-8">
          {services.map(service => {
            const related = getCaseStudy(service.relatedCaseStudy)
            const showRelated = related && canPublish(related)

            return (
              <Reveal
                key={service.slug}
                as="article"
                className="rounded-lg border border-soft-gray bg-white p-7 lg:p-10"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono text-label text-slate">{service.index}</span>
                  <service.icon aria-hidden="true" className="h-5 w-5 text-violet-600" />
                </div>

                <h3 className="mt-4 font-display text-display-md text-navy">{service.name}</h3>
                <p className="mt-4 max-w-measure text-body-lg text-slate-strong">
                  {service.summary}
                </p>

                <div className="mt-9 grid gap-x-10 gap-y-8 lg:grid-cols-2">
                  <Detail title="Ideal client" body={service.idealClient} />
                  <Detail title="Typical problem" body={service.problem} />
                  <Detail title="Our approach" body={service.approach} />
                  <Detail title="Commercial outcome" body={service.outcome} />
                </div>

                <div className="mt-9 grid gap-x-10 gap-y-8 border-t border-soft-gray pt-8 lg:grid-cols-3">
                  <div>
                    <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                      Deliverables
                    </h4>
                    <ul className="mt-3 space-y-1.5">
                      {service.deliverables.map(item => (
                        <li key={item} className="text-body-sm text-slate-strong">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                      KPIs we report on
                    </h4>
                    <ul className="mt-3 space-y-1.5">
                      {service.kpis.map(item => (
                        <li key={item} className="text-body-sm text-slate-strong">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                      Engagement process
                    </h4>
                    <ol className="mt-3 space-y-1.5">
                      {service.operating.map((stage, index) => (
                        <li key={stage.title} className="text-body-sm text-slate-strong">
                          <span className="font-mono text-slate">{index + 1}.</span>{' '}
                          {stage.title} — {stage.detail}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-soft-gray pt-7">
                  <Link
                    href={`/services/${service.slug}`}
                    className="group inline-flex min-h-[44px] items-center gap-2 text-body-sm font-medium text-violet-600 transition-colors duration-fast hover:text-violet-700"
                  >
                    Full {service.name} detail
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5"
                    />
                  </Link>

                  {showRelated ? (
                    <Link
                      href={`/work/${related.slug}`}
                      className="inline-flex min-h-[44px] items-center text-body-sm text-slate-strong underline decoration-soft-gray underline-offset-4 transition-colors duration-fast hover:text-navy hover:decoration-navy"
                    >
                      Related case study:{' '}
                      {needsLabel(related) ? related.anonymisedLabel : related.client}
                    </Link>
                  ) : null}
                </div>
              </Reveal>
            )
          })}
        </div>
      </Section>

      <ConversionCTA
        title="Not sure which practice you need?"
        lead="That is usually the right question. Book a call and we will tell you where the constraint actually is — including when it is not something we should be selling you."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
        ])}
      />
    </>
  )
}

function Detail({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h4 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">{title}</h4>
      <p className="mt-2 max-w-measure text-body text-slate-strong">{body}</p>
    </div>
  )
}
