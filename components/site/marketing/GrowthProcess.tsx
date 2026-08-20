'use client'

import { useEffect, useRef, useState } from 'react'
import { growthSystem } from '@/content/process'
import { Section } from '@/components/site/layout/Section'
import { SectionHeading } from '@/components/site/ui/SectionHeading'
import { cn } from '@/lib/utils'

/**
 * The NEOMAX Growth System.
 *
 * Desktop: a sticky stage index tracks which stage is in view while the detail
 * scrolls normally. Nothing is pinned or scroll-hijacked — the page scrolls at
 * its natural rate and the index is a passive read-out.
 * Mobile: a plain vertical sequence, which is what actually works on a phone.
 */
export function GrowthProcess() {
  const [activeIndex, setActiveIndex] = useState(0)
  const stageRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        // The stage nearest the middle of the viewport wins.
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) {
          const index = stageRefs.current.indexOf(visible.target as HTMLDivElement)
          if (index >= 0) setActiveIndex(index)
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    stageRefs.current.forEach(node => node && observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return (
    <Section id="process" tone="ink" aria-labelledby="process-heading">
      <SectionHeading
        id="process-heading"
        eyebrow="The system"
        tone="dark"
        title="How we work — the NEOMAX Growth System"
        lead="Five stages, each with a defined deliverable and a decision point. You always know what is happening, what you will receive, and what it unlocks."
      />

      <div className="mt-16 grid gap-x-12 lg:grid-cols-12">
        {/* Stage index — desktop only, and purely a read-out of scroll position */}
        <div className="hidden lg:col-span-4 lg:block">
          <ol className="sticky top-28 space-y-1" aria-hidden="true">
            {growthSystem.map((stage, index) => (
              <li key={stage.step}>
                <div
                  className={cn(
                    'flex items-center gap-4 border-l-2 py-3 pl-5 transition-colors duration-base',
                    index === activeIndex
                      ? 'border-lime text-white'
                      : 'border-white/12 text-muted-dark',
                  )}
                >
                  <span className="font-mono text-body-sm">{stage.step}</span>
                  <span className="text-subheading">{stage.title}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <ol className="lg:col-span-8">
          {growthSystem.map((stage, index) => (
            <li key={stage.step}>
              <div
                ref={node => {
                  stageRefs.current[index] = node
                }}
                className="border-t border-white/12 py-10 first:border-t-0 first:pt-0 lg:py-14"
              >
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                  <span className="font-mono text-label text-lime">{stage.step}</span>
                  <h3 className="font-display text-display-md text-white">{stage.title}</h3>
                  <span className="ml-auto font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
                    {stage.duration}
                  </span>
                </div>

                <p className="mt-4 max-w-measure text-body-lg text-white/85">{stage.summary}</p>

                <dl className="mt-8 grid gap-6 sm:grid-cols-3">
                  <div>
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
                      What happens
                    </dt>
                    <dd className="mt-2 text-body-sm text-white/75">{stage.activity}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
                      What you receive
                    </dt>
                    <dd className="mt-2 text-body-sm text-white/75">{stage.deliverable}</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
                      What it unlocks
                    </dt>
                    <dd className="mt-2 text-body-sm text-white/75">{stage.outcome}</dd>
                  </div>
                </dl>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
