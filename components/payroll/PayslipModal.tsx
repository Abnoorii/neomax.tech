'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatAFN } from '@/lib/utils'

interface PieceRateLine {
  work_code: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface Payslip {
  employee?: { emp_code: string; name_dari: string; name_english: string | null } | null
  days_present: number
  days_absent: number
  days_holiday: number
  days_sick: number
  fixed_earnings: number
  piece_rate_earnings: number
  piece_rate_lines: PieceRateLine[]
  overtime: number
  transport: number
  food_deduction: number
  tax: number
  advance_recovery: number
  advance_opening_balance: number
  advance_closing_balance: number
  net_pay: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  payslip: Payslip
  locale: string
  periodLabel?: string
}

function Row({ label, value, bold, negative, indent }: {
  label: string; value: number; bold?: boolean; negative?: boolean; indent?: boolean
}) {
  const display = negative && value > 0 ? `-${formatAFN(value)}` : formatAFN(value)
  return (
    <div className={`flex justify-between text-sm py-0.5 ${indent ? 'ps-4' : ''}`}>
      <span className={bold ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
      <span className={`tabular-nums ${bold ? 'font-semibold' : ''} ${negative && value > 0 ? 'text-red-600' : ''}`}>
        {display}
      </span>
    </div>
  )
}

export function PayslipModal({ open, onOpenChange, payslip, locale, periodLabel }: Props) {
  const isRTL = locale !== 'en'
  const t = (en: string, dari: string) => locale === 'en' ? en : dari

  const gross = payslip.fixed_earnings + payslip.piece_rate_earnings + payslip.overtime + payslip.transport

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="text-base">
            {t('Pay Slip', 'فیش معاش')}
          </DialogTitle>
          {payslip.employee && (
            <div className="text-sm text-muted-foreground space-y-0.5 mt-1">
              <p className="font-medium text-foreground">{payslip.employee.name_dari}</p>
              {payslip.employee.name_english && (
                <p className="text-xs">{payslip.employee.name_english}</p>
              )}
              <p className="text-xs font-mono">{payslip.employee.emp_code}</p>
              {periodLabel && <p className="text-xs">{periodLabel}</p>}
            </div>
          )}
        </DialogHeader>

        <div className="space-y-3">
          {/* Attendance summary */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              {t('Attendance', 'حضور')}
            </p>
            <div className="flex gap-3 flex-wrap text-xs">
              <AttCell count={payslip.days_present} label={t('Present', 'حاضر')} color="emerald" />
              <AttCell count={payslip.days_absent} label={t('Absent', 'غایب')} color="red" />
              <AttCell count={payslip.days_sick} label={t('Sick', 'مریض')} color="orange" />
              <AttCell count={payslip.days_holiday} label={t('Holiday', 'رخصتی')} color="blue" />
            </div>
          </div>

          <Separator />

          {/* Earnings */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              {t('Earnings', 'درآمد')}
            </p>
            {payslip.fixed_earnings > 0 && (
              <Row label={t('Fixed salary', 'معاش ثابت')} value={payslip.fixed_earnings} />
            )}
            {payslip.piece_rate_earnings > 0 && (
              <>
                <Row label={t('Piece-rate work', 'کار قطعه‌ای')} value={payslip.piece_rate_earnings} />
                {payslip.piece_rate_lines.map(l => (
                  <div key={l.work_code} className="flex justify-between text-xs py-0.5 ps-4 text-muted-foreground">
                    <span>{l.description} × {l.quantity}</span>
                    <span className="tabular-nums">{formatAFN(l.total)}</span>
                  </div>
                ))}
              </>
            )}
            {payslip.overtime > 0 && (
              <Row label={t('Overtime', 'اضافه‌کاری')} value={payslip.overtime} />
            )}
            {payslip.transport > 0 && (
              <Row label={t('Transport', 'ترانسپورت')} value={payslip.transport} />
            )}
            <Row label={t('Gross Pay', 'معاش ناخالص')} value={gross} bold />
          </div>

          <Separator />

          {/* Deductions */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              {t('Deductions', 'کسورات')}
            </p>
            {payslip.food_deduction > 0 && (
              <Row label={t('Food', 'غذا')} value={payslip.food_deduction} negative />
            )}
            {payslip.tax > 0 && (
              <Row label={t('Tax', 'مالیه')} value={payslip.tax} negative />
            )}
            {payslip.advance_recovery > 0 && (
              <Row label={t('Advance recovery', 'کسر پیشپرداخت')} value={payslip.advance_recovery} negative />
            )}
          </div>

          {payslip.advance_opening_balance > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  {t('Advance Ledger', 'حساب پیشپرداخت')}
                </p>
                <Row label={t('Opening balance', 'مانده ابتدایی')} value={payslip.advance_opening_balance} />
                <Row label={t('Recovered', 'کسر شده')} value={payslip.advance_recovery} negative />
                <Row label={t('Closing balance', 'مانده پایانی')} value={payslip.advance_closing_balance} bold />
              </div>
            </>
          )}

          <Separator />

          {/* Net pay */}
          <div className="flex justify-between items-baseline pt-1">
            <span className="font-bold text-base">{t('Net Pay', 'خالص معاش')}</span>
            <span className="font-bold text-xl text-emerald-700 tabular-nums">{formatAFN(payslip.net_pay)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AttCell({ count, label, color }: { count: number; label: string; color: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  return (
    <div className={`flex flex-col items-center px-2 py-1 rounded border ${colors[color] ?? ''}`}>
      <span className="font-bold text-base leading-none">{count}</span>
      <span className="text-xs mt-0.5 opacity-80">{label}</span>
    </div>
  )
}
