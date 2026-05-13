'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { approveRequest, rejectRequest } from '@/app/actions/approvals'
import { useToast } from '@/hooks/use-toast'

interface ApprovalRequest {
  id: string
  action_type: string
  status: string
  requested_at: string
  reason: string | null
  expires_at: string | null
  payload: Record<string, unknown>
  profiles: { full_name: string | null; full_name_dari: string | null } | null
}

interface Props {
  locale: string
  approvals: ApprovalRequest[]
  currentUserId: string
}

const actionTypeLabels: Record<string, { en: string; dari: string }> = {
  salary_change: { en: 'Salary Change', dari: 'تغییر معاش' },
  employee_termination: { en: 'Employee Termination', dari: 'برکناری کارمند' },
  rate_card_change: { en: 'Rate Card Change', dari: 'تغییر نرخ' },
  payroll_run_approval: { en: 'Payroll Approval', dari: 'تأیید معاش' },
  large_advance: { en: 'Large Advance', dari: 'پیشپرداخت بزرگ' },
  advance_writeoff: { en: 'Advance Write-off', dari: 'حذف پیشپرداخت' },
  reopen_closed_month: { en: 'Reopen Closed Month', dari: 'بازگشایی دوره بسته' },
  void_record: { en: 'Void Record', dari: 'ابطال رکورد' },
  policy_change: { en: 'Policy Change', dari: 'تغییر سیاست' },
}

function PayloadSummary({ payload, actionType, locale }: { payload: Record<string, unknown>; actionType: string; locale: string }) {
  const isRTL = locale !== 'en'
  if (actionType === 'salary_change') {
    const before = payload.before as { base_salary?: number; daily_rate?: number } | undefined
    const after = payload.after as { base_salary?: number; daily_rate?: number } | undefined
    return (
      <div className="text-xs space-y-1">
        <p className="font-[Vazirmatn] text-slate-700">{payload.employee_name as string} ({payload.emp_code as string})</p>
        {(before?.base_salary !== undefined || after?.base_salary !== undefined) && (
          <p className="text-slate-500">
            {locale === 'en' ? 'Base salary' : 'معاش پایه'}:
            <span className="line-through text-red-500 mx-1">{before?.base_salary} AFN</span>
            →
            <span className="text-green-600 ml-1">{after?.base_salary} AFN</span>
          </p>
        )}
        {(before?.daily_rate !== undefined || after?.daily_rate !== undefined) && (
          <p className="text-slate-500">
            {locale === 'en' ? 'Daily rate' : 'نرخ روزانه'}:
            <span className="line-through text-red-500 mx-1">{before?.daily_rate} AFN</span>
            →
            <span className="text-green-600 ml-1">{after?.daily_rate} AFN</span>
          </p>
        )}
      </div>
    )
  }
  if (actionType === 'rate_card_change') {
    const before = payload.before as { unit_price?: number } | undefined
    const after = payload.after as { unit_price?: number } | undefined
    return (
      <div className="text-xs">
        <p className="font-mono">{payload.work_code as string}</p>
        <p className="text-slate-500 mt-0.5">
          {locale === 'en' ? 'Price' : 'نرخ'}:
          <span className="line-through text-red-500 mx-1">{before?.unit_price} AFN</span>
          →
          <span className="text-green-600 ml-1">{after?.unit_price} AFN</span>
        </p>
      </div>
    )
  }
  if (actionType === 'employee_termination') {
    return (
      <div className="text-xs">
        <p className="font-[Vazirmatn]">{payload.employee_name as string}</p>
        <p className="text-slate-500">{payload.emp_code as string}</p>
      </div>
    )
  }
  return <div className="text-xs text-slate-500">{JSON.stringify(payload).slice(0, 100)}…</div>
}

export function ApprovalsInbox({ locale, approvals, currentUserId }: Props) {
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isRTL = locale !== 'en'

  function handleApprove(id: string) {
    startTransition(async () => {
      try {
        await approveRequest(id)
        toast({ title: locale === 'en' ? 'Request approved and executed' : 'درخواست تأیید و اجرا شد', variant: 'default' })
      } catch (err) {
        toast({ title: String(err), variant: 'destructive' })
      }
    })
  }

  function handleRejectSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rejectTarget) return
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        await rejectRequest(rejectTarget, fd.get('rejection_reason') as string)
        toast({ title: locale === 'en' ? 'Request rejected' : 'درخواست رد شد' })
        setRejectTarget(null)
      } catch (err) {
        toast({ title: String(err), variant: 'destructive' })
      }
    })
  }

  if (approvals.length === 0) {
    return (
      <div className="mt-6 text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
        <CheckCircle2 className="h-10 w-10 text-green-400 mx-auto mb-3" />
        <p className="text-slate-500">{locale === 'en' ? 'No pending approvals — all clear!' : 'هیچ تأییدیه‌ای در انتظار نیست!'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 mt-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {approvals.map(req => {
        const label = actionTypeLabels[req.action_type]
        const requesterName = locale === 'en'
          ? req.profiles?.full_name
          : req.profiles?.full_name_dari || req.profiles?.full_name

        const isExpiringSoon = req.expires_at &&
          new Date(req.expires_at).getTime() - Date.now() < 48 * 60 * 60 * 1000

        return (
          <Card key={req.id} className="border-l-4 border-l-amber-400">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="warning" className="text-xs">
                      {locale === 'en' ? label?.en : label?.dari}
                    </Badge>
                    {isExpiringSoon && (
                      <Badge variant="destructive" className="text-xs gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        {locale === 'en' ? 'Expiring soon' : 'در حال انقضا'}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(req.requested_at).toLocaleDateString()}</span>
                    <span>·</span>
                    <span>{locale === 'en' ? 'By:' : 'توسط:'} {requesterName ?? 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setRejectTarget(req.id)}
                    disabled={isPending}
                  >
                    <XCircle className="h-4 w-4" />
                    {locale === 'en' ? 'Reject' : 'رد'}
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => handleApprove(req.id)}
                    disabled={isPending}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {locale === 'en' ? 'Approve' : 'تأیید'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-2">
              <PayloadSummary payload={req.payload} actionType={req.action_type} locale={locale} />
              {req.reason && (
                <p className="text-xs text-slate-500 border-t pt-2">
                  <span className="font-medium">{locale === 'en' ? 'Reason:' : 'دلیل:'}</span> {req.reason}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}

      {/* Reject Dialog */}
      <Dialog open={rejectTarget !== null} onOpenChange={o => !o && setRejectTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'en' ? 'Reject Request' : 'رد درخواست'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRejectSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{locale === 'en' ? 'Reason for rejection *' : 'دلیل رد *'}</Label>
              <Textarea name="rejection_reason" required rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRejectTarget(null)}>
                {locale === 'en' ? 'Cancel' : 'لغو'}
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                {isPending ? '...' : (locale === 'en' ? 'Reject' : 'رد')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
