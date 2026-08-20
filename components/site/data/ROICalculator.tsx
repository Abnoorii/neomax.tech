'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { formatCurrency } from '@/content/metrics'
import { ButtonLink } from '@/components/site/ui/Button'
import { RangeField } from '@/components/site/forms/RangeField'

/** Input bounds. Kept here so the sliders, number fields, and URL parsing agree. */
const LIMITS = {
  monthlyAdSpend: { min: 1_000, max: 250_000, step: 500, fallback: 15_000 },
  currentRoas: { min: 0.5, max: 6, step: 0.1, fallback: 1.8 },
  averageOrderValue: { min: 20, max: 2_000, step: 5, fallback: 120 },
  targetRoas: { min: 0.5, max: 10, step: 0.1, fallback: 4.2 },
} as const

type Inputs = { [K in keyof typeof LIMITS]: number }

const DEFAULTS: Inputs = {
  monthlyAdSpend: LIMITS.monthlyAdSpend.fallback,
  currentRoas: LIMITS.currentRoas.fallback,
  averageOrderValue: LIMITS.averageOrderValue.fallback,
  targetRoas: LIMITS.targetRoas.fallback,
}

/** Short URL keys so a shared link stays readable. */
const PARAM_KEYS: Record<keyof Inputs, string> = {
  monthlyAdSpend: 'spend',
  currentRoas: 'roas',
  averageOrderValue: 'aov',
  targetRoas: 'target',
}

function clamp(key: keyof Inputs, value: number): number {
  const { min, max } = LIMITS[key]
  if (!Number.isFinite(value)) return DEFAULTS[key]
  return Math.min(max, Math.max(min, value))
}

export function ROICalculator() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULTS)

  // Read shared values from the URL after mount. Doing this in an effect rather
  // than during render keeps server and client markup identical on first paint.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const next = { ...DEFAULTS }
    let found = false
    for (const key of Object.keys(PARAM_KEYS) as (keyof Inputs)[]) {
      const raw = params.get(PARAM_KEYS[key])
      if (raw !== null && raw !== '') {
        const parsed = Number(raw)
        if (Number.isFinite(parsed)) {
          next[key] = clamp(key, parsed)
          found = true
        }
      }
    }
    if (found) setInputs(next)
  }, [])

  // Keep the address bar in sync so the current scenario is shareable.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    for (const key of Object.keys(PARAM_KEYS) as (keyof Inputs)[]) {
      params.set(PARAM_KEYS[key], String(inputs[key]))
    }
    const query = params.toString()
    window.history.replaceState(null, '', `${window.location.pathname}?${query}${window.location.hash}`)
  }, [inputs])

  const results = useMemo(() => {
    const { monthlyAdSpend, currentRoas, averageOrderValue, targetRoas } = inputs
    const currentRevenue = monthlyAdSpend * currentRoas
    const projectedRevenue = monthlyAdSpend * targetRoas
    const monthlyLift = projectedRevenue - currentRevenue
    const additionalOrders = averageOrderValue > 0 ? monthlyLift / averageOrderValue : 0
    const liftPercentage = currentRevenue > 0 ? (monthlyLift / currentRevenue) * 100 : 0
    return { currentRevenue, projectedRevenue, monthlyLift, additionalOrders, liftPercentage }
  }, [inputs])

  const set = (key: keyof Inputs) => (value: number) =>
    setInputs(previous => ({ ...previous, [key]: clamp(key, value) }))

  // The target can legitimately sit below the current rate; the result is shown
  // as a reduction rather than dressed up as a gain.
  const isGain = results.monthlyLift >= 0

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="min-w-0 lg:col-span-5">
        <div className="space-y-8">
          <RangeField
            label="Monthly ad spend"
            value={inputs.monthlyAdSpend}
            onChange={set('monthlyAdSpend')}
            {...LIMITS.monthlyAdSpend}
            format={value => formatCurrency(value)}
          />
          <RangeField
            label="Current ROAS"
            value={inputs.currentRoas}
            onChange={set('currentRoas')}
            {...LIMITS.currentRoas}
            format={value => `${value.toFixed(1)}x`}
            hint="Return on ad spend you achieve today."
          />
          <RangeField
            label="Average order value"
            value={inputs.averageOrderValue}
            onChange={set('averageOrderValue')}
            {...LIMITS.averageOrderValue}
            format={value => formatCurrency(value)}
          />
          <RangeField
            label="Target ROAS"
            value={inputs.targetRoas}
            onChange={set('targetRoas')}
            {...LIMITS.targetRoas}
            format={value => `${value.toFixed(1)}x`}
            hint="The return you want to model. This is your assumption, not a NEOMAX commitment."
          />
        </div>
      </div>

      <div className="min-w-0 lg:col-span-7">
        <div className="rounded-lg border border-white/12 bg-surface-raised p-6 sm:p-8">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
            Modelled outcome
          </p>

          {/* Results announce as a group when inputs change, without stealing focus. */}
          <div aria-live="polite" aria-atomic="true">
            <p className="sr-only">
              At {formatCurrency(inputs.monthlyAdSpend)} monthly spend, moving from{' '}
              {inputs.currentRoas.toFixed(1)}x to {inputs.targetRoas.toFixed(1)}x return models{' '}
              {formatCurrency(Math.abs(results.monthlyLift))} {isGain ? 'additional' : 'less'}{' '}
              revenue per month.
            </p>

            <div className="mt-5 grid gap-6 sm:grid-cols-2">
              <Figure label="Today's revenue" value={formatCurrency(results.currentRevenue)} />
              <Figure
                label="Projected revenue"
                value={formatCurrency(results.projectedRevenue)}
                emphasis
              />
            </div>

            <div className="mt-7 border-t border-white/10 pt-6">
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
                Estimated monthly {isGain ? 'lift' : 'reduction'}
              </p>
              <p
                className={`tabular mt-2 font-display text-metric ${
                  isGain ? 'text-lime' : 'text-danger'
                }`}
              >
                {isGain ? '+' : '−'}
                {formatCurrency(Math.abs(results.monthlyLift))}
              </p>

              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
                  <dt className="text-body-sm text-muted-dark">Revenue difference</dt>
                  <dd className="tabular font-mono text-body-sm text-white">
                    {isGain ? '+' : ''}
                    {results.liftPercentage.toFixed(0)}%
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-3">
                  <dt className="text-body-sm text-muted-dark">
                    {isGain ? 'Additional' : 'Fewer'} orders / mo
                  </dt>
                  <dd className="tabular font-mono text-body-sm text-white">
                    {Math.abs(Math.round(results.additionalOrders)).toLocaleString('en-US')}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href="/contact?source=roi-calculator"
              size="lg"
              className="group w-full whitespace-normal text-center sm:w-auto"
            >
              Get My Custom Growth Plan
              <ArrowRight
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5"
              />
            </ButtonLink>
          </div>
        </div>

        <div className="mt-5 flex items-start gap-2.5 text-body-sm text-muted-dark">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong className="font-medium text-white/90">This is arithmetic, not a forecast.</strong>{' '}
            The calculator multiplies the figures you enter — it makes no assessment of
            your business and predicts nothing. Assumptions: spend and order value stay
            constant, and the target return is one you supply. NEOMAX does not guarantee
            any result.
          </p>
        </div>
      </div>
    </div>
  )
}

function Figure({
  label,
  value,
  emphasis,
}: {
  label: string
  value: string
  emphasis?: boolean
}) {
  return (
    <div>
      <p className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted-dark">
        {label}
      </p>
      <p
        className={`tabular mt-1.5 font-display text-metric-sm ${
          emphasis ? 'text-white' : 'text-white/70'
        }`}
      >
        {value}
      </p>
    </div>
  )
}
