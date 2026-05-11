import { CheckCircle } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function ApprovalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Approvals Center"
      titleDari="مرکز تأییدیه‌ها"
      descEn="Inbox-style approval center — pending approvals for salary changes, payroll runs, large advances, period reopens. Auto-expires after 14 days."
      descDari="مرکز تأییدیه‌ها — تأییدیه‌های در انتظار برای تغییر معاش، اجرای معاش، پیشپرداخت‌های بزرگ، بازگشایی دوره. انقضای خودکار پس از ۱۴ روز."
      icon={CheckCircle}
      phase="B"
    />
  )
}
