import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowRight, Check } from 'lucide-react'
import { services, getService } from '@/content/services'
import { getCaseStudy } from '@/content/case-studies'
import { canPublish } from '@/content/verification'
import { PageHero } from '@/components/site/marketing/PageHero'
import { CaseStudyCard } from '@/components/site/marketing/CaseStudyCard'
import { ConversionCTA } from '@/components/site/marketing/ConversionCTA'
import { Section } from '@/components/site/layout/Section'
import { SectionHeading } from '@/components/site/ui/SectionHeading'
import { Accordion, AccordionItem } from '@/components/site/ui/Accordion'
import { RevealGroup, RevealItem } from '@/components/site/ui/Reveal'
import { JsonLd } from '@/components/site/JsonLd'
import { buildMetadata, serviceSchema, breadcrumbSchema, faqSchema } from '@/lib/site/seo'

/** Pre-renders every service in `content/services.ts`; new entries scale for free. */
export function generateStaticParams() {
  return services.map(service => ({ slug: service.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = getService(slug)
  if (!service) return buildMetadata({ title: 'Not found', description: '', path: '/services', noIndex: true })

  return buildMetadata({
    title: service.name,
    description: service.summary,
    path: `/services/${service.slug}`,
  })
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = getService(slug)
  if (!service) notFound()

  const related = getCaseStudy(service.relatedCaseStudy)
  const showRelated = related && canPublish(related)
  const path = `/services/${service.slug}`

  return (
    <>
      <PageHero
        eyebrow={service.name}
        title={service.heroStatement}
        lead={service.heroSupport}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.name, path },
        ]}
        aside={
          <div className="rounded-lg border border-white/12 bg-surface-dark p-6">
            <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
              Ideal client
            </p>
            <p className="mt-3 text-body text-white/85">{service.idealClient}</p>

            <p className="mt-7 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
              KPIs we report on
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {service.kpis.map(kpi => (
                <li
                  key={kpi}
                  className="rounded-sm border border-white/15 px-2.5 py-1 text-body-sm text-white/80"
                >
                  {kpi}
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {/* Pain points → outcomes, side by side so the trade is explicit. */}
      <Section tone="light" aria-labelledby="pain-heading">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
          <div>
            <h2 id="pain-heading" className="font-display text-display-md text-navy">
              What this usually looks like before we start
            </h2>
            <ul className="mt-8 space-y-4">
              {service.painPoints.map(point => (
                <li key={point} className="flex gap-3">
                  <AlertCircle aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-danger-strong" />
                  <span className="max-w-measure text-body text-slate-strong">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-display text-display-md text-navy">What changes</h2>
            <ul className="mt-8 space-y-6">
              {service.outcomes.map(outcome => (
                <li key={outcome.title}>
                  <div className="flex gap-3">
                    <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-violet-600" />
                    <div>
                      <p className="text-body font-medium text-navy">{outcome.title}</p>
                      <p className="mt-1 max-w-measure text-body-sm text-slate-strong">
                        {outcome.detail}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="off-white" aria-labelledby="capabilities-heading">
        <SectionHeading
          id="capabilities-heading"
          eyebrow="Capabilities"
          title="What the practice covers"
        />
        <RevealGroup
          as="ul"
          className="mt-12 grid gap-px overflow-hidden rounded-lg border border-soft-gray bg-soft-gray sm:grid-cols-2"
        >
          {service.capabilities.map(capability => (
            <RevealItem key={capability.name} as="li" className="bg-white p-6">
              <h3 className="text-subheading text-navy">{capability.name}</h3>
              <p className="mt-2 text-body-sm text-slate-strong">{capability.detail}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section tone="ink" aria-labelledby="operating-heading">
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="operating-heading" className="font-display text-display-md text-white">
              How we operate
            </h2>
            <ol className="mt-8 space-y-6">
              {service.operating.map((stage, index) => (
                <li key={stage.title} className="flex gap-5 border-t border-white/12 pt-6 first:border-t-0 first:pt-0">
                  <span className="font-mono text-body-sm text-lime">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="text-subheading text-white">{stage.title}</p>
                    <p className="mt-1.5 max-w-measure text-body-sm text-muted-dark">
                      {stage.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-lg border border-white/12 bg-surface-dark p-7">
              <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
                Platforms we work in
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {service.ecosystem.map(tool => (
                  <li
                    key={tool}
                    className="rounded-sm border border-white/15 px-3 py-1.5 text-body-sm text-white/85"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-body-sm text-muted-dark">
                Tooling we operate in, not commercial partnerships or certifications.
              </p>

              <h3 className="mt-9 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
                Reporting
              </h3>
              <p className="mt-3 max-w-measure text-body text-white/85">{service.reporting}</p>

              <h3 className="mt-9 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
                Deliverables
              </h3>
              <ul className="mt-3 space-y-2">
                {service.deliverables.map(item => (
                  <li key={item} className="flex gap-2.5 text-body-sm text-white/85">
                    <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-lime" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {showRelated ? (
        <Section tone="off-white" aria-labelledby="related-heading">
          <SectionHeading
            id="related-heading"
            eyebrow="Related work"
            title="This practice in a real engagement"
            action={
              <Link
                href="/work"
                className="group inline-flex min-h-[44px] items-center gap-2 text-body-sm font-medium text-violet-600 transition-colors duration-fast hover:text-violet-700"
              >
                All case studies
                <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5" />
              </Link>
            }
          />
          <div className="mt-12">
            <CaseStudyCard study={related} featured />
          </div>
        </Section>
      ) : null}

      <Section tone="light" aria-labelledby="faq-heading">
        <SectionHeading id="faq-heading" eyebrow="Questions" title="Common questions" />
        <div className="mt-12 max-w-3xl">
          <Accordion type="single" collapsible className="border-t border-soft-gray">
            {service.faqs.map((faq, index) => (
              <AccordionItem key={faq.question} value={`faq-${index}`} question={faq.question}>
                {faq.answer}
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Section>

      <ConversionCTA
        title={`Ready to fix ${service.name.toLowerCase()}?`}
        lead="Book a free 30-minute call. We will tell you what we would do first, and what we would leave alone."
      />

      <JsonLd
        data={[
          serviceSchema({ name: service.name, description: service.summary, path }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Services', path: '/services' },
            { name: service.name, path },
          ]),
          // FAQ schema describes only the FAQs visibly rendered above.
          faqSchema(service.faqs),
        ]}
      />
    </>
  )
}
