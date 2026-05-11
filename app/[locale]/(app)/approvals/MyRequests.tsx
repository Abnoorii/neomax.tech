'use client'

import { useTransition } from 'react'
import { Clock, CheckCircle2, XCircle, Ban } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cancelRequest } from '@/app/actions/approvals'
import { useToast } from '@/hooks/use-toast'

interface ApprovalRequest {
  id: string; action_type: string; status: string; requested_at: string
  reason: string | null; rejection_reason: string | null
  payload: Record<string, unknown>
  profiles: { full_name: string | null; full_name_dari: string | null } | null
}

interface Props { locale: string; requests: ApprovalRequest[] }

const statusIcons = {
  pending: Clock,
  approved: CheckCircle2,
  rejected: XCircle,
  expired: Ban,
}

const statusVariants: Record<string, 'warning' | 'success' | 'destructive' | 'outline'> = {
  pending: 'warning', approved: 'success', rejected: 'destructive', expired: 'outline',
}

const actionTypeLabels: Record<string, { en: string; dari: string }> = {
  salary_change: { en: 'Salary Change', dari: 'تغییر معاش' },
  employee_termination: { en: 'Employee Termination', dari: 'برکناری کارمند' },
  rate_card_change: { en: 'Rate Card Change', dari: 'تغییر نرخ' },
  payroll_run_approval: { en: 'Payroll Approval', dari: 'تأیید معاش' },
  large_advance: { en: 'Large Advance', dari: 'پیشپرداخت بزرگ' },
  advance_writeoff: { en: 'Advance Write-off', dari: 'حذف پیشپرداخت' },
  reopen_closed_month: { en: 'Reopen Month', dari: 'بازگشایی دوره' },
  void_record: { en: 'Void Record', dari: 'ابطال رکورد' },
  policy_change: { en: 'Policy Change', dari: 'تغییر سیاست' },
}

export function MyRequests({ locale, requests }: Props) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isRTL = locale !== 'en'

  function handleCancel(id: string) {
    startTransition(async () => {
      try {
        await cancelRequest(id)
        toast({ title: locale === 'en' ? 'Request cancelled' : 'درخواست لغو شد' })
      } catch (err) {
        toast({ title: String(err), variant: 'destructive' })
      }
    })
  }

  if (requests.length === 0) {
    return (
      <div className="mt-6 text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
        <p className="text-slate-500">{locale === 'en' ? 'You have no pending requests.' : 'هیچ درخواستی ندارید.'}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 mt-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {requests.map(req => {
        const label = actionTypeLabels[req.action_type]
        const StatusIcon = statusIcons[req.status as keyof typeof statusIcons] ?? Clock
        const approverName = locale === 'en'
          ? req.profiles?.full_name
          : req.profiles?.full_name_dari || req.profiles?.full_name

        return (
          <Card key={req.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariants[req.status] ?? 'outline'} className="text-xs gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {req.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {locale === 'en' ? label?.en : label?.dari}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(req.requested_at).toLocaleDateString()}
                    {approverName && req.status === 'approved' && ` · ${locale === 'en' ? 'Approved by' : 'تأیید توسط'}: ${approverName}`}
                    {approverName && req.status === 'rejected' && ` · ${locale === 'en' ? 'Rejected by' : 'رد توسط'}: ${approverName}`}
                  </p>
                </div>
                {req.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancel(req.id)}
                    disabled={isPending}
                  >
                    {locale === 'en' ? 'Cancel' : 'لغو'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-slate-600 space-y-1">
              {req.reason && <p><span className="font-medium">{locale === 'en' ? 'Reason:' : 'دلیل:'}</span> {req.reason}</p>}
              {req.rejection_reason && (
                <p className="text-red-600">
                  <span className="font-medium">{locale === 'en' ? 'Rejection reason:' : 'دلیل رد:'}</span> {req.rejection_reason}
                </p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
