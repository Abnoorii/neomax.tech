import { CreditCard } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function PayrollPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Payroll"
      titleDari="معاش"
      descEn="Monthly payroll engine — computes fixed, daily, piece-rate, and mixed earnings. AI anomaly review before approval. Dual approval workflow. Bilingual payslip PDFs."
      descDari="موتور محاسبه معاش — معاش ثابت، روزانه، کاری و مختلط. بررسی ناهنجاری‌ها توسط هوش مصنوعی. جریان تأیید دوگانه. فیش معاش دوزبانه."
      icon={CreditCard}
      phase="D"
    />
  )
}
