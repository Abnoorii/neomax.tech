'use client'

import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import type { CaseStudy } from '@/content/case-studies'
import { caseStudyFacets } from '@/content/case-studies'
import { services } from '@/content/services'
import { CaseStudyCard } from '@/components/site/marketing/CaseStudyCard'
import { cn } from '@/lib/utils'

type FacetKey = 'industry' | 'service' | 'market' | 'businessModel'

const FACET_LABELS: Record<FacetKey, string> = {
  industry: 'Industry',
  service: 'Service',
  market: 'Market',
  businessModel: 'Business model',
}

/** Service slugs render as their display names, not as URL slugs. */
const serviceName = (slug: string) => services.find(s => s.slug === slug)?.name ?? slug

export function WorkFilters({ studies }: { studies: CaseStudy[] }) {
  const facets = useMemo(() => caseStudyFacets(studies), [studies])
  const [active, setActive] = useState<Partial<Record<FacetKey, string>>>({})

  const filtered = useMemo(
    () =>
      studies.filter(study => {
        if (active.industry && study.industry !== active.industry) return false
        if (active.market && study.market !== active.market) return false
        if (active.businessModel && study.businessModel !== active.businessModel) return false
        if (active.service && !study.services.includes(active.service as CaseStudy['services'][number]))
          return false
        return true
      }),
    [studies, active],
  )

  const activeCount = Object.values(active).filter(Boolean).length

  const toggle = (key: FacetKey, value: string) =>
    setActive(previous => ({ ...previous, [key]: previous[key] === value ? undefined : value }))

  return (
    <div>
      <div className="space-y-5">
        {(Object.keys(FACET_LABELS) as FacetKey[]).map(key => (
          <fieldset key={key} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <legend className="sr-only">Filter by {FACET_LABELS[key].toLowerCase()}</legend>
            <span
              aria-hidden="true"
              className="w-28 shrink-0 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate"
            >
              {FACET_LABELS[key]}
            </span>
            <div className="flex flex-wrap gap-2">
              {facets[key].map(value => {
                const isActive = active[key] === value
                const label = key === 'service' ? serviceName(value) : value
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => toggle(key, value)}
                    className={cn(
                      'inline-flex min-h-[44px] items-center rounded-sm border px-3.5 text-body-sm transition-colors duration-fast',
                      isActive
                        ? 'border-navy bg-navy text-white'
                        : 'border-soft-gray bg-white text-slate-strong hover:border-navy hover:text-navy',
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-soft-gray pt-6">
        <p aria-live="polite" className="text-body-sm text-slate-strong">
          Showing {filtered.length} of {studies.length} case{' '}
          {studies.length === 1 ? 'study' : 'studies'}
        </p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => setActive({})}
            className="inline-flex min-h-[36px] items-center gap-1.5 text-body-sm font-medium text-violet-600 transition-colors duration-fast hover:text-violet-700"
          >
            <X aria-hidden="true" className="h-4 w-4" />
            Clear {activeCount === 1 ? 'filter' : 'filters'}
          </button>
        ) : null}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {filtered.map(study => (
            <CaseStudyCard key={study.slug} study={study} className="h-full" />
          ))}
        </div>
      ) : (
        // Empty state: an explicit way back rather than a blank region.
        <div className="mt-10 rounded-lg border border-dashed border-soft-gray bg-off-white p-12 text-center">
          <p className="text-body font-medium text-navy">No case studies match those filters.</p>
          <p className="mx-auto mt-2 max-w-measure-sm text-body-sm text-slate-strong">
            Try removing a filter, or get in touch — we have worked in more markets than
            we have published.
          </p>
          <button
            type="button"
            onClick={() => setActive({})}
            className="mt-6 inline-flex min-h-[44px] items-center rounded-md border border-soft-gray bg-white px-5 text-body-sm font-medium text-navy transition-colors duration-fast hover:border-navy"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
