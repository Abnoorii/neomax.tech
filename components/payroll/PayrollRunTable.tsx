'use client'

import { useState } from 'react'
import { Eye, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatAFN } from '@/lib/utils'
import { PayslipModal } from './PayslipModal'

interface Payslip {
  id: string
  employee_id: string
  days_present: number
  days_absent: number
  days_holiday: number
  days_sick: number
  fixed_earnings: number
  piece_rate_earnings: number
  piece_rate_lines: { work_code: string; description: string; quantity: number; unit_price: number; total: number }[]
  overtime: number
  transport: number
  food_deduction: number
  tax: number
  advance_recovery: number
  advance_opening_balance: number
  advance_closing_balance: number
  net_pay: number
  employee: { id: string; emp_code: string; name_dari: string; name_english: string | null } | null
}

interface Props {
  payslips: Payslip[]
  locale: string
  totalGross: number
  totalDeductions: number
  totalNet: number
}

export function PayrollRunTable({ payslips, locale, totalGross, totalDeductions, totalNet }: Props) {
  const isRTL = locale !== 'en'
  const [selected, setSelected] = useState<Payslip | null>(null)

  if (payslips.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        {locale === 'en' ? 'No payslips yet. Prepare the run first.' : 'هنوز فیشی آماده نشده. ابتدا معاش را محاسبه کنید.'}
      </p>
    )
  }

  return (
    <>
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === 'en' ? 'Employee' : 'کارمند'}</TableHead>
              <TableHead className="text-center">{locale === 'en' ? 'Days' : 'روزها'}</TableHead>
              <TableHead className="text-end">{locale === 'en' ? 'Fixed' : 'ثابت'}</TableHead>
              <TableHead className="text-end">{locale === 'en' ? 'Piece Rate' : 'کاری'}</TableHead>
              <TableHead className="text-end">{locale === 'en' ? 'Transport' : 'ترانسپورت'}</TableHead>
              <TableHead className="text-end">{locale === 'en' ? 'Deductions' : 'کسورات'}</TableHead>
              <TableHead className="text-end font-semibold">{locale === 'en' ? 'Net Pay' : 'خالص معاش'}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {payslips.map(slip => {
              const deductions = slip.food_deduction + slip.tax + slip.advance_recovery
              return (
                <TableRow key={slip.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{slip.employee?.name_dari}</p>
                    <p className="text-xs text-muted-foreground">{slip.employee?.emp_code}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1 flex-wrap">
                      <AttBadge count={slip.days_present} color="emerald" label={locale === 'en' ? 'P' : 'ح'} />
                      {slip.days_absent > 0 && <AttBadge count={slip.days_absent} color="red" label={locale === 'en' ? 'A' : 'غ'} />}
                      {slip.days_sick > 0 && <AttBadge count={slip.days_sick} color="orange" label={locale === 'en' ? 'S' : 'م'} />}
                      {slip.days_holiday > 0 && <AttBadge count={slip.days_holiday} color="blue" label={locale === 'en' ? 'H' : 'ر'} />}
                    </div>
                  </TableCell>
                  <TableCell className="text-end text-sm">{formatAFN(slip.fixed_earnings)}</TableCell>
                  <TableCell className="text-end text-sm">{formatAFN(slip.piece_rate_earnings)}</TableCell>
                  <TableCell className="text-end text-sm">{formatAFN(slip.transport)}</TableCell>
                  <TableCell className="text-end text-sm text-red-600">{deductions > 0 ? `-${formatAFN(deductions)}` : '—'}</TableCell>
                  <TableCell className="text-end font-semibold">{formatAFN(slip.net_pay)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setSelected(slip)}
                      title={locale === 'en' ? 'View payslip' : 'مشاهده فیش'}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Totals footer */}
      <div className="flex justify-end gap-6 pt-2 text-sm" dir={isRTL ? 'rtl' : 'ltr'}>
        <span className="text-muted-foreground">
          {locale === 'en' ? 'Gross:' : 'ناخالص:'} <span className="font-medium text-foreground">{formatAFN(totalGross)}</span>
        </span>
        <span className="text-muted-foreground">
          {locale === 'en' ? 'Deductions:' : 'کسورات:'} <span className="font-medium text-red-600">-{formatAFN(totalDeductions)}</span>
        </span>
        <span className="text-muted-foreground font-semibold">
          {locale === 'en' ? 'Net:' : 'خالص:'} <span className="text-emerald-700 text-base">{formatAFN(totalNet)}</span>
        </span>
      </div>

      {selected && (
        <PayslipModal
          open={!!selected}
          onOpenChange={open => { if (!open) setSelected(null) }}
          payslip={selected}
          locale={locale}
        />
      )}
    </>
  )
}

function AttBadge({ count, color, label }: { count: number; color: string; label: string }) {
  const colors: Record<string, string> = {
    emerald: 'bg-emerald-100 text-emerald-700',
    red: 'bg-red-100 text-red-700',
    orange: 'bg-orange-100 text-orange-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${colors[color] ?? ''}`}>
      {count}{label}
    </span>
  )
}
