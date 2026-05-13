'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, X, Printer } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatAFN } from '@/lib/utils'
import {
  getPayrollSummaryReport,
  getAttendanceReport,
  getProductionReport,
  getAdvancesReport,
  getLaborCostReport,
  getTaxReport,
  getDisbursementList,
} from '@/app/actions/reports'

type ReportType = 'payroll' | 'attendance' | 'production' | 'advances' | 'labor-cost' | 'tax' | 'disbursement'

interface Props {
  type: ReportType
  periodId: string
  titleEn: string
  titleDari: string
  locale: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportViewer({ type, periodId, titleEn, titleDari, locale, open, onOpenChange }: Props) {
  const isRTL = locale !== 'en'
  const [data, setData] = useState<Record<string, unknown> | null>(null)
  const [loading, startLoad] = useTransition()
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setData(null)
    setError('')
    startLoad(async () => {
      try {
        let result: unknown
        switch (type) {
          case 'payroll':    result = await getPayrollSummaryReport(periodId); break
          case 'attendance': result = await getAttendanceReport(periodId); break
          case 'production': result = await getProductionReport(periodId); break
          case 'advances':   result = await getAdvancesReport(periodId); break
          case 'labor-cost': result = await getLaborCostReport(periodId); break
          case 'tax':        result = await getTaxReport(periodId); break
          case 'disbursement': result = await getDisbursementList(periodId); break
        }
        setData(result as Record<string, unknown>)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }, [open, type, periodId])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader className="flex-row items-center justify-between gap-3">
          <DialogTitle>{locale === 'en' ? titleEn : titleDari}</DialogTitle>
          <Button variant="ghost" size="sm" className="gap-1.5 shrink-0" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5" />
            {locale === 'en' ? 'Print' : 'چاپ'}
          </Button>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 mt-2">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && <p className="text-sm text-destructive text-center py-8">{error}</p>}
          {!loading && !error && data && <ReportContent type={type} data={data} locale={locale} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ReportContent({ type, data, locale }: { type: ReportType; data: Record<string, unknown>; locale: string }) {
  const d = data as Record<string, unknown>
  const t = (en: string, dari: string) => locale === 'en' ? en : dari

  if (type === 'payroll') {
    const rows = (d.rows ?? []) as {
      employee: { emp_code: string; name_dari: string } | null
      days_present: number; days_absent: number
      fixed_earnings: number; piece_rate_earnings: number
      overtime: number; transport: number
      food_deduction: number; tax: number; advance_recovery: number; net_pay: number
    }[]
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Employee', 'کارمند')}</TableHead>
            <TableHead className="text-center">{t('P', 'ح')}</TableHead>
            <TableHead className="text-center">{t('A', 'غ')}</TableHead>
            <TableHead className="text-end">{t('Fixed', 'ثابت')}</TableHead>
            <TableHead className="text-end">{t('Piece Rate', 'کاری')}</TableHead>
            <TableHead className="text-end">{t('OT', 'اضافه')}</TableHead>
            <TableHead className="text-end">{t('Transport', 'ترانسپورت')}</TableHead>
            <TableHead className="text-end">{t('Deductions', 'کسورات')}</TableHead>
            <TableHead className="text-end font-semibold">{t('Net', 'خالص')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => {
            const emp = Array.isArray(r.employee) ? r.employee[0] : r.employee
            return (
              <TableRow key={i}>
                <TableCell><span className="font-medium text-sm">{emp?.name_dari}</span><br /><span className="text-xs text-muted-foreground">{emp?.emp_code}</span></TableCell>
                <TableCell className="text-center text-sm">{r.days_present}</TableCell>
                <TableCell className="text-center text-sm">{r.days_absent}</TableCell>
                <TableCell className="text-end text-sm">{formatAFN(r.fixed_earnings)}</TableCell>
                <TableCell className="text-end text-sm">{formatAFN(r.piece_rate_earnings)}</TableCell>
                <TableCell className="text-end text-sm">{formatAFN(r.overtime)}</TableCell>
                <TableCell className="text-end text-sm">{formatAFN(r.transport)}</TableCell>
                <TableCell className="text-end text-sm text-red-600">
                  {formatAFN((r.food_deduction ?? 0) + (r.tax ?? 0) + (r.advance_recovery ?? 0))}
                </TableCell>
                <TableCell className="text-end font-semibold">{formatAFN(r.net_pay)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  if (type === 'attendance') {
    const rows = (d.rows ?? []) as { emp_code: string; name_dari: string; present: number; absent: number; sick: number; holiday: number; half_day: number }[]
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Employee', 'کارمند')}</TableHead>
            <TableHead className="text-center">{t('Present', 'حاضر')}</TableHead>
            <TableHead className="text-center">{t('Absent', 'غایب')}</TableHead>
            <TableHead className="text-center">{t('Sick', 'مریض')}</TableHead>
            <TableHead className="text-center">{t('Holiday', 'رخصتی')}</TableHead>
            <TableHead className="text-center">{t('Half Day', 'نیم روز')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell><span className="font-medium text-sm">{r.name_dari}</span><br /><span className="text-xs text-muted-foreground">{r.emp_code}</span></TableCell>
              <TableCell className="text-center text-emerald-700 font-medium">{r.present}</TableCell>
              <TableCell className="text-center text-red-600">{r.absent || '—'}</TableCell>
              <TableCell className="text-center text-orange-600">{r.sick || '—'}</TableCell>
              <TableCell className="text-center text-blue-600">{r.holiday || '—'}</TableCell>
              <TableCell className="text-center text-purple-600">{r.half_day || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (type === 'production') {
    const rows = (d.rows ?? []) as { employee: { emp_code: string; name_dari: string }; lines: { work_code: string; desc: string; qty: number; price: number; total: number }[]; totalAmount: number }[]
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Employee', 'کارمند')}</TableHead>
            <TableHead>{t('Work Code', 'کد کار')}</TableHead>
            <TableHead>{t('Description', 'توضیح')}</TableHead>
            <TableHead className="text-end">{t('Qty', 'مقدار')}</TableHead>
            <TableHead className="text-end">{t('Rate', 'نرخ')}</TableHead>
            <TableHead className="text-end">{t('Total', 'مجموع')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.flatMap(r =>
            r.lines.map((l, li) => (
              <TableRow key={`${r.employee.emp_code}-${l.work_code}`}>
                {li === 0 && (
                  <TableCell rowSpan={r.lines.length} className="align-top">
                    <span className="font-medium text-sm">{r.employee.name_dari}</span><br />
                    <span className="text-xs text-muted-foreground">{r.employee.emp_code}</span>
                  </TableCell>
                )}
                <TableCell className="font-mono text-xs">{l.work_code}</TableCell>
                <TableCell className="text-sm">{l.desc}</TableCell>
                <TableCell className="text-end text-sm">{l.qty}</TableCell>
                <TableCell className="text-end text-sm">{formatAFN(l.price)}</TableCell>
                <TableCell className="text-end font-medium">{formatAFN(l.total)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    )
  }

  if (type === 'advances') {
    const rows = (d.rows ?? []) as { emp_code: string; name_dari: string; openingBalance: number; disbursed: number; recovered: number; closingBalance: number }[]
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Employee', 'کارمند')}</TableHead>
            <TableHead className="text-end">{t('Opening', 'ابتدا')}</TableHead>
            <TableHead className="text-end">{t('Disbursed', 'پرداخت')}</TableHead>
            <TableHead className="text-end">{t('Recovered', 'بازیافت')}</TableHead>
            <TableHead className="text-end font-semibold">{t('Closing', 'پایان')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell><span className="font-medium text-sm">{r.name_dari}</span><br /><span className="text-xs text-muted-foreground">{r.emp_code}</span></TableCell>
              <TableCell className="text-end">{formatAFN(r.openingBalance)}</TableCell>
              <TableCell className="text-end text-amber-600">{r.disbursed > 0 ? formatAFN(r.disbursed) : '—'}</TableCell>
              <TableCell className="text-end text-emerald-600">{r.recovered > 0 ? formatAFN(r.recovered) : '—'}</TableCell>
              <TableCell className={`text-end font-semibold ${r.closingBalance > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
                {formatAFN(r.closingBalance)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  if (type === 'labor-cost') {
    const rows = (d.rows ?? []) as { section: { name_dari: string; name_en: string; code: string }; headcount: number; gross: number; deductions: number; net: number }[]
    const totals = d.totals as { gross: number; deductions: number; net: number }
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Section', 'بخش')}</TableHead>
            <TableHead className="text-center">{t('Headcount', 'تعداد')}</TableHead>
            <TableHead className="text-end">{t('Gross', 'ناخالص')}</TableHead>
            <TableHead className="text-end">{t('Deductions', 'کسورات')}</TableHead>
            <TableHead className="text-end font-semibold">{t('Net', 'خالص')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell><span className="font-medium text-sm">{locale === 'en' ? r.section.name_en : r.section.name_dari}</span></TableCell>
              <TableCell className="text-center">{r.headcount}</TableCell>
              <TableCell className="text-end">{formatAFN(r.gross)}</TableCell>
              <TableCell className="text-end text-red-600">-{formatAFN(r.deductions)}</TableCell>
              <TableCell className="text-end font-semibold">{formatAFN(r.net)}</TableCell>
            </TableRow>
          ))}
          {totals && (
            <TableRow className="font-bold border-t-2">
              <TableCell>{t('Total', 'مجموع')}</TableCell>
              <TableCell />
              <TableCell className="text-end">{formatAFN(totals.gross)}</TableCell>
              <TableCell className="text-end text-red-600">-{formatAFN(totals.deductions)}</TableCell>
              <TableCell className="text-end text-emerald-700">{formatAFN(totals.net)}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    )
  }

  if (type === 'tax') {
    const rows = (d.rows ?? []) as { employee: { emp_code: string; name_dari: string } | null; taxableGross: number; tax: number }[]
    const totalTax = d.totalTax as number
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Employee', 'کارمند')}</TableHead>
            <TableHead className="text-end">{t('Taxable Gross', 'معاش مشمول')}</TableHead>
            <TableHead className="text-end font-semibold">{t('Tax Withheld', 'مالیه کسر شده')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell><span className="font-medium text-sm">{r.employee?.name_dari}</span><br /><span className="text-xs text-muted-foreground">{r.employee?.emp_code}</span></TableCell>
              <TableCell className="text-end">{formatAFN(r.taxableGross)}</TableCell>
              <TableCell className="text-end font-medium text-red-600">{formatAFN(r.tax)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-bold border-t-2">
            <TableCell>{t('Total', 'مجموع')}</TableCell>
            <TableCell />
            <TableCell className="text-end text-red-600">{formatAFN(totalTax)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    )
  }

  if (type === 'disbursement') {
    const rows = (d.rows ?? []) as {
      employee: { emp_code: string; name_dari: string; bank_account: string | null; hawala_provider: string | null; phone: string | null } | null
      netPay: number
    }[]
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('Employee', 'کارمند')}</TableHead>
            <TableHead>{t('Bank / Hawala', 'بانک / حواله')}</TableHead>
            <TableHead>{t('Phone', 'تلفن')}</TableHead>
            <TableHead className="text-end font-semibold">{t('Amount', 'مبلغ')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={i}>
              <TableCell><span className="font-medium text-sm">{r.employee?.name_dari}</span><br /><span className="text-xs text-muted-foreground">{r.employee?.emp_code}</span></TableCell>
              <TableCell className="text-sm">{r.employee?.bank_account ?? r.employee?.hawala_provider ?? '—'}</TableCell>
              <TableCell className="text-sm font-mono">{r.employee?.phone ?? '—'}</TableCell>
              <TableCell className="text-end font-semibold text-emerald-700">{formatAFN(r.netPay)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return null
}
