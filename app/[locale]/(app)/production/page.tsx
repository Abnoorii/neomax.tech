import { Factory } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function ProductionPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Production"
      titleDari="تولید"
      descEn="Piece-rate production entry with work code autocomplete, unit price snapshot, voice entry (AI), and full edit history with reason requirements."
      descDari="ثبت تولید کاری با تکمیل خودکار کد کار، ثبت نرخ، ورود صوتی (هوش مصنوعی) و تاریخچه کامل تغییرات."
      icon={Factory}
      phase="C"
    />
  )
}
