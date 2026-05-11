import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions } from '@/lib/permissions'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { PeriodBanner } from '@/components/layout/PeriodBanner'
import type { AccountingPeriod } from '@/types/database'

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const [permissions, profileResult, periodResult, approvalResult] = await Promise.all([
    getUserPermissions(user.id),
    supabase.from('profiles').select('full_name, full_name_dari, language').eq('id', user.id).single(),
    supabase
      .from('accounting_periods')
      .select('*')
      .eq('status', 'open')
      .order('hijri_year', { ascending: false })
      .order('hijri_month', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('approval_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ])

  const profile = profileResult.data
  const currentPeriod = periodResult.data as AccountingPeriod | null
  const pendingApprovals = approvalResult.count ?? 0

  const displayName = locale === 'en'
    ? profile?.full_name
    : profile?.full_name_dari || profile?.full_name

  const isRTL = locale !== 'en'

  return (
    <div
      className={`flex min-h-screen bg-slate-50 ${isRTL ? 'font-[Vazirmatn]' : 'font-sans'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Sidebar
        locale={locale}
        permissions={permissions}
        pendingApprovals={pendingApprovals}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          locale={locale}
          userEmail={user.email}
          userName={displayName ?? undefined}
        />
        <PeriodBanner period={currentPeriod} locale={locale} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
