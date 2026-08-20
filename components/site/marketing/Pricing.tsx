'use client'

import { useState } from 'react'
import { Check, Minus, ChevronDown } from 'lucide-react'
import {
  plans,
  comparisonRows,
  effectiveMonthlyPrice,
  quarterlyTotal,
  pricingNote,
  QUARTERLY_DISCOUNT,
  type BillingPeriod,
} from '@/content/pricing'
import { formatCurrency } from '@/content/metrics'
import { needsLabel } from '@/content/verification'
import { ButtonLink } from '@/components/site/ui/Button'
import { cn } from '@/lib/utils'

export function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>('monthly')
  const [comparisonOpen, setComparisonOpen] = useState(false)

  return (
    <div>
      {/* Billing toggle — a real radio group, so arrow keys work as expected. */}
      <div className="flex justify-center">
        <fieldset className="inline-flex rounded-md border border-soft-gray bg-white p-1">
          <legend className="sr-only">Billing period</legend>
          {(
            [
              { value: 'monthly', label: 'Monthly' },
              { value: 'quarterly', label: `Quarterly · save ${QUARTERLY_DISCOUNT * 100}%` },
            ] as const
          ).map(option => (
            <label
              key={option.value}
              className={cn(
                'relative flex min-h-[40px] cursor-pointer items-center rounded-sm px-4 text-body-sm transition-colors duration-fast',
                period === option.value
                  ? 'bg-navy text-white'
                  : 'text-slate-strong hover:text-navy',
              )}
            >
              <input
                type="radio"
                name="billing-period"
                value={option.value}
                checked={period === option.value}
                onChange={() => setPeriod(option.value)}
                className="sr-only"
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      </div>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map(plan => {
          const monthly = effectiveMonthlyPrice(plan, period)
          const total = period === 'quarterly' ? quarterlyTotal(plan) : null

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col rounded-lg border bg-white p-7',
                // The featured plan is marked by weight and a rule, not by a
                // loud colour block — it should read as recommended, not shouted.
                plan.featured
                  ? 'border-navy shadow-[0_1px_0_0_#11182A]'
                  : 'border-soft-gray',
              )}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-7 rounded-sm bg-navy px-2.5 py-1 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-white">
                  Most chosen
                </span>
              ) : null}

              <h3 className="font-display text-heading text-navy">{plan.name}</h3>
              <p className="mt-2 text-body-sm text-slate-strong">{plan.intendedFor}</p>

              <div className="mt-6 border-y border-soft-gray py-6">
                {monthly === null ? (
                  <p className="font-display text-metric-sm text-navy">Custom</p>
                ) : (
                  <>
                    <p className="tabular font-display text-metric-sm text-navy">
                      {formatCurrency(monthly)}
                      <span className="ml-1 font-sans text-body-sm font-normal text-slate">
                        /mo
                      </span>
                    </p>
                    {total !== null ? (
                      <p className="tabular mt-1.5 text-body-sm text-slate-strong">
                        {formatCurrency(total)} billed quarterly
                      </p>
                    ) : null}
                  </>
                )}
                <p className="mt-3 text-body-sm text-slate-strong">{plan.description}</p>
              </div>

              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.included.map(item => (
                  <li key={item} className="flex gap-2.5 text-body-sm text-slate-strong">
                    <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-violet-600" />
                    {item}
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-3 border-t border-soft-gray pt-5 text-body-sm">
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                    Reporting
                  </dt>
                  <dd className="mt-1 text-navy">{plan.reporting}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                    Support
                  </dt>
                  <dd className="mt-1 text-navy">{plan.support}</dd>
                </div>
              </dl>

              <ButtonLink
                href={plan.ctaHref}
                variant={plan.featured ? 'primary' : 'outline'}
                size="lg"
                full
                className="mt-7"
              >
                {plan.ctaLabel}
              </ButtonLink>
            </div>
          )
        })}
      </div>

      {needsLabel(pricingNote) ? null : (
        <p className="mt-8 text-center text-body-sm text-slate-strong">{pricingNote.text}</p>
      )}

      {/* Expandable comparison */}
      <div className="mt-12 border-t border-soft-gray pt-8">
        <button
          type="button"
          onClick={() => setComparisonOpen(open => !open)}
          aria-expanded={comparisonOpen}
          aria-controls="plan-comparison"
          className="mx-auto flex min-h-[44px] items-center gap-2 rounded-md px-4 text-body-sm font-medium text-navy transition-colors duration-fast hover:text-violet-600"
        >
          {comparisonOpen ? 'Hide full comparison' : 'Compare all plan features'}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              'h-4 w-4 transition-transform duration-base',
              comparisonOpen && 'rotate-180',
            )}
          />
        </button>

        {comparisonOpen ? (
          <div id="plan-comparison" className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left">
              <caption className="sr-only">Feature comparison across NEOMAX plans</caption>
              <thead>
                <tr className="border-b border-navy">
                  <th scope="col" className="py-3 pr-4 text-body-sm font-medium text-navy">
                    Feature
                  </th>
                  {plans.map(plan => (
                    <th
                      key={plan.id}
                      scope="col"
                      className="px-4 py-3 text-body-sm font-medium text-navy"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map(row => (
                  <tr key={row.feature} className="border-b border-soft-gray">
                    <th
                      scope="row"
                      className="py-3 pr-4 text-body-sm font-normal text-slate-strong"
                    >
                      {row.feature}
                    </th>
                    {row.values.map((value, index) => (
                      <td key={`${row.feature}-${plans[index].id}`} className="px-4 py-3 text-body-sm text-navy">
                        {typeof value === 'boolean' ? (
                          value ? (
                            <>
                              <Check aria-hidden="true" className="h-4 w-4 text-violet-600" />
                              <span className="sr-only">Included</span>
                            </>
                          ) : (
                            <>
                              <Minus aria-hidden="true" className="h-4 w-4 text-soft-gray" />
                              <span className="sr-only">Not included</span>
                            </>
                          )
                        ) : (
                          value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  )
}
