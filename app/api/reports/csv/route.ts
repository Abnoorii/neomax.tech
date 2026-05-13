import { NextRequest, NextResponse } from 'next/server'
import {
  getPayrollSummaryReport,
  getAttendanceReport,
  getProductionReport,
  getAdvancesReport,
  getLaborCostReport,
  getTaxReport,
  getDisbursementList,
} from '@/app/actions/reports'

function escape(v: unknown): string {
  const s = String(v ?? '')
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

function csv(rows: (string | number)[][]): string {
  return rows.map(r => r.map(escape).join(',')).join('\r\n')
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const type = searchParams.get('type') ?? ''
  const periodId = searchParams.get('period') ?? ''
  const yearStr = searchParams.get('year') ?? ''

  try {
    let content = ''
    let filename = `${type}.csv`

    switch (type) {
      case 'payroll': {
        const { rows, period } = await getPayrollSummaryReport(periodId)
        filename = `payroll-${period.hijri_year}-${period.hijri_month}.csv`
        content = csv([
          ['Emp Code', 'Name', 'Days Present', 'Days Absent', 'Fixed', 'Piece Rate', 'Overtime', 'Transport', 'Food Ded.', 'Tax', 'Advance Recovery', 'Net Pay'],
          ...(rows as { employee: { emp_code: string; name_dari: string } | { emp_code: string; name_dari: string }[] | null; days_present: number; days_absent: number; fixed_earnings: number; piece_rate_earnings: number; overtime: number; transport: number; food_deduction: number; tax: number; advance_recovery: number; net_pay: number }[]).map(r => {
            const emp = Array.isArray(r.employee) ? r.employee[0] : r.employee
            return [emp?.emp_code ?? '', emp?.name_dari ?? '', r.days_present, r.days_absent, r.fixed_earnings, r.piece_rate_earnings, r.overtime, r.transport, r.food_deduction, r.tax, r.advance_recovery, r.net_pay]
          }),
        ])
        break
      }
      case 'attendance': {
        const { rows, period } = await getAttendanceReport(periodId)
        filename = `attendance-${period.hijri_year}-${period.hijri_month}.csv`
        content = csv([
          ['Emp Code', 'Name', 'Present', 'Absent', 'Sick', 'Holiday', 'Half Day'],
          ...rows.map(r => [r.emp_code, r.name_dari, r.present, r.absent, r.sick, r.holiday, r.half_day]),
        ])
        break
      }
      case 'production': {
        const { rows, period } = await getProductionReport(periodId)
        filename = `production-${period.hijri_year}-${period.hijri_month}.csv`
        const flatRows: string[][] = [['Emp Code', 'Name', 'Work Code', 'Description', 'Quantity', 'Unit Price', 'Total']]
        for (const r of rows) {
          for (const l of r.lines) {
            flatRows.push([r.employee.emp_code, r.employee.name_dari, l.work_code, l.desc, String(l.qty), String(l.price), String(l.total)])
          }
        }
        content = csv(flatRows)
        break
      }
      case 'advances': {
        const { rows, period } = await getAdvancesReport(periodId)
        filename = `advances-${period.hijri_year}-${period.hijri_month}.csv`
        content = csv([
          ['Emp Code', 'Name', 'Opening Balance', 'Disbursed', 'Recovered', 'Closing Balance'],
          ...rows.map(r => [r.emp_code, r.name_dari, r.openingBalance, r.disbursed, r.recovered, r.closingBalance]),
        ])
        break
      }
      case 'labor-cost': {
        const { rows, period } = await getLaborCostReport(periodId)
        filename = `labor-cost-${period.hijri_year}-${period.hijri_month}.csv`
        content = csv([
          ['Section', 'Headcount', 'Gross', 'Deductions', 'Net'],
          ...rows.map(r => [r.section.name_dari, r.headcount, r.gross, r.deductions, r.net]),
        ])
        break
      }
      case 'tax': {
        const { rows, period, totalTax } = await getTaxReport(periodId)
        filename = `tax-${period.hijri_year}-${period.hijri_month}.csv`
        content = csv([
          ['Emp Code', 'Name', 'Taxable Gross', 'Tax Withheld'],
          ...rows.map(r => [r.employee?.emp_code ?? '', r.employee?.name_dari ?? '', r.taxableGross, r.tax]),
          ['', 'TOTAL', '', totalTax],
        ])
        break
      }
      case 'disbursement': {
        const { rows, period } = await getDisbursementList(periodId)
        filename = `disbursement-${period.hijri_year}-${period.hijri_month}.csv`
        content = csv([
          ['Emp Code', 'Name', 'Bank Account', 'Hawala Provider', 'Phone', 'Net Pay'],
          ...rows.map(r => [
            r.employee?.emp_code ?? '',
            r.employee?.name_dari ?? '',
            r.employee?.bank_account ?? '',
            r.employee?.hawala_provider ?? '',
            r.employee?.phone ?? '',
            r.netPay,
          ]),
        ])
        break
      }
      default:
        return NextResponse.json({ error: 'Unknown report type' }, { status: 400 })
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ERROR'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
