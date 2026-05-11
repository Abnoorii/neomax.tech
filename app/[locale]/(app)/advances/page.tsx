import { Wallet } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function AdvancesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Advances Ledger"
      titleDari="دفتر پیشپرداخت‌ها"
      descEn="Transactional advance ledger — every disbursement as its own record, running balance per employee, dual approval for amounts over 10,000 AFN."
      descDari="دفتر پیشپرداخت‌ها — هر پرداخت به عنوان یک رکورد جداگانه، موجودی جاری هر کارمند، تأیید دوگانه برای مبالغ بالای ۱۰,۰۰۰ افغانی."
      icon={Wallet}
      phase="C"
    />
  )
}
