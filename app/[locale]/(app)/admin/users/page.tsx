import { Shield } from 'lucide-react'
import { ModulePlaceholder } from '@/components/layout/ModulePlaceholder'

export default async function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  return (
    <ModulePlaceholder
      locale={locale}
      titleEn="Users & Roles"
      titleDari="کاربران و نقش‌ها"
      descEn="Role-based access control admin — create custom roles, assign fine-grained permissions, set workshop/section/employee/pay-type scopes per user."
      descDari="مدیریت کنترل دسترسی — ایجاد نقش‌های سفارشی، تخصیص مجوزهای دقیق، تنظیم محدوده کارگاه/بخش/کارمند/نوع معاش برای هر کاربر."
      icon={Shield}
      phase="A"
    />
  )
}
