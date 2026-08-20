import type { Metadata } from 'next'
import {
  positioning,
  story,
  operatingPrinciples,
  philosophy,
  teamStructure,
  workingModel,
  globalExperience,
} from '@/content/about'
import { PageHero } from '@/components/site/marketing/PageHero'
import { ConversionCTA } from '@/components/site/marketing/ConversionCTA'
import { Section } from '@/components/site/layout/Section'
import { SectionHeading } from '@/components/site/ui/SectionHeading'
import { RevealGroup, RevealItem } from '@/components/site/ui/Reveal'
import { JsonLd } from '@/components/site/JsonLd'
import { buildMetadata, breadcrumbSchema } from '@/lib/site/seo'

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'How NEOMAX works: measurement before optimisation, KPIs agreed in advance, and written reviews that cover what did not work as well as what did.',
  path: '/about',
})

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={positioning.eyebrow}
        title={positioning.headline}
        lead={positioning.lead}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ]}
      />

      <Section tone="light" aria-labelledby="story-heading">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="story-heading" className="font-display text-display-md text-navy">
              {story.heading}
            </h2>
          </div>
          <div className="lg:col-span-8">
            <div className="max-w-measure space-y-5">
              {story.paragraphs.map(paragraph => (
                <p key={paragraph.slice(0, 40)} className="text-body-lg text-slate-strong">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section tone="off-white" aria-labelledby="principles-heading">
        <SectionHeading
          id="principles-heading"
          eyebrow="Operating principles"
          title="The rules we actually work by."
          lead="These are the commitments that shape day-to-day decisions — including the ones that occasionally cost us revenue."
        />
        <RevealGroup
          as="ul"
          className="mt-14 grid gap-px overflow-hidden rounded-lg border border-soft-gray bg-soft-gray sm:grid-cols-2 lg:grid-cols-3"
        >
          {operatingPrinciples.map((principle, index) => (
            <RevealItem key={principle.title} as="li" className="bg-white p-7">
              <span className="font-mono text-body-sm text-violet-600">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-4 font-display text-heading text-navy">{principle.title}</h3>
              <p className="mt-3 text-body-sm text-slate-strong">{principle.detail}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <Section tone="ink" aria-labelledby="philosophy-heading">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <h2 id="philosophy-heading" className="font-display text-display-md text-white">
              {philosophy.heading}
            </h2>
          </div>
          <div className="lg:col-span-8">
            <div className="max-w-measure space-y-5">
              {philosophy.paragraphs.map(paragraph => (
                <p key={paragraph.slice(0, 40)} className="text-body-lg text-muted-dark">
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-12 rounded-lg border border-white/12 bg-surface-dark p-7">
              <h3 className="font-display text-heading text-white">{globalExperience.heading}</h3>
              <p className="mt-3 max-w-measure text-body text-muted-dark">
                {globalExperience.body}
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="light" aria-labelledby="team-heading">
        <SectionHeading
          id="team-heading"
          eyebrow="Team structure"
          title="Who does the work."
          lead="We describe the team by discipline rather than by profile pages. What matters to a buyer is which specialists are on the engagement and what each of them owns."
        />

        <div className="mt-14 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">NEOMAX team disciplines and responsibilities</caption>
            <thead>
              <tr className="border-b border-navy">
                <th scope="col" className="py-3 pr-6 text-body-sm font-medium text-navy">
                  Discipline
                </th>
                <th scope="col" className="px-6 py-3 text-body-sm font-medium text-navy">
                  What they own
                </th>
                <th scope="col" className="py-3 pl-6 text-body-sm font-medium text-navy">
                  Works on
                </th>
              </tr>
            </thead>
            <tbody>
              {teamStructure.map(row => (
                <tr key={row.discipline} className="border-b border-soft-gray">
                  <th scope="row" className="py-4 pr-6 text-body-sm font-medium text-navy">
                    {row.discipline}
                  </th>
                  <td className="px-6 py-4 text-body-sm text-slate-strong">{row.responsibility}</td>
                  <td className="py-4 pl-6 text-body-sm text-slate">{row.worksOn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section tone="off-white" aria-labelledby="model-heading">
        <SectionHeading
          id="model-heading"
          eyebrow="Working model"
          title="How an engagement actually runs."
        />
        <RevealGroup as="ul" className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {workingModel.map(item => (
            <RevealItem key={item.title} as="li" className="border-t border-navy pt-6">
              <h3 className="font-display text-heading text-navy">{item.title}</h3>
              <p className="mt-3 text-body-sm text-slate-strong">{item.detail}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      </Section>

      <ConversionCTA
        title="Want to see how we would approach your business?"
        lead="Book a free 30-minute call. You will leave with a view of where your constraint actually sits, whether or not you work with us."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'About', path: '/about' },
        ])}
      />
    </>
  )
}
