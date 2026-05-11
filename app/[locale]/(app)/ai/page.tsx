import { Bot } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function AIPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="AI Assistant"
      titleDari="دستیار هوش مصنوعی"
      descEn="Natural-language labor cost queries, voice production entry (Dari/Pashto via Whisper), payroll anomaly review, and OCR for legacy paper records."
      descDari="پرسش‌های طبیعی درباره هزینه کار، ورود صوتی تولید (دری/پشتو)، بررسی ناهنجاری‌های معاش، و OCR برای اسناد کاغذی قدیمی."
      icon={Bot}
      phase="E"
    />
  )
}
