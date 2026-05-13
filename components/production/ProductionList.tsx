'use client'

import { useState } from 'react'
import { History } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EditHistoryModal } from '@/components/attendance/EditHistoryModal'
import { formatAFN } from '@/lib/utils'

interface ProductionEntry {
  id: string
  employee_id: string
  date: string
  work_code: string
  quantity: number
  unit_price: number
  notes: string | null
  entered_at: string
  employee?: { name_dari: string; emp_code: string } | null
}

interface Props {
  entries: ProductionEntry[]
  locale: string
  selectedDate: string
}

export function ProductionList({ entries, locale, selectedDate }: Props) {
  const isRTL = locale !== 'en'
  const [historyEntry, setHistoryEntry] = useState<ProductionEntry | null>(null)

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {locale === 'en' ? 'No production entries for this date.' : 'هیچ تولیدی برای این تاریخ ثبت نشده.'}
      </p>
    )
  }

  return (
    <>
      <div className="divide-y rounded-lg border bg-card" dir={isRTL ? 'rtl' : 'ltr'}>
        {entries.map(entry => {
          const total = entry.quantity * entry.unit_price
          return (
            <div key={entry.id} className="flex items-center gap-3 px-3 py-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{entry.employee?.name_dari}</span>
                  <Badge variant="outline" className="text-xs font-mono">{entry.work_code}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                  <span>{entry.quantity} × {formatAFN(entry.unit_price)}</span>
                  <span className="font-medium text-emerald-700">{formatAFN(total)}</span>
                </div>
                {entry.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">{entry.notes}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                onClick={() => setHistoryEntry(entry)}
                title={locale === 'en' ? 'Edit history' : 'تاریخچه'}
              >
                <History className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        })}
      </div>

      {historyEntry && (
        <EditHistoryModal
          open={!!historyEntry}
          onOpenChange={open => { if (!open) setHistoryEntry(null) }}
          employeeName={historyEntry.employee?.name_dari ?? ''}
          employeeId={historyEntry.employee_id}
          date={historyEntry.date}
          locale={locale}
          type="production"
        />
      )}
    </>
  )
}

export function ProductionListSkeleton() {
  return (
    <div className="divide-y rounded-lg border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}
