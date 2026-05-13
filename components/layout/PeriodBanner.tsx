'use client'

import { AlertCircle, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { hijriMonthName } from '@/lib/hijri'
import type { AccountingPeriod } from '@/types/database'

interface PeriodBannerProps {
  period: AccountingPeriod | null
  locale: string
}

export function PeriodBanner({ period, locale }: PeriodBannerProps) {
  if (!period) return null

  const lang = locale === 'en' ? 'en' : 'dari'
  const monthName = hijriMonthName(period.hijri_month, lang)
  const isClosed = period.status === 'closed'
  const isClosing = period.status === 'closing'

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium',
        isClosed && 'bg-red-50 text-red-800 border-b border-red-200',
        isClosing && 'bg-yellow-50 text-yellow-800 border-b border-yellow-200',
        !isClosed && !isClosing && 'bg-sage-50 text-slate-700 border-b border-slate-200'
      )}
    >
      {isClosed ? (
        <AlertCircle className="h-4 w-4 shrink-0" />
      ) : (
        <Calendar className="h-4 w-4 shrink-0" />
      )}
      <span>
        {isClosed
          ? locale === 'en'
            ? `Closed Period — ${monthName} ${period.hijri_year} — Read Only`
            : `دوره بسته — ${monthName} ${period.hijri_year} — فقط خواندنی`
          : locale === 'en'
          ? `Open Period: ${monthName} ${period.hijri_year}`
          : `دوره باز: ${monthName} ${period.hijri_year}`}
      </span>
    </div>
  )
}
