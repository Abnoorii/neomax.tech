import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { services, supportingCapabilities } from '@/content/services'
import { Section } from '@/components/site/layout/Section'
import { SectionHeading } from '@/components/site/ui/SectionHeading'
import { Reveal } from '@/components/site/ui/Reveal'

/**
 * The three practices.
 *
 * Deliberately not three identical icon cards: each practice is a full-width
 * editorial row that alternates which side the capability list sits on, so the
 * three read as a sequence rather than a grid of interchangeable tiles. One
 * visual system, three compositions.
 */
export function ServicePractices() {
  return (
    <Section id="services" tone="light" aria-labelledby="services-heading">
      <SectionHeading
        id="services-heading"
        eyebrow="What we do"
        title="Everything you need to compete in your market."
        lead="Three integrated practices operating as one growth engine — because acquisition, sales conversion, and on-site experience are the same funnel seen from different points."
      />

      <div className="mt-16 divide-y divide-soft-gray border-y border-soft-gray">
        {services.map((service, index) => (
          <Reveal key={service.slug} as="article" className="py-12 first:pt-0 lg:py-16">
            <div
              className={`grid gap-x-12 gap-y-8 lg:grid-cols-12 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              <div className="lg:col-span-7">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-label text-slate">{service.index}</span>
                  <service.icon aria-hidden="true" className="h-5 w-5 text-violet-600" />
                </div>

                <h3 className="mt-4 font-display text-display-md text-navy">{service.name}</h3>

                <div className="mt-6 max-w-measure space-y-5">
                  <div>
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                      The problem
                    </p>
                    <p className="mt-1.5 text-body text-slate-strong">{service.problem}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                      Our approach
                    </p>
                    <p className="mt-1.5 text-body text-slate-strong">{service.approach}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                      What you get
                    </p>
                    <p className="mt-1.5 text-body font-medium text-navy">{service.outcome}</p>
                  </div>
                </div>

                <Link
                  href={`/services/${service.slug}`}
                  className="group mt-7 inline-flex min-h-[44px] items-center gap-2 text-body-sm font-medium text-violet-600 transition-colors duration-fast hover:text-violet-700"
                >
                  Explore {service.name}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              <div className="lg:col-span-5">
                <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                  Capabilities
                </p>
                <ul className="mt-4 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-soft-gray bg-soft-gray sm:grid-cols-2 lg:grid-cols-1">
                  {service.capabilities.slice(0, 6).map(capability => (
                    <li key={capability.name} className="bg-white px-4 py-3">
                      <p className="text-body-sm font-medium text-navy">{capability.name}</p>
                      <p className="mt-0.5 text-body-sm leading-snug text-slate-strong">
                        {capability.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-14">
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
          Supporting capabilities
        </p>
        <ul className="mt-5 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {supportingCapabilities.map(capability => (
            <li key={capability.name} className="flex gap-3">
              <capability.icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
              <div>
                <p className="text-body-sm font-medium text-navy">{capability.name}</p>
                <p className="mt-1 text-body-sm leading-snug text-slate-strong">
                  {capability.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
