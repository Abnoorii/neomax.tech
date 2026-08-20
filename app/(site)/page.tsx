import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Hero } from '@/components/site/marketing/Hero'
import { MetricStrip } from '@/components/site/marketing/MetricStrip'
import { ServicePractices } from '@/components/site/marketing/ServicePractices'
import { GrowthProcess } from '@/components/site/marketing/GrowthProcess'
import { CaseStudyCard } from '@/components/site/marketing/CaseStudyCard'
import { ROICalculator } from '@/components/site/data/ROICalculator'
import { Pricing } from '@/components/site/marketing/Pricing'
import { ProofPillars } from '@/components/site/marketing/ProofPillars'
import { Testimonials } from '@/components/site/marketing/Testimonials'
import { InsightCard } from '@/components/site/marketing/InsightCard'
import { ConversionCTA } from '@/components/site/marketing/ConversionCTA'
import { Section } from '@/components/site/layout/Section'
import { SectionHeading } from '@/components/site/ui/SectionHeading'
import { Reveal, RevealGroup, RevealItem } from '@/components/site/ui/Reveal'
import { ButtonLink } from '@/components/site/ui/Button'
import { UnverifiedNotice } from '@/components/site/ui/UnverifiedNotice'
import { caseStudies } from '@/content/case-studies'
import { articles } from '@/content/articles'
import { publishable, showsUnverified } from '@/content/verification'
import { site } from '@/content/site'
import { buildMetadata } from '@/lib/site/seo'

export const metadata: Metadata = buildMetadata({
  title: `${site.name} — We engineer growth, not just marketing`,
  description: site.description,
  path: '/',
})

export default function HomePage() {
  const featuredWork = publishable(caseStudies).slice(0, 4)

  return (
    <>
      <Hero />
      <MetricStrip />
      <ServicePractices />
      <GrowthProcess />

      {featuredWork.length > 0 ? (
        <Section id="work" tone="off-white" aria-labelledby="work-heading">
          <SectionHeading
            id="work-heading"
            eyebrow="Case studies"
            title="Results that hold up to scrutiny."
            lead="Each engagement below states the challenge, what we changed, and what moved — including the constraints we were working inside."
            action={
              <ButtonLink href="/work" variant="outline">
                View all case studies
              </ButtonLink>
            }
          />

          {/* Two sizes rather than four identical tiles: the lead study gets the
              wider composition, which keeps the grid from reading as a wall. */}
          <RevealGroup className="mt-14 grid gap-6 lg:grid-cols-2">
            {featuredWork.map((study, index) => (
              <RevealItem
                key={study.slug}
                className={index === 0 ? 'lg:col-span-2' : undefined}
              >
                <CaseStudyCard study={study} featured={index === 0} className="h-full" />
              </RevealItem>
            ))}
          </RevealGroup>

          {showsUnverified ? (
            <UnverifiedNotice className="mt-10">
              These case studies come from the supplied draft and have not been verified.
              Client names are withheld and shown as industry descriptors until each
              engagement is confirmed for publication.
            </UnverifiedNotice>
          ) : null}
        </Section>
      ) : null}

      <Section id="roi-calculator" tone="ink" aria-labelledby="roi-heading">
        <SectionHeading
          id="roi-heading"
          eyebrow="ROI calculator"
          tone="dark"
          title="Model what a change in return would be worth."
          lead="Enter your own figures. The numbers update as you type, and the link updates with them so you can share the scenario."
        />
        <div className="mt-14">
          <ROICalculator />
        </div>
      </Section>

      <Section id="pricing" tone="light" aria-labelledby="pricing-heading">
        <SectionHeading
          id="pricing-heading"
          eyebrow="Pricing"
          align="center"
          title="Transparent pricing. No surprises."
          lead="Choose the plan that matches your stage. Every plan is month-to-month with a defined notice period."
        />
        <div className="mt-12">
          <Pricing />
        </div>
      </Section>

      <Section tone="ink" aria-labelledby="why-heading">
        <SectionHeading
          id="why-heading"
          eyebrow="Why NEOMAX"
          tone="dark"
          title="Built for outcomes you can audit."
          lead="Six reasons companies choose NEOMAX — each stated as something you can check rather than something you have to take on trust."
        />
        <ProofPillars />
      </Section>

      <Section tone="light" aria-labelledby="testimonials-heading">
        <SectionHeading
          id="testimonials-heading"
          eyebrow="Testimonials"
          title="What our clients say."
        />
        <div className="mt-14">
          <Testimonials />
        </div>
      </Section>

      <Section tone="off-white" aria-labelledby="insights-heading">
        <SectionHeading
          id="insights-heading"
          eyebrow="Insights"
          title="Growth intelligence."
          lead="Working notes from the practice — what we are seeing, what changed, and what we would do about it."
          action={
            <Link
              href="/insights"
              className="group inline-flex min-h-[44px] items-center gap-2 text-body-sm font-medium text-violet-600 transition-colors duration-fast hover:text-violet-700"
            >
              View all insights
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5"
              />
            </Link>
          }
        />

        <RevealGroup className="mt-14 grid gap-8 md:grid-cols-3">
          {articles.map(article => (
            <RevealItem key={article.slug}>
              <InsightCard article={article} className="h-full" />
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal>
          <UnverifiedNotice className="mt-10">
            These articles are drafts pending editorial review. They are excluded from
            the sitemap and marked as drafts until published.
          </UnverifiedNotice>
        </Reveal>
      </Section>

      <ConversionCTA />
    </>
  )
}
