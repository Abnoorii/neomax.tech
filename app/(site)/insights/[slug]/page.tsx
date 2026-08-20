import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import {
  articles,
  getArticle,
  relatedArticles,
  articleHeadings,
  formatArticleDate,
} from '@/content/articles'
import { getService } from '@/content/services'
import { PageHero } from '@/components/site/marketing/PageHero'
import { ArticleBody } from '@/components/site/marketing/ArticleBody'
import { ShareLinks } from '@/components/site/marketing/ShareLinks'
import { InsightCard } from '@/components/site/marketing/InsightCard'
import { ConversionCTA } from '@/components/site/marketing/ConversionCTA'
import { Section } from '@/components/site/layout/Section'
import { SectionHeading } from '@/components/site/ui/SectionHeading'
import { JsonLd } from '@/components/site/JsonLd'
import { buildMetadata, articleSchema, breadcrumbSchema } from '@/lib/site/seo'

export function generateStaticParams() {
  return articles.map(article => ({ slug: article.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article)
    return buildMetadata({ title: 'Not found', description: '', path: '/insights', noIndex: true })

  return buildMetadata({
    title: article.title,
    description: article.summary,
    path: `/insights/${article.slug}`,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    // Drafts are reachable by link but never indexed.
    noIndex: article.status === 'draft',
  })
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const path = `/insights/${article.slug}`
  const headings = articleHeadings(article)
  const related = relatedArticles(article.slug)

  return (
    <>
      <PageHero
        eyebrow={article.category}
        title={article.title}
        lead={article.summary}
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Insights', path: '/insights' },
          { name: article.title, path },
        ]}
        meta={
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-body-sm text-muted-dark">
            <span>
              {article.author.name} · {article.author.role}
            </span>
            <span>
              Published{' '}
              <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
            </span>
            {article.updatedAt ? (
              <span>
                Updated{' '}
                <time dateTime={article.updatedAt}>{formatArticleDate(article.updatedAt)}</time>
              </span>
            ) : null}
            <span>{article.readingMinutes} min read</span>
          </div>
        }
      />

      <Section tone="light" aria-labelledby="article-heading">
        <h2 id="article-heading" className="sr-only">
          Article
        </h2>

        {article.status === 'draft' ? (
          <div className="mb-12 flex items-start gap-3 rounded-lg border border-soft-gray bg-off-white p-6">
            <FileText aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-slate" />
            <div>
              <p className="text-subheading text-navy">Draft — pending editorial review</p>
              <p className="mt-1.5 max-w-measure text-body-sm text-slate-strong">
                This article has not been through editorial review and is not indexed.
                It is published here so the insights system can be reviewed end to end.
              </p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <aside className="min-w-0 lg:col-span-3 lg:order-2">
            <div className="lg:sticky lg:top-28">
              {headings.length > 0 ? (
                <nav aria-labelledby="toc-heading">
                  <h3
                    id="toc-heading"
                    className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate"
                  >
                    On this page
                  </h3>
                  <ol className="mt-3 space-y-1 border-l border-soft-gray">
                    {headings.map(heading => (
                      <li key={heading.id}>
                        <a
                          href={`#${heading.id}`}
                          className="-ml-px flex border-l border-transparent py-1.5 pl-4 text-body-sm text-slate-strong transition-colors duration-fast hover:border-violet-500 hover:text-navy"
                        >
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              ) : null}

              <div className="mt-10">
                <ShareLinks title={article.title} path={path} />
              </div>

              {article.relatedServices.length > 0 ? (
                <div className="mt-10">
                  <p className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                    Related services
                  </p>
                  <ul className="mt-3 space-y-1">
                    {article.relatedServices.map(serviceSlug => {
                      const service = getService(serviceSlug)
                      if (!service) return null
                      return (
                        <li key={serviceSlug}>
                          <Link
                            href={`/services/${service.slug}`}
                            className="flex min-h-[36px] items-center text-body-sm text-violet-600 transition-colors duration-fast hover:text-violet-700"
                          >
                            {service.name}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </div>
          </aside>

          <div className="min-w-0 lg:col-span-9 lg:order-1">
            <ArticleBody body={article.body} />
          </div>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section tone="off-white" aria-labelledby="related-articles-heading">
          <SectionHeading
            id="related-articles-heading"
            eyebrow="Keep reading"
            title="Related insights"
          />
          <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-2">
            {related.map(item => (
              <InsightCard key={item.slug} article={item} className="h-full" />
            ))}
          </div>
        </Section>
      ) : null}

      <ConversionCTA
        title="Want this applied to your accounts?"
        lead="Book a free 30-minute strategy call and we will work through your numbers rather than generic ones."
      />

      <JsonLd
        data={[
          articleSchema({
            title: article.title,
            description: article.summary,
            path,
            publishedAt: article.publishedAt,
            updatedAt: article.updatedAt,
            authorName: article.author.name,
          }),
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Insights', path: '/insights' },
            { name: article.title, path },
          ]),
        ]}
      />
    </>
  )
}
