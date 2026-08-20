import Link from 'next/link'
import type { Article } from '@/content/articles'
import { formatArticleDate } from '@/content/articles'
import { cn } from '@/lib/utils'

export function InsightCard({
  article,
  tone = 'light',
  className,
}: {
  article: Article
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <article
      className={cn(
        'group relative flex flex-col border-t pt-6 transition-colors duration-base',
        tone === 'light' ? 'border-soft-gray hover:border-navy' : 'border-white/15 hover:border-white/40',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'font-mono text-[0.6875rem] uppercase tracking-[0.12em]',
            tone === 'light' ? 'text-violet-600' : 'text-lime',
          )}
        >
          {article.category}
        </span>
        {article.status === 'draft' ? (
          <span
            className={cn(
              'rounded-sm px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.12em]',
              tone === 'light'
                ? 'border border-soft-gray text-slate'
                : 'border border-white/20 text-muted-dark',
            )}
          >
            Draft
          </span>
        ) : null}
      </div>

      <h3
        className={cn(
          'mt-4 font-display text-heading text-balance',
          tone === 'light' ? 'text-navy' : 'text-white',
        )}
      >
        <Link href={`/insights/${article.slug}`} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </h3>

      <p
        className={cn(
          'mt-3 flex-1 text-body-sm',
          tone === 'light' ? 'text-slate-strong' : 'text-muted-dark',
        )}
      >
        {article.summary}
      </p>

      <p
        className={cn(
          'mt-5 font-mono text-[0.75rem]',
          tone === 'light' ? 'text-slate' : 'text-muted-dark',
        )}
      >
        <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
        <span aria-hidden="true"> · </span>
        {article.readingMinutes} min read
      </p>
    </article>
  )
}
