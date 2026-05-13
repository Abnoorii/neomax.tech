'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatAFN } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AdvanceEntry {
  id: string
  date: string
  amount: number
  repaid_amount: number | null
  advance_type: string
  description: string | null
  status: 'active' | 'repaid' | 'waived'
}

interface EmployeeSummary {
  id: string
  emp_code: string
  name_dari: string
  name_english: string | null
  entries: AdvanceEntry[]
  totalDisbursed: number
  totalRepaid: number
  outstanding: number
}

interface Props {
  summaries: EmployeeSummary[]
  locale: string
  canRepay: boolean
}

const TYPE_LABELS_EN: Record<string, string> = { cash: 'Cash', kind: 'In Kind', deduction: 'Deduction', disbursement: 'Disbursement', recovery: 'Recovery', adjustment: 'Adjustment' }
const TYPE_LABELS_DARI: Record<string, string> = { cash: 'نقدی', kind: 'جنسی', deduction: 'کسر', disbursement: 'پرداخت', recovery: 'بازیابی', adjustment: 'تنظیم' }

export function AdvancesLedger({ summaries, locale, canRepay }: Props) {
  const isRTL = locale !== 'en'
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  function toggle(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const totalOutstanding = summaries.reduce((s, e) => s + e.outstanding, 0)

  if (summaries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {locale === 'en' ? 'No advance records found.' : 'هیچ پیشپرداختی یافت نشد.'}
      </p>
    )
  }

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Summary banner */}
      <div className="rounded-lg border bg-amber-50 border-amber-200 px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-medium text-amber-800">
          {locale === 'en' ? 'Total Outstanding' : 'مجموع بدهی'}
        </span>
        <span className="text-lg font-bold text-amber-900">{formatAFN(totalOutstanding)}</span>
      </div>

      {/* Employee rows */}
      <div className="divide-y rounded-lg border bg-card">
        {summaries.map(emp => {
          const isOpen = expanded.has(emp.id)
          const hasBalance = emp.outstanding > 0

          return (
            <div key={emp.id}>
              <button
                type="button"
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-accent/50 transition-colors text-start"
                onClick={() => toggle(emp.id)}
              >
                {isOpen
                  ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                  : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{emp.name_dari}</span>
                    <span className="text-xs text-muted-foreground">{emp.emp_code}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span>{locale === 'en' ? 'Disbursed:' : 'پرداخت:'} {formatAFN(emp.totalDisbursed)}</span>
                    <span>{locale === 'en' ? 'Repaid:' : 'بازپرداخت:'} {formatAFN(emp.totalRepaid)}</span>
                  </div>
                </div>
                <div className={cn(
                  'text-sm font-semibold shrink-0',
                  emp.outstanding > 0 ? 'text-red-600' : 'text-emerald-600',
                )}>
                  {emp.outstanding > 0 ? '-' : ''}{formatAFN(Math.abs(emp.outstanding))}
                </div>
              </button>

              {/* Expanded entries */}
              {isOpen && (
                <div className="bg-muted/30 divide-y border-t">
                  {emp.entries.length === 0 && (
                    <p className="text-xs text-muted-foreground px-10 py-3">
                      {locale === 'en' ? 'No entries.' : 'رکوردی نیست.'}
                    </p>
                  )}
                  {emp.entries.map(entry => {
                    const typeLabel = locale === 'en' ? (TYPE_LABELS_EN[entry.advance_type] ?? entry.advance_type) : (TYPE_LABELS_DARI[entry.advance_type] ?? entry.advance_type)
                    return (
                      <div key={entry.id} className="flex items-center gap-3 px-10 py-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium">{entry.date}</span>
                            <Badge variant="outline" className="text-xs">{typeLabel}</Badge>
                            {entry.status === 'repaid' && (
                              <Badge className="text-xs bg-emerald-100 text-emerald-700">
                                {locale === 'en' ? 'Repaid' : 'بازپرداخت شد'}
                              </Badge>
                            )}
                          </div>
                          {entry.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{entry.description}</p>
                          )}
                        </div>
                        <div className="text-end shrink-0">
                          <p className="text-sm font-medium">{formatAFN(entry.amount)}</p>
                          {(entry.repaid_amount ?? 0) > 0 && entry.status !== 'repaid' && (
                            <p className="text-xs text-emerald-600">
                              -{formatAFN(entry.repaid_amount ?? 0)}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AdvancesLedgerSkeleton() {
  return (
    <div className="divide-y rounded-lg border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <Skeleton className="h-4 w-4 rounded" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      ))}
    </div>
  )
}
