import { Users } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function EmployeesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Employees"
      titleDari="کارمندان"
      descEn="Employee master — search, filter by section/status/pay type, view details, create/edit profiles, and track salary changes with dual approval."
      descDari="مدیریت کارمندان — جستجو، فیلتر، ایجاد و ویرایش پروفایل‌ها با سیستم تأیید دوگانه برای تغییرات معاش."
      icon={Users}
      phase="B"
    />
  )
}
