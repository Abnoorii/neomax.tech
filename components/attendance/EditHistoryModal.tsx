'use client'

import { useEffect, useState } from 'react'
import { Clock, User, ChevronRight } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { formatHijriDate } from '@/lib/hijri'
import { cn } from '@/lib/utils'

interface HistoryEntry {
  id: string
  changed_at: string
  changed_by: string
  old_status: string | null
  new_status: string
  old_hours: number | null
  new_hours: number
  change_reason: string | null
  changed_by_profile?: { name: string } | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeName: string
  employeeId: string
  date: string
  locale: string
  type: 'attendance' | 'production'
}

const STATUS_COLORS: Record<string, string> = {
  present:  'bg-emerald-100 text-emerald-700',
  absent:   'bg-red-100 text-red-700',
  sick:     'bg-orange-100 text-orange-700',
  holiday:  'bg-blue-100 text-blue-700',
  half_day: 'bg-purple-100 text-purple-700',
}

const STATUS_LABELS_EN: Record<string, string> = {
  present: 'Present', absent: 'Absent', sick: 'Sick', holiday: 'Holiday', half_day: 'Half Day',
}
const STATUS_LABELS_DARI: Record<string, string> = {
  present: 'حاضر', absent: 'غایب', sick: 'مریض', holiday: 'رخصتی', half_day: 'نیم روز',
}

function statusLabel(s: string, locale: string) {
  if (locale === 'en') return STATUS_LABELS_EN[s] ?? s
  return STATUS_LABELS_DARI[s] ?? s
}

function relativeTime(iso: string, locale: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (locale === 'en') {
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${mins}m ago`
  }
  if (days > 0) return `${days} روز پیش`
  if (hours > 0) return `${hours} ساعت پیش`
  return `${mins} دقیقه پیش`
}

export function EditHistoryModal({ open, onOpenChange, employeeName, employeeId, date, locale, type }: Props) {
  const isRTL = locale !== 'en'
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const table = type === 'attendance' ? 'attendance_history' : 'production_history'
    const supabase = createClient()
    supabase
      .from(table)
      .select('*, changed_by_profile:profiles!changed_by(name)')
      .eq('employee_id', employeeId)
      .eq('date', date)
      .order('changed_at', { ascending: false })
      .then(({ data }) => {
        setHistory((data ?? []) as unknown as HistoryEntry[])
        setLoading(false)
      })
  }, [open, employeeId, date, type])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {locale === 'en' ? 'Edit History' : 'تاریخچه تغییرات'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {employeeName} · {(() => { const [jy, jm, jd] = date.split('-').map(Number); return formatHijriDate(jy!, jm!, jd!, locale as 'en' | 'dari' | 'pashto') })()}
          </p>
        </DialogHeader>

        <div className="mt-2 space-y-3 max-h-[400px] overflow-y-auto pe-1">
          {loading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-border mt-1" />
                {i < 2 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div className="pb-4 space-y-1.5 flex-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}

          {!loading && history.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              {locale === 'en' ? 'No edit history found.' : 'تاریخچه‌ای یافت نشد.'}
            </p>
          )}

          {!loading && history.map((entry, idx) => (
            <div key={entry.id} className="flex gap-3">
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-primary mt-1 shrink-0" />
                {idx < history.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-0" />}
              </div>

              <div className="pb-4 min-w-0 flex-1">
                {/* Status change */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {entry.old_status && (
                    <>
                      <Badge className={cn('text-xs', STATUS_COLORS[entry.old_status] ?? 'bg-muted')}>
                        {statusLabel(entry.old_status, locale)}
                      </Badge>
                      <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0" />
                    </>
                  )}
                  <Badge className={cn('text-xs', STATUS_COLORS[entry.new_status] ?? 'bg-muted')}>
                    {statusLabel(entry.new_status, locale)}
                  </Badge>
                  {entry.new_hours !== entry.old_hours && entry.old_hours !== null && (
                    <span className="text-xs text-muted-foreground">
                      {entry.old_hours}h → {entry.new_hours}h
                    </span>
                  )}
                </div>

                {/* Reason */}
                {entry.change_reason && (
                  <p className="text-xs text-muted-foreground mt-1 italic">"{entry.change_reason}"</p>
                )}

                {/* Who + when */}
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{(entry.changed_by_profile as { name: string } | null)?.name ?? entry.changed_by.slice(0, 8)}</span>
                  <span>·</span>
                  <span title={new Date(entry.changed_at).toLocaleString()}>
                    {relativeTime(entry.changed_at, locale)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
