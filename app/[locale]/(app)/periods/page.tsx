import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { PeriodCard } from '@/components/periods/PeriodCard'
import { OpenPeriodButton } from '@/components/periods/OpenPeriodButton'

interface PageProps {
  params: Promise<{ locale: string }>
}

export default async function PeriodsPage({ params }: PageProps) {
  const { locale } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  const canClose = can(permissions, 'periods.close')
  const canOpen = can(permissions, 'periods.open')
  const canRequestReopen = can(permissions, 'periods.request_reopen')

  if (!canClose && !canOpen && !canRequestReopen) redirect(`/${locale}/dashboard`)

  // Fetch workshop
  const { data: workshop } = await supabase
    .from('workshops')
    .select('id, name')
    .order('created_at')
    .limit(1)
    .single()

  // Fetch all periods most-recent-first
  const { data: periods } = await supabase
    .from('accounting_periods')
    .select('id, hijri_year, hijri_month, status, start_date, end_date, closed_at')
    .order('hijri_year', { ascending: false })
    .order('hijri_month', { ascending: false })

  const hasOpenPeriod = (periods ?? []).some(p => p.status === 'open')
  const isRTL = locale !== 'en'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">
            {locale === 'en' ? 'Accounting Periods' : 'دوره‌های حسابداری'}
          </h1>
          {workshop && (
            <p className="text-sm text-muted-foreground">{workshop.name}</p>
          )}
        </div>

        {canOpen && !hasOpenPeriod && workshop && (
          <OpenPeriodButton workshopId={workshop.id} locale={locale} />
        )}
      </div>

      {(periods ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          {locale === 'en' ? 'No accounting periods yet.' : 'هنوز دوره‌ای ایجاد نشده.'}
        </p>
      )}

      <div className="space-y-2">
        {(periods ?? []).map(period => (
          <PeriodCard
            key={period.id}
            period={period}
            locale={locale}
            canClose={canClose}
            canRequestReopen={canRequestReopen}
          />
        ))}
      </div>
    </div>
  )
}
