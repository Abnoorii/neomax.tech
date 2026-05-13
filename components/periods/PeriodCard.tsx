'use client'

import { useState, useTransition } from 'react'
import { Lock, Unlock, RotateCcw, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { hijriMonthName } from '@/lib/hijri'
import { closePeriod, requestReopenPeriod, getPeriodCloseChecklist } from '@/app/actions/periods'

interface CheckItem {
  key: string
  labelEn: string
  labelDari: string
  passed: boolean
}

interface Period {
  id: string
  hijri_year: number
  hijri_month: number
  status: string
  start_date: string
  end_date: string
  closed_at: string | null
}

interface Props {
  period: Period
  locale: string
  canClose: boolean
  canRequestReopen: boolean
}

const STATUS_STYLE: Record<string, string> = {
  open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  closing: 'bg-amber-100 text-amber-700 border-amber-200',
  closed: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function PeriodCard({ period, locale, canClose, canRequestReopen }: Props) {
  const isRTL = locale !== 'en'
  const localeKey = locale as 'en' | 'dari' | 'pashto'
  const [pending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState(false)
  const [checklist, setChecklist] = useState<CheckItem[] | null>(null)
  const [checklistLoading, startCheckload] = useTransition()
  const [closeOpen, setCloseOpen] = useState(false)
  const [reopenOpen, setReopenOpen] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [error, setError] = useState('')

  function loadChecklist() {
    startCheckload(async () => {
      try {
        const { checks } = await getPeriodCloseChecklist(period.id)
        setChecklist(checks)
      } catch { /* ignore */ }
    })
  }

  function handleToggle() {
    const next = !expanded
    setExpanded(next)
    if (next && !checklist && period.status === 'open') loadChecklist()
  }

  function handleClose() {
    startTransition(async () => {
      setError('')
      try {
        await closePeriod(period.id)
        setCloseOpen(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }

  function handleReopen() {
    if (reopenReason.trim().length < 10) {
      setError(locale === 'en' ? 'Reason must be at least 10 characters.' : 'دلیل باید حداقل ۱۰ حرف باشد.')
      return
    }
    startTransition(async () => {
      setError('')
      try {
        await requestReopenPeriod(period.id, reopenReason.trim())
        setReopenOpen(false)
        setReopenReason('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }

  const monthName = hijriMonthName(period.hijri_month, localeKey)
  const t = (en: string, dari: string) => locale === 'en' ? en : dari

  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors text-start"
        onClick={handleToggle}
      >
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{monthName} {period.hijri_year}</span>
            <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', STATUS_STYLE[period.status] ?? STATUS_STYLE.closed)}>
              {period.status === 'open' ? t('Open', 'باز') : period.status === 'closed' ? t('Closed', 'بسته') : t('Closing', 'در حال بستن')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {period.start_date} → {period.end_date}
            {period.closed_at && ` · ${t('Closed', 'بسته شد')} ${new Date(period.closed_at).toLocaleDateString()}`}
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex gap-2 shrink-0" onClick={e => e.stopPropagation()}>
          {period.status === 'open' && canClose && (
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => { loadChecklist(); setCloseOpen(true) }}>
              <Lock className="h-3 w-3" />
              {t('Close', 'ببند')}
            </Button>
          )}
          {period.status === 'closed' && canRequestReopen && (
            <Button size="sm" variant="ghost" className="gap-1.5 text-xs" onClick={() => setReopenOpen(true)}>
              <RotateCcw className="h-3 w-3" />
              {t('Reopen', 'بازگشایی')}
            </Button>
          )}
        </div>
      </button>

      {/* Expandable checklist */}
      {expanded && period.status === 'open' && (
        <div className="border-t px-4 py-3 bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            {t('Pre-close checklist', 'چک‌لیست پیش از بستن')}
          </p>
          {checklistLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {checklist && (
            <ul className="space-y-1.5">
              {checklist.map(item => (
                <li key={item.key} className="flex items-center gap-2 text-sm">
                  {item.passed
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
                  <span className={item.passed ? 'text-foreground' : 'text-muted-foreground'}>
                    {locale === 'en' ? item.labelEn : item.labelDari}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Close confirmation dialog */}
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('Close Period', 'بستن دوره')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t(`Close ${monthName} ${period.hijri_year}? This will lock all records. Reopening requires dual approval.`,
                `دوره ${monthName} ${period.hijri_year} بسته شود؟ تمام رکوردها قفل می‌شوند. بازگشایی نیاز به تأیید دوگانه دارد.`)}
            </p>
            {checklist && (
              <ul className="space-y-1.5 text-sm border rounded-md p-3 bg-muted/20">
                {checklist.map(item => (
                  <li key={item.key} className="flex items-center gap-2">
                    {item.passed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" /> : <XCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                    {locale === 'en' ? item.labelEn : item.labelDari}
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>{t('Cancel', 'لغو')}</Button>
            <Button
              onClick={handleClose}
              disabled={pending || (checklist ? !checklist.every(c => c.passed) : false)}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin me-1" />}
              {t('Close Period', 'بستن دوره')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reopen request dialog */}
      <Dialog open={reopenOpen} onOpenChange={setReopenOpen}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('Request Reopen', 'درخواست بازگشایی')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t('Reopening requires dual approval. Provide a reason.', 'بازگشایی نیاز به تأیید دوگانه دارد. دلیل ارائه دهید.')}
            </p>
            <Textarea
              value={reopenReason}
              onChange={e => { setReopenReason(e.target.value); setError('') }}
              placeholder={t('Reason (min 10 chars)…', 'دلیل (حداقل ۱۰ حرف)…')}
              rows={3}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReopenOpen(false)}>{t('Cancel', 'لغو')}</Button>
            <Button onClick={handleReopen} disabled={pending}>
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin me-1" />}
              {t('Submit Request', 'ارسال درخواست')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
