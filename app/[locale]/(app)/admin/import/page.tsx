import { Upload } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function ImportPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Legacy Import"
      titleDari="واردات داده‌های قدیمی"
      descEn="4-stage Excel migration: Profile → Cleanse (auto-fix month spellings, statuses, job titles) → Reconcile (verify vs legacy totals) → Commit to live tables."
      descDari="مهاجرت ۴ مرحله‌ای Excel: بررسی → پاکسازی (تصحیح خودکار) → تطبیق (مقایسه با مجموع‌های قدیمی) → ثبت در جداول اصلی."
      icon={Upload}
      phase="F"
    />
  )
}
