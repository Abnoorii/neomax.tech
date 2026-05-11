import { Clock } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function PeriodsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Accounting Periods"
      titleDari="دوره‌های حسابداری"
      descEn="Hijri monthly accounting periods — open, closing, closed lifecycle. Pre-close checklist. Auto-generates all 8 archived reports on close. Reopen requires dual approval."
      descDari="دوره‌های حسابداری هجری شمسی — چرخه حیات باز، در حال بستن، بسته. چک‌لیست پیش از بستن. تولید خودکار ۸ گزارش آرشیوی. بازگشایی نیازمند تأیید دوگانه."
      icon={Clock}
      phase="D"
    />
  )
}
