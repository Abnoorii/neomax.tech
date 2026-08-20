'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import type { Article } from '@/content/articles'
import { InsightCard } from '@/components/site/marketing/InsightCard'
import { cn } from '@/lib/utils'

/**
 * Search + category filtering for the insights index. Filtering happens on the
 * client over a small, statically-known set, so there is no request per keystroke.
 */
export function InsightsBrowser({
  articles,
  categories,
}: {
  articles: Article[]
  categories: string[]
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return articles.filter(article => {
      if (category && article.category !== category) return false
      if (!needle) return true
      return (
        article.title.toLowerCase().includes(needle) ||
        article.summary.toLowerCase().includes(needle) ||
        article.category.toLowerCase().includes(needle)
      )
    })
  }, [articles, query, category])

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-soft-gray pb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
          />
          <label htmlFor="insights-search" className="sr-only">
            Search insights
          </label>
          <input
            id="insights-search"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search insights"
            className="h-12 w-full rounded-md border border-soft-gray bg-white pl-10 pr-4 text-body-sm text-navy placeholder:text-slate"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={category === null}
            onClick={() => setCategory(null)}
            className={cn(
              'inline-flex min-h-[44px] items-center rounded-sm border px-3.5 text-body-sm transition-colors duration-fast',
              category === null
                ? 'border-navy bg-navy text-white'
                : 'border-soft-gray bg-white text-slate-strong hover:border-navy hover:text-navy',
            )}
          >
            All
          </button>
          {categories.map(item => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              onClick={() => setCategory(category === item ? null : item)}
              className={cn(
                'inline-flex min-h-[44px] items-center rounded-sm border px-3.5 text-body-sm transition-colors duration-fast',
                category === item
                  ? 'border-navy bg-navy text-white'
                  : 'border-soft-gray bg-white text-slate-strong hover:border-navy hover:text-navy',
              )}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="mt-6 text-body-sm text-slate-strong">
        {filtered.length} {filtered.length === 1 ? 'article' : 'articles'}
      </p>

      {filtered.length > 0 ? (
        <div className="mt-8 grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(article => (
            <InsightCard key={article.slug} article={article} className="h-full" />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-soft-gray bg-off-white p-12 text-center">
          <p className="text-body font-medium text-navy">Nothing matches that search.</p>
          <p className="mx-auto mt-2 max-w-measure-sm text-body-sm text-slate-strong">
            Try a broader term, or clear the filters to see everything published.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setCategory(null)
            }}
            className="mt-6 inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-soft-gray bg-white px-5 text-body-sm font-medium text-navy transition-colors duration-fast hover:border-navy"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Clear search and filters
          </button>
        </div>
      )}
    </div>
  )
}
