import { ScrollText } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function AuditPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Audit Log"
      titleDari="سابقه تغییرات"
      descEn="Full system audit trail — every mutation on key tables logged with who, when, before, and after. 7-year retention. Filter by table, user, or date range."
      descDari="سابقه کامل تغییرات سیستم — هر تغییر در جداول اصلی با نام کاربر، زمان، قبل و بعد ثبت می‌شود. نگهداری ۷ ساله."
      icon={ScrollText}
      phase="G"
    />
  )
}
