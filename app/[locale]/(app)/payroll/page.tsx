import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { hijriMonthName } from '@/lib/hijri'
import { PayrollActions } from '@/components/payroll/PayrollActions'
import { PayrollRunTable } from '@/components/payroll/PayrollRunTable'
import type { PayrollStatus } from '@/types/database'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ period?: string }>
}

export default async function PayrollPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { period: periodParam } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  const canPrepare = can(permissions, 'payroll.prepare')
  const canApprove = can(permissions, 'payroll.approve')
  const canMarkPaid = can(permissions, 'payroll.mark_paid')

  if (!canPrepare && !canApprove && !canMarkPaid) redirect(`/${locale}/dashboard`)

  const { data: periods } = await supabase
    .from('accounting_periods')
    .select('id, hijri_year, hijri_month, status, start_date, end_date')
    .order('hijri_year', { ascending: false })
    .order('hijri_month', { ascending: false })

  const openPeriod = (periods ?? []).find(p => p.status === 'open')
  const selectedPeriodId = periodParam ?? openPeriod?.id ?? (periods?.[0]?.id ?? null)
  const selectedPeriod = (periods ?? []).find(p => p.id === selectedPeriodId)

  type RunRow = {
    id: string; status: string; total_gross: number | null
    total_deductions: number | null; total_net: number | null
  }
  let run: RunRow | null = null
  let payslips: Parameters<typeof PayrollRunTable>[0]['payslips'] = []

  if (selectedPeriodId) {
    const { data: existingRun } = await supabase
      .from('payroll_runs')
      .select('id, status, total_gross, total_deductions, total_net')
      .eq('period_id', selectedPeriodId)
      .single()

    run = existingRun as RunRow | null

    if (run) {
      const { data: slips } = await supabase
        .from('payslips')
        .select(`
          id, employee_id,
          days_present, days_absent, days_holiday, days_sick,
          fixed_earnings, piece_rate_earnings, piece_rate_lines,
          overtime, transport, food_deduction, tax,
          advance_recovery, advance_opening_balance, advance_closing_balance, net_pay,
          employee:employees(id, emp_code, name_dari, name_english)
        `)
        .eq('payroll_run_id', run.id)

      payslips = (slips ?? []) as unknown as typeof payslips
    }
  }

  const isRTL = locale !== 'en'
  const localeKey = locale as 'en' | 'dari' | 'pashto'
  const monthLabel = selectedPeriod
    ? `${hijriMonthName(selectedPeriod.hijri_month, localeKey)} ${selectedPeriod.hijri_year}`
    : ''

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">{locale === 'en' ? 'Payroll' : 'معاش'}</h1>
          {monthLabel && <p className="text-sm text-muted-foreground mt-0.5">{monthLabel}</p>}
        </div>

        {/* Period selector — form GET for progressive enhancement */}
        {(periods ?? []).length > 0 && (
          <form method="GET" className="flex items-center gap-2">
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

      {!selectedPeriod && (
        <p className="text-sm text-muted-foreground">
          {locale === 'en' ? 'No accounting periods found.' : 'دوره‌ای یافت نشد.'}
        </p>
      )}

      {selectedPeriod && (
        <>
          <PayrollActions
            periodId={selectedPeriod.id}
            runId={run?.id ?? null}
            runStatus={(run?.status as PayrollStatus | null) ?? null}
            totalGross={run?.total_gross ?? 0}
            totalNet={run?.total_net ?? 0}
            locale={locale}
            canPrepare={canPrepare}
            canApprove={canApprove}
            canMarkPaid={canMarkPaid}
          />

          <PayrollRunTable
            payslips={payslips}
            locale={locale}
            totalGross={run?.total_gross ?? 0}
            totalDeductions={run?.total_deductions ?? 0}
            totalNet={run?.total_net ?? 0}
          />
        </>
      )}
    </div>
  )
}
