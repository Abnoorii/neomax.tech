import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { CaseStudy } from '@/content/case-studies'
import { needsLabel } from '@/content/verification'
import { UnverifiedTag } from '@/components/site/ui/UnverifiedTag'
import { cn } from '@/lib/utils'

/**
 * Case-study card. The client name is only printed once verified — until then
 * the card leads with an anonymised industry descriptor, so a reader never
 * takes an unconfirmed brand as an existing NEOMAX client.
 */
export function CaseStudyCard({
  study,
  tone = 'light',
  featured = false,
  className,
}: {
  study: CaseStudy
  tone?: 'light' | 'dark'
  featured?: boolean
  className?: string
}) {
  const unverified = needsLabel(study)
  const title = unverified ? study.anonymisedLabel : study.client

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-lg border transition-colors duration-base',
        tone === 'light'
          ? 'border-soft-gray bg-white hover:border-navy/25'
          : 'border-white/12 bg-surface-dark hover:border-white/30',
        featured ? 'p-7 lg:p-9' : 'p-6',
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'font-mono text-[0.6875rem] uppercase tracking-[0.12em]',
            tone === 'light' ? 'text-violet-600' : 'text-lime',
          )}
        >
          {study.industry}
        </span>
        <span aria-hidden="true" className={tone === 'light' ? 'text-soft-gray' : 'text-white/25'}>
          /
        </span>
        <span
          className={cn(
            'font-mono text-[0.6875rem] uppercase tracking-[0.12em]',
            tone === 'light' ? 'text-slate' : 'text-muted-dark',
          )}
        >
          {study.market}
        </span>
        {unverified ? <UnverifiedTag tone={tone} className="ml-auto" /> : null}
      </div>

      <h3
        className={cn(
          'mt-4 font-display',
          featured ? 'text-display-md' : 'text-heading',
          tone === 'light' ? 'text-navy' : 'text-white',
        )}
      >
        <Link href={`/work/${study.slug}`} className="after:absolute after:inset-0">
          {title}
        </Link>
      </h3>

      <p
        className={cn(
          'mt-3 max-w-measure text-body-sm',
          tone === 'light' ? 'text-slate-strong' : 'text-muted-dark',
        )}
      >
        {study.summary}
      </p>

      <dl
        className={cn(
          'mt-6 grid grid-cols-3 gap-4 border-t pt-6',
          tone === 'light' ? 'border-soft-gray' : 'border-white/12',
        )}
      >
        {study.results.map(result => (
          <div key={result.label}>
            <dd
              className={cn(
                'tabular font-display text-metric-sm',
                tone === 'light' ? 'text-navy' : 'text-white',
              )}
            >
              {result.value}
            </dd>
            <dt
              className={cn(
                'mt-1.5 text-[0.75rem] leading-snug',
                tone === 'light' ? 'text-slate' : 'text-muted-dark',
              )}
            >
              {result.label}
            </dt>
          </div>
        ))}
      </dl>

      <span
        className={cn(
          'mt-6 inline-flex items-center gap-1.5 text-body-sm font-medium',
          tone === 'light' ? 'text-violet-600' : 'text-lime',
        )}
      >
        Read case study
        <ArrowUpRight
          aria-hidden="true"
          className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </span>
    </article>
  )
}
