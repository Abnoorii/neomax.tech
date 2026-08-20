'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { heroDashboard } from '@/content/metrics'
import { transition } from '@/lib/site/motion'
import { cn } from '@/lib/utils'

/**
 * The NEOMAX growth-intelligence panel.
 *
 * Chart decisions follow the data's job rather than decoration:
 *  - ROAS is a single headline number, so it is a hero figure, not a one-bar chart.
 *  - Funnel stages are ORDINAL (reordering them would change the meaning), so
 *    they take a one-hue ramp with monotone lightness — validated for monotonic
 *    L, adjacent ΔL, and light-end contrast against this surface.
 *  - Channels are NOMINAL, so every bar takes the same slot-1 hue. Colouring
 *    them individually would spend the identity channel re-encoding bar length.
 *  - The revenue series is one series, so it carries no legend; the label names it.
 *
 * Charts are hand-drawn SVG rather than a charting library: this panel is the
 * LCP element, and it does not need a runtime chart engine to draw four bars
 * and one area.
 */

// Ordinal funnel ramp, dark mode. Light -> dark, one hue.
const FUNNEL_RAMP = ['#C9BAFF', '#9C85FF', '#7657FF']
const SERIES = '#7657FF'

export function PerformanceDashboard({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  // One settle on mount. Numbers never loop — a continuously animating metric
  // reads as decoration and stops being legible.
  const settle = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      }

  return (
    <figure
      className={cn(
        'relative rounded-lg border border-white/12 bg-surface-dark/90 p-5 backdrop-blur-sm sm:p-6',
        className,
      )}
    >
      <figcaption className="sr-only">
        Illustrative NEOMAX campaign performance panel showing average return on ad
        spend, revenue growth, funnel conversion by stage, a monthly revenue trend,
        and channel share. Figures are illustrative, not live client data. A full
        data table follows.
      </figcaption>

      {/* Panel chrome */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-lime animate-pulse-dot" />
          </span>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
            Campaign performance
          </span>
        </div>
        <span className="rounded-sm border border-white/15 px-2 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-muted-dark">
          {heroDashboard.timeRange}
        </span>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* Hero figure — a headline number, deliberately not a chart */}
        <motion.div {...settle} transition={{ ...transition.slow, delay: 0.1 }}>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
            Average ROAS
          </p>
          <p className="tabular mt-1.5 font-display text-[2.75rem] font-bold leading-none text-white">
            {heroDashboard.roas.toFixed(1)}x
          </p>
        </motion.div>

        <motion.div {...settle} transition={{ ...transition.slow, delay: 0.16 }}>
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
            Revenue growth
          </p>
          <p className="tabular mt-1.5 flex items-baseline gap-1.5 font-display text-[2.75rem] font-bold leading-none text-lime">
            <span aria-hidden="true" className="text-[1.5rem]">
              ↑
            </span>
            {heroDashboard.revenueGrowthPct}%
          </p>
        </motion.div>
      </div>

      {/* Revenue trend — one series, so no legend box */}
      <motion.div
        {...settle}
        transition={{ ...transition.slow, delay: 0.22 }}
        className="mt-6 border-t border-white/10 pt-5"
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
          Monthly revenue trend
        </p>
        <RevenueSparkline className="mt-3" />
      </motion.div>

      {/* Funnel — ordinal ramp, direct-labelled */}
      <motion.div
        {...settle}
        transition={{ ...transition.slow, delay: 0.28 }}
        className="mt-6 border-t border-white/10 pt-5"
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
          Funnel conversion
        </p>
        <ul className="mt-3 space-y-2.5">
          {heroDashboard.funnel.map((stage, index) => (
            <li key={stage.stage} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-body-sm text-muted-dark">{stage.stage}</span>
              <span className="h-2 flex-1 overflow-hidden rounded-sm bg-white/[0.07]">
                <motion.span
                  className="block h-full rounded-sm"
                  style={{
                    backgroundColor: FUNNEL_RAMP[index],
                    // With reduced motion the bar is simply drawn at its width.
                    ...(reduceMotion ? { width: `${stage.pct}%` } : null),
                  }}
                  initial={reduceMotion ? false : { width: 0 }}
                  animate={reduceMotion ? undefined : { width: `${stage.pct}%` }}
                  transition={{ ...transition.slow, delay: 0.34 + index * 0.08 }}
                />
              </span>
              {/* Direct label: also the contrast relief for the lighter ramp steps */}
              <span className="tabular w-10 shrink-0 text-right font-mono text-body-sm text-white">
                {stage.pct}%
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Channels — nominal, so one hue for every bar */}
      <motion.div
        {...settle}
        transition={{ ...transition.slow, delay: 0.34 }}
        className="mt-6 border-t border-white/10 pt-5"
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
          Channel share
        </p>
        <ul className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2.5">
          {heroDashboard.channels.map(channel => (
            <li key={channel.name} className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="h-6 w-1 shrink-0 rounded-sm"
                style={{ backgroundColor: SERIES }}
              />
              <span className="min-w-0 flex-1 truncate text-body-sm text-muted-dark">
                {channel.name}
              </span>
              <span className="tabular shrink-0 font-mono text-body-sm text-white">
                {channel.share}%
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      <DashboardDataTable />
    </figure>
  )
}

/**
 * Hand-drawn area + line. 2px stroke, no dots on every point, recessive fill.
 */
function RevenueSparkline({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const data = heroDashboard.revenueSeries
  const width = 320
  const height = 64
  const max = Math.max(...data.map(d => d.value))
  const min = Math.min(...data.map(d => d.value))
  const range = max - min || 1

  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * width,
    y: height - ((d.value - min) / range) * (height - 8) - 4,
  }))

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  const last = points[points.length - 1]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-16 w-full', className)}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="neomax-revenue-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={SERIES} stopOpacity="0.28" />
          <stop offset="100%" stopColor={SERIES} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#neomax-revenue-fill)" />
      <motion.path
        d={line}
        fill="none"
        stroke={SERIES}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={reduceMotion ? undefined : { pathLength: 0 }}
        animate={reduceMotion ? undefined : { pathLength: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
      />
      {/* Only the current value gets a marker — never a dot on every point */}
      <circle cx={last.x} cy={last.y} r="3.5" fill={SERIES} stroke="#151D31" strokeWidth="2" />
    </svg>
  )
}

/**
 * The table view. Charts are never the only route to the numbers, and this also
 * discharges the contrast-relief obligation for the lighter ramp steps.
 */
function DashboardDataTable() {
  return (
    <div className="sr-only">
      <table>
        <caption>Illustrative campaign performance data</caption>
        <tbody>
          <tr>
            <th scope="row">Average ROAS</th>
            <td>{heroDashboard.roas.toFixed(1)}x</td>
          </tr>
          <tr>
            <th scope="row">Revenue growth</th>
            <td>Up {heroDashboard.revenueGrowthPct} percent</td>
          </tr>
          {heroDashboard.funnel.map(stage => (
            <tr key={stage.stage}>
              <th scope="row">Funnel stage: {stage.stage}</th>
              <td>{stage.pct} percent</td>
            </tr>
          ))}
          {heroDashboard.channels.map(channel => (
            <tr key={channel.name}>
              <th scope="row">Channel: {channel.name}</th>
              <td>{channel.share} percent of spend</td>
            </tr>
          ))}
          {heroDashboard.revenueSeries.map(point => (
            <tr key={point.month}>
              <th scope="row">Revenue index, {point.month}</th>
              <td>{point.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
