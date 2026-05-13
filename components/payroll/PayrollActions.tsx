'use client'

import { useState, useTransition } from 'react'
import { Calculator, Send, CheckCircle, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { formatAFN } from '@/lib/utils'
import { preparePayrollRun, submitPayrollForApproval, markPayrollPaid } from '@/app/actions/payroll'
import type { PayrollStatus } from '@/types/database'

interface Props {
  periodId: string
  runId: string | null
  runStatus: PayrollStatus | null
  totalGross: number
  totalNet: number
  locale: string
  canPrepare: boolean
  canApprove: boolean
  canMarkPaid: boolean
}

const STATUS_CONFIG: Record<PayrollStatus, { labelEn: string; labelDari: string; color: string }> = {
  draft:              { labelEn: 'Draft',              labelDari: 'پیش‌نویس',      color: 'bg-slate-100 text-slate-700' },
  pending_approval:   { labelEn: 'Pending Approval',   labelDari: 'در انتظار تأیید', color: 'bg-amber-100 text-amber-700' },
  approved:           { labelEn: 'Approved',           labelDari: 'تأیید شده',      color: 'bg-emerald-100 text-emerald-700' },
  paid:               { labelEn: 'Paid',               labelDari: 'پرداخت شده',     color: 'bg-blue-100 text-blue-700' },
}

export function PayrollActions({
  periodId, runId, runStatus, totalGross, totalNet, locale, canPrepare, canApprove, canMarkPaid,
}: Props) {
  const [pending, startTransition] = useTransition()
  const [submitOpen, setSubmitOpen] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ headcount: number; totalNet: number } | null>(null)

  function handlePrepare() {
    startTransition(async () => {
      setError('')
      try {
        const r = await preparePayrollRun(periodId)
        setResult({ headcount: r.headcount, totalNet: r.totalNet })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }

  function handleSubmit() {
    if (!runId) return
    startTransition(async () => {
      setError('')
      try {
        await submitPayrollForApproval(runId, notes || undefined)
        setSubmitOpen(false)
        setNotes('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }

  function handleMarkPaid() {
    if (!runId) return
    startTransition(async () => {
      setError('')
      try {
        await markPayrollPaid(runId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }

  const t = (en: string, dari: string) => locale === 'en' ? en : dari
  const cfg = runStatus ? STATUS_CONFIG[runStatus] : null

  return (
    <div className="space-y-3">
      {/* Status badge + totals */}
      <div className="flex items-center gap-3 flex-wrap">
        {cfg && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
            {locale === 'en' ? cfg.labelEn : cfg.labelDari}
          </span>
        )}
        {totalGross > 0 && (
          <>
            <span className="text-sm text-muted-foreground">
              {t('Gross:', 'ناخالص:')} <span className="font-medium text-foreground">{formatAFN(totalGross)}</span>
            </span>
            <span className="text-sm font-semibold text-emerald-700">
              {t('Net:', 'خالص:')} {formatAFN(totalNet)}
            </span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {canPrepare && (!runStatus || runStatus === 'draft') && (
          <Button onClick={handlePrepare} disabled={pending} size="sm" variant="outline" className="gap-1.5">
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Calculator className="h-3.5 w-3.5" />}
            {runId ? t('Recalculate', 'محاسبه مجدد') : t('Calculate Payroll', 'محاسبه معاش')}
          </Button>
        )}

        {canPrepare && runStatus === 'draft' && runId && (
          <Button onClick={() => setSubmitOpen(true)} disabled={pending} size="sm" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            {t('Submit for Approval', 'ارسال برای تأیید')}
          </Button>
        )}

        {canMarkPaid && runStatus === 'approved' && runId && (
          <Button onClick={handleMarkPaid} disabled={pending} size="sm" className="gap-1.5 bg-emerald-600 hover:bg-emerald-700">
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
            {t('Mark as Paid', 'علامت‌گذاری به عنوان پرداخت شده')}
          </Button>
        )}
      </div>

      {result && (
        <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {t(
            `Calculated ${result.headcount} payslips. Total net: ${formatAFN(result.totalNet)}`,
            `${result.headcount} فیش محاسبه شد. مجموع خالص: ${formatAFN(result.totalNet)}`
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded px-3 py-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Submit notes dialog */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent dir={locale !== 'en' ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{t('Submit for Approval', 'ارسال برای تأیید')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {t(
                'This will lock the payroll run and send it for approval. Add any notes for the approver.',
                'این عملیات معاش را قفل می‌کند و برای تأیید ارسال می‌شود. یادداشتی برای تأییدکننده اضافه کنید.',
              )}
            </p>
            <Textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder={t('Notes (optional)…', 'یادداشت (اختیاری)…')}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>
              {t('Cancel', 'لغو')}
            </Button>
            <Button onClick={handleSubmit} disabled={pending}>
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin me-1" />}
              {t('Submit', 'ارسال')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
