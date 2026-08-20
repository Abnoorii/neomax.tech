'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/site/ui/Button'
import { PerformanceDashboard } from '@/components/site/data/PerformanceDashboard'
import { Container } from '@/components/site/layout/Container'
import { site } from '@/content/site'
import { needsLabel } from '@/content/verification'
import { transition } from '@/lib/site/motion'

/**
 * Headline broken by hand. The draft ran the two sentences together; splitting
 * them across lines preserves the meaning and lets the contrast between "market"
 * and "engineer" carry the idea visually.
 */
const HEADLINE_LINES = [
  { text: 'We don’t just market', accent: false },
  { text: 'your business.', accent: false },
  { text: 'We engineer its growth.', accent: true },
]

export function Hero() {
  const reduceMotion = useReducedMotion()

  // Entrance sequence: status label, headline by line, copy, CTAs, then the
  // dashboard settles. Runs once on mount and never repeats.
  const step = (index: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { ...transition.slow, delay: 0.05 + index * 0.09 },
        }

  return (
    <section className="relative overflow-hidden bg-ink text-white neomax-dark">
      {/* Structural grid rules, not decoration: they set the alignment lines the
          rest of the page inherits. Hidden below lg where they would crowd. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden justify-center lg:flex"
      >
        <div className="grid h-full w-full max-w-container grid-cols-12 px-edge">
          {Array.from({ length: 13 }).map((_, index) => (
            <div key={index} className="border-l border-white/[0.045] last:border-r" />
          ))}
        </div>
      </div>

      <Container className="relative pb-section pt-[calc(72px+clamp(3rem,2rem+4vw,6rem))]">
        <div className="grid items-center gap-x-12 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-6 xl:col-span-6">
            <motion.p
              {...step(0)}
              className="flex items-center gap-2.5 font-mono text-label uppercase text-muted-dark"
            >
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-lime" />
              Now accepting Q2 2026 partners
            </motion.p>

            <h1 className="mt-7 font-display text-display-xl text-balance">
              {HEADLINE_LINES.map((line, index) => (
                <motion.span key={line.text} {...step(index + 1)} className="block">
                  <span className={line.accent ? 'text-lime' : 'text-white'}>{line.text}</span>
                </motion.span>
              ))}
            </h1>

            <motion.p {...step(4)} className="mt-7 max-w-measure text-body-lg text-muted-dark">
              {site.description}
            </motion.p>

            <motion.div {...step(5)} className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/contact" size="lg" className="group">
                Start Growing
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5"
                />
              </ButtonLink>
              <ButtonLink href="/work" variant="outline-dark" size="lg">
                See Our Work
              </ButtonLink>
            </motion.div>

            {/* Country reach is unverified, so it is phrased without the count
                until NEOMAX confirms the figure. */}
            <motion.p {...step(6)} className="mt-7 text-body-sm text-muted-dark">
              {needsLabel(site.reach)
                ? 'Working with growing businesses across multiple international markets'
                : site.reach.label}
            </motion.p>
          </div>

          <motion.div
            {...(reduceMotion
              ? {}
              : {
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0 },
                  transition: { ...transition.slow, delay: 0.55 },
                })}
            className="lg:col-span-6 xl:col-span-6"
          >
            <PerformanceDashboard />
            <p className="mt-3 text-body-sm text-muted-dark">
              Illustrative interface. Figures are sample data, not a live client account.
            </p>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
