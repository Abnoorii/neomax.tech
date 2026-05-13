import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { getCurrentHijriDate, toGregorianDateString } from '@/lib/hijri'
import { SyncIndicator } from '@/components/layout/SyncIndicator'
import { ProductionDateShell } from './ProductionDateShell'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function ProductionPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { date: dateParam } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  const canEnter = can(permissions, 'production.enter')

  const hijriToday = getCurrentHijriDate()
  const defaultDate = toGregorianDateString(hijriToday.jy, hijriToday.jm, hijriToday.jd)
  const selectedDate = dateParam ?? defaultDate

  const { data: period } = await supabase
    .from('accounting_periods')
    .select('status')
    .lte('start_date', selectedDate)
    .gte('end_date', selectedDate)
    .single()

  const periodOpen = period?.status === 'open'

  const { data: employees } = await supabase
    .from('employees')
    .select('id, emp_code, name_dari, name_english')
    .eq('status', 'active')
    .order('name_dari')

  const { data: rateCards } = await supabase
    .from('rate_card')
    .select('work_code, description_en, description_dari, unit_price, unit_en, unit_dari')
    .lte('effective_from', selectedDate)
    .or(`effective_to.is.null,effective_to.gte.${selectedDate}`)
    .order('work_code')

  const employeeIds = (employees ?? []).map(e => e.id)
  const { data: rawEntries } = employeeIds.length > 0
    ? await supabase
        .from('production')
        .select('id, employee_id, date, work_code, quantity, unit_price, notes, entered_at')
        .in('employee_id', employeeIds)
        .eq('date', selectedDate)
        .order('entered_at', { ascending: false })
    : { data: [] }

  const empMap = Object.fromEntries((employees ?? []).map(e => [e.id, e]))
  const entries = (rawEntries ?? []).map(e => ({
    ...e,
    employee: empMap[e.employee_id] ?? null,
  }))

  const isRTL = locale !== 'en'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">
            {locale === 'en' ? 'Production' : 'تولید'}
          </h1>
          {!periodOpen && (
            <p className="text-sm text-muted-foreground">
              {locale === 'en' ? '🔒 Closed period — read only' : '🔒 دوره بسته — فقط خواندنی'}
            </p>
          )}
        </div>
        <SyncIndicator locale={locale} />
      </div>

      <ProductionDateShell
        locale={locale}
        selectedDate={selectedDate}
        defaultDate={defaultDate}
        employees={employees ?? []}
        rateCards={rateCards ?? []}
        entries={entries}
        canEnter={canEnter && periodOpen}
      />
    </div>
  )
}
