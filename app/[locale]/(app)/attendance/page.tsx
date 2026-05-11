import { CalendarCheck } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function AttendancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Attendance"
      titleDari="حضور و غیاب"
      descEn="Daily attendance entry with one-tap status buttons (Present/Absent/Sick/Holiday). Includes edit history timeline, offline mode, and tiered edit permissions."
      descDari="ثبت حضور روزانه با دکمه‌های تک‌ضربه‌ای. شامل تاریخچه تغییرات، حالت آفلاین و مجوزهای ویرایش مرحله‌ای."
      icon={CalendarCheck}
      phase="C"
    />
  )
}
