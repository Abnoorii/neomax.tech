import { FileText } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function ReportsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Reports"
      titleDari="گزارش‌ها"
      descEn="8 standard monthly reports (PDF + Excel): Payroll Summary, Attendance, Production, Advances, Labor Cost, Tax, Disbursement List. Annual roll-up report."
      descDari="۸ گزارش استاندارد ماهانه (PDF + Excel): خلاصه معاش، حضور، تولید، پیشپرداخت، هزینه نیروی کار، مالیات، لیست پرداخت. گزارش سالانه."
      icon={FileText}
      phase="D"
    />
  )
}
