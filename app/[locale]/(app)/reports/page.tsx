import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { hijriMonthName, getCurrentHijriDate } from '@/lib/hijri'
import { ReportsHub } from '@/components/reports/ReportsHub'
import { AnnualChart } from '@/components/reports/AnnualChart'
import { getAnnualReport } from '@/app/actions/reports'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ period?: string; tab?: string }>
}

export default async function ReportsPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { period: periodParam, tab = 'monthly' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  if (!can(permissions, 'reports.view')) redirect(`/${locale}/dashboard`)

  // Fetch periods for selector
  const { data: periods } = await supabase
    .from('accounting_periods')
    .select('id, hijri_year, hijri_month, status')
    .order('hijri_year', { ascending: false })
    .order('hijri_month', { ascending: false })

  const openPeriod = (periods ?? []).find(p => p.status === 'open')
  const selectedPeriodId = periodParam ?? openPeriod?.id ?? (periods?.[0]?.id ?? null)
  const selectedPeriod = (periods ?? []).find(p => p.id === selectedPeriodId)

  // Check if payroll run exists for selected period
  const { data: run } = selectedPeriodId
    ? await supabase.from('payroll_runs').select('id, status').eq('period_id', selectedPeriodId).single()
    : { data: null }

  // Annual report data
  const hijriYear = selectedPeriod?.hijri_year ?? getCurrentHijriDate().jy
  const annualData = await getAnnualReport(hijriYear).catch(() => null)

  const isRTL = locale !== 'en'
  const localeKey = locale as 'en' | 'dari' | 'pashto'

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">{locale === 'en' ? 'Reports' : 'گزارش‌ها'}</h1>
          {selectedPeriod && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {hijriMonthName(selectedPeriod.hijri_month, localeKey)} {selectedPeriod.hijri_year}
            </p>
          )}
        </div>

        {/* Period selector */}
        {(periods ?? []).length > 0 && (
          <form method="GET" className="flex items-center gap-2">
            <input type="hidden" name="tab" value={tab} />
            <select
              name="period"
              defaultValue={selectedPeriodId ?? ''}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {(periods ?? []).map(p => (
                <option key={p.id} value={p.id}>
                  {hijriMonthName(p.hijri_month, localeKey)} {p.hijri_year}
                  {p.status === 'open' ? (locale === 'en' ? ' (Open)' : ' (باز)') : ''}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-9 px-3 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors"
            >
              {locale === 'en' ? 'Go' : 'برو'}
            </button>
          </form>
        )}
      </div>

      <Tabs defaultValue={tab}>
        <TabsList>
          <TabsTrigger value="monthly">{locale === 'en' ? 'Monthly Reports' : 'گزارش‌های ماهانه'}</TabsTrigger>
          <TabsTrigger value="annual">{locale === 'en' ? 'Annual Report' : 'گزارش سالانه'}</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-4">
          {selectedPeriodId ? (
            <ReportsHub
              periodId={selectedPeriodId}
              hasPayrollRun={!!run}
              locale={locale}
            />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {locale === 'en' ? 'Select a period to view reports.' : 'یک دوره انتخاب کنید.'}
            </p>
          )}
        </TabsContent>

        <TabsContent value="annual" className="mt-4">
          {annualData ? (
            <AnnualChart
              months={annualData.months}
              hijriYear={annualData.hijriYear}
              totalGross={annualData.totalGross}
              totalNet={annualData.totalNet}
              locale={locale}
            />
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {locale === 'en' ? 'No annual data available.' : 'داده سالانه‌ای موجود نیست.'}
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
