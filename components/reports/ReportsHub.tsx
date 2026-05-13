'use client'

import { useState } from 'react'
import {
  CreditCard, CalendarCheck, Factory, Wallet,
  BarChart2, Receipt, Banknote, TrendingUp,
} from 'lucide-react'
import { ReportCard } from './ReportCard'
import { ReportViewer } from './ReportViewer'

type ReportType = 'payroll' | 'attendance' | 'production' | 'advances' | 'labor-cost' | 'tax' | 'disbursement'

interface ReportDef {
  type: ReportType
  titleEn: string
  titleDari: string
  descEn: string
  descDari: string
  icon: React.ElementType
  needsPayroll: boolean
}

const REPORTS: ReportDef[] = [
  {
    type: 'payroll',
    titleEn: 'Payroll Summary',
    titleDari: 'خلاصه معاش',
    descEn: 'Per-employee gross earnings, deductions, and net pay.',
    descDari: 'معاش ناخالص، کسورات و خالص معاش هر کارمند.',
    icon: CreditCard,
    needsPayroll: true,
  },
  {
    type: 'attendance',
    titleEn: 'Attendance Report',
    titleDari: 'گزارش حضور',
    descEn: 'Days present, absent, sick, and holiday per employee.',
    descDari: 'روزهای حاضر، غایب، مریض و رخصتی هر کارمند.',
    icon: CalendarCheck,
    needsPayroll: false,
  },
  {
    type: 'production',
    titleEn: 'Production Report',
    titleDari: 'گزارش تولید',
    descEn: 'Piece-rate output by employee and work code.',
    descDari: 'خروجی کاری هر کارمند بر اساس کد کار.',
    icon: Factory,
    needsPayroll: false,
  },
  {
    type: 'advances',
    titleEn: 'Advances Report',
    titleDari: 'گزارش پیشپرداخت',
    descEn: 'Opening balance, disbursements, recoveries, and closing balance.',
    descDari: 'مانده ابتدایی، پرداخت‌ها، بازیافت‌ها و مانده پایانی.',
    icon: Wallet,
    needsPayroll: false,
  },
  {
    type: 'labor-cost',
    titleEn: 'Labor Cost by Section',
    titleDari: 'هزینه نیروی کار',
    descEn: 'Gross, deductions, and net pay broken down by workshop section.',
    descDari: 'ناخالص، کسورات و خالص معاش بر اساس بخش.',
    icon: BarChart2,
    needsPayroll: true,
  },
  {
    type: 'tax',
    titleEn: 'Tax Report',
    titleDari: 'گزارش مالیات',
    descEn: 'Taxable gross and withheld tax per employee.',
    descDari: 'معاش مشمول مالیه و مالیه کسر شده.',
    icon: Receipt,
    needsPayroll: true,
  },
  {
    type: 'disbursement',
    titleEn: 'Disbursement List',
    titleDari: 'لیست پرداخت',
    descEn: 'Bank/Hawala payment list for cashier with net amounts.',
    descDari: 'لیست پرداخت بانکی/حوالوی برای صندوقدار.',
    icon: Banknote,
    needsPayroll: true,
  },
]

interface Props {
  periodId: string
  hasPayrollRun: boolean
  locale: string
}

export function ReportsHub({ periodId, hasPayrollRun, locale }: Props) {
  const [viewing, setViewing] = useState<ReportType | null>(null)
  const currentReport = viewing ? REPORTS.find(r => r.type === viewing) : null

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {REPORTS.map(r => (
          <ReportCard
            key={r.type}
            type={r.type}
            titleEn={r.titleEn}
            titleDari={r.titleDari}
            descEn={r.descEn}
            descDari={r.descDari}
            icon={r.icon}
            periodId={periodId}
            locale={locale}
            available={r.needsPayroll ? hasPayrollRun : true}
            onView={() => setViewing(r.type)}
          />
        ))}
      </div>

      {viewing && currentReport && (
        <ReportViewer
          type={viewing}
          periodId={periodId}
          titleEn={currentReport.titleEn}
          titleDari={currentReport.titleDari}
          locale={locale}
          open={!!viewing}
          onOpenChange={open => { if (!open) setViewing(null) }}
        />
      )}
    </>
  )
}
