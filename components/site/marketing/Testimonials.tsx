'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { homepageTestimonials } from '@/content/testimonials'
import { publishable, needsLabel, showsUnverified } from '@/content/verification'
import { UnverifiedNotice } from '@/components/site/ui/UnverifiedNotice'
import { cn } from '@/lib/utils'

/**
 * Testimonials.
 *
 * A manual carousel, not a marquee: nothing moves unless the reader moves it,
 * which removes the pause-on-hover and reduced-motion problems entirely rather
 * than patching around them.
 *
 * Attribution is withheld while a quote is unverified — showing a real person's
 * name and employer against an unconfirmed quote would be the actual harm here.
 */
export function Testimonials() {
  const items = publishable(homepageTestimonials)
  const [index, setIndex] = useState(0)

  if (items.length === 0) return null

  const active = items[index]
  const go = (next: number) => setIndex((next + items.length) % items.length)

  return (
    <div>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-8">
          <figure className="flex h-full flex-col">
            <Quote aria-hidden="true" className="h-8 w-8 text-violet-600" />
            <blockquote className="mt-6 flex-1">
              <p className="max-w-measure font-display text-display-md text-balance text-navy">
                “{active.quote}”
              </p>
            </blockquote>
            <figcaption className="mt-8 border-t border-soft-gray pt-6">
              {needsLabel(active) ? (
                <>
                  <p className="text-body font-medium text-navy">
                    {active.role} · {active.country}
                  </p>
                  <p className="mt-1 text-body-sm text-slate">
                    Name and company withheld pending verification
                  </p>
                </>
              ) : (
                <>
                  <p className="text-body font-medium text-navy">{active.name}</p>
                  <p className="mt-1 text-body-sm text-slate-strong">
                    {active.role}, {active.company} · {active.country}
                  </p>
                </>
              )}
            </figcaption>
          </figure>
        </div>

        <div className="lg:col-span-4">
          <div className="flex items-center justify-between gap-4 lg:justify-start">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(index - 1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-soft-gray text-navy transition-colors duration-fast hover:border-navy"
              >
                <ChevronLeft aria-hidden="true" className="h-5 w-5" />
                <span className="sr-only">Previous testimonial</span>
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-soft-gray text-navy transition-colors duration-fast hover:border-navy"
              >
                <ChevronRight aria-hidden="true" className="h-5 w-5" />
                <span className="sr-only">Next testimonial</span>
              </button>
            </div>
            <p className="tabular font-mono text-body-sm text-slate">
              {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </p>
          </div>

          <ul className="mt-8 space-y-1">
            {items.map((item, itemIndex) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setIndex(itemIndex)}
                  aria-current={itemIndex === index ? 'true' : undefined}
                  className={cn(
                    'flex min-h-[44px] w-full items-center gap-3 border-l-2 pl-4 text-left text-body-sm transition-colors duration-fast',
                    itemIndex === index
                      ? 'border-violet-500 text-navy'
                      : 'border-soft-gray text-slate hover:border-slate hover:text-navy',
                  )}
                >
                  <span className="line-clamp-1">
                    {needsLabel(item)
                      ? `${item.role} · ${item.country}`
                      : `${item.name}, ${item.company}`}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showsUnverified ? (
        <UnverifiedNotice className="mt-12">
          These testimonials come from the supplied draft and have not been confirmed
          with the individuals quoted. Names and companies are withheld until each is
          verified. Duplicated entries in the source have been removed.
        </UnverifiedNotice>
      ) : null}
    </div>
  )
}
