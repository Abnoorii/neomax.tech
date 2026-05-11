import { BarChart3 } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function RateCardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Rate Card"
      titleDari="کارت نرخ"
      descEn="Versioned piece-rate table grouped by category. Editing creates new versioned rows — never overwrites history. Rate changes require dual approval."
      descDari="جدول نرخ‌های کاری نسخه‌بندی شده. ویرایش ردیف‌های جدید ایجاد می‌کند — تاریخچه هرگز بازنویسی نمی‌شود. تغییرات نرخ نیازمند تأیید دوگانه."
      icon={BarChart3}
      phase="B"
    />
  )
}
