import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { articles, articleCategories, formatArticleDate } from '@/content/articles'
import { PageHero } from '@/components/site/marketing/PageHero'
import { InsightsBrowser } from '@/components/site/marketing/InsightsBrowser'
import { ConversionCTA } from '@/components/site/marketing/ConversionCTA'
import { Section } from '@/components/site/layout/Section'
import { UnverifiedNotice } from '@/components/site/ui/UnverifiedNotice'
import { JsonLd } from '@/components/site/JsonLd'
import { buildMetadata, breadcrumbSchema } from '@/lib/site/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Insights',
  description:
    'Working notes from the NEOMAX practice on search, paid media, attribution, and e-commerce conversion.',
  path: '/insights',
})

export default function InsightsPage() {
  const [featured] = articles
  const hasDrafts = articles.some(article => article.status === 'draft')

  return (
    <>
      <PageHero
        eyebrow="Insights"
        title="Growth intelligence."
        lead="What we are seeing in the accounts we run, what changed, and what we would do about it."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
        ]}
      />

      {featured ? (
        <Section tone="light" size="compact" aria-labelledby="featured-heading">
          <h2 id="featured-heading" className="sr-only">
            Featured article
          </h2>
          <article className="group relative grid gap-x-12 gap-y-6 border-b border-soft-gray pb-12 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-violet-600">
                Featured · {featured.category}
              </p>
              <p className="mt-3 font-mono text-[0.75rem] text-slate">
                <time dateTime={featured.publishedAt}>
                  {formatArticleDate(featured.publishedAt)}
                </time>
                <span aria-hidden="true"> · </span>
                {featured.readingMinutes} min read
              </p>
            </div>
            <div className="lg:col-span-9">
              <h3 className="font-display text-display-md text-balance text-navy">
                <Link href={`/insights/${featured.slug}`} className="after:absolute after:inset-0">
                  {featured.title}
                </Link>
              </h3>
              <p className="mt-4 max-w-measure text-body-lg text-slate-strong">
                {featured.summary}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-body-sm font-medium text-violet-600">
                Read article
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </article>
        </Section>
      ) : null}

      <Section tone="light" size="compact" aria-labelledby="all-insights-heading">
        <h2 id="all-insights-heading" className="sr-only">
          All insights
        </h2>

        {hasDrafts ? (
          <UnverifiedNotice className="mb-10">
            Articles marked <strong className="font-medium text-navy">Draft</strong> are
            pending editorial review. They are excluded from the sitemap and are not
            indexed until published.
          </UnverifiedNotice>
        ) : null}

        <InsightsBrowser articles={articles} categories={articleCategories} />
      </Section>

      <ConversionCTA
        title="Want this applied to your accounts?"
        lead="Book a free 30-minute strategy call and we will look at your numbers instead of generic ones."
      />

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
        ])}
      />
    </>
  )
}
