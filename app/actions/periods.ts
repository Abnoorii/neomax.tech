'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { toGregorianDateString } from '@/lib/hijri'
import jalaali from 'jalaali-js'

// ── PRE-CLOSE CHECKLIST ───────────────────────────────────────────────────
// Returns a checklist of items that must be resolved before closing a period.

export async function getPeriodCloseChecklist(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  const { data: period } = await supabase
    .from('accounting_periods')
    .select('id, workshop_id, start_date, end_date, hijri_year, hijri_month')
    .eq('id', periodId)
    .single()
  if (!period) throw new Error('PERIOD_NOT_FOUND')

  const [
    { count: pendingApprovals },
    { data: payrollRun },
    { count: failedSyncs },
  ] = await Promise.all([
    supabase
      .from('approval_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('payroll_runs')
      .select('id, status')
      .eq('period_id', periodId)
      .single(),
    // Check for any failed offline syncs (production/attendance) in period
    supabase
      .from('attendance')
      .select('id', { count: 'exact', head: true })
      .eq('notes', 'sync_failed')  // placeholder — real check would be in offline queue
      .gte('date', period.start_date)
      .lte('date', period.end_date),
  ])

  const checks = [
    {
      key: 'payroll_prepared',
      labelEn: 'Payroll run prepared',
      labelDari: 'معاش محاسبه شده',
      passed: !!payrollRun,
    },
    {
      key: 'payroll_approved',
      labelEn: 'Payroll approved',
      labelDari: 'معاش تأیید شده',
      passed: payrollRun?.status === 'approved' || payrollRun?.status === 'paid',
    },
    {
      key: 'no_pending_approvals',
      labelEn: 'No pending approvals',
      labelDari: 'هیچ درخواست تأیید معلقی وجود ندارد',
      passed: (pendingApprovals ?? 0) === 0,
    },
  ]

  const allPassed = checks.every(c => c.passed)
  return { period, checks, allPassed }
}

// ── CLOSE PERIOD ──────────────────────────────────────────────────────────

export async function closePeriod(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'periods.close')

  const { allPassed } = await getPeriodCloseChecklist(periodId)
  if (!allPassed) throw new Error('CHECKLIST_INCOMPLETE')

  const { error } = await supabase
    .from('accounting_periods')
    .update({ status: 'closed', closed_by: user.id, closed_at: new Date().toISOString() })
    .eq('id', periodId)
    .eq('status', 'open')

  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/(app)/periods', 'page')
  revalidatePath('/[locale]/(app)/layout', 'layout')
  return { success: true }
}

// ── OPEN NEW PERIOD ───────────────────────────────────────────────────────

export async function openNextPeriod(workshopId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'periods.open')

  // Ensure no open period already exists
  const { data: existing } = await supabase
    .from('accounting_periods')
    .select('id')
    .eq('workshop_id', workshopId)
    .eq('status', 'open')
    .single()

  if (existing) throw new Error('PERIOD_ALREADY_OPEN')

  // Find last period to determine next
  const { data: last } = await supabase
    .from('accounting_periods')
    .select('hijri_year, hijri_month')
    .eq('workshop_id', workshopId)
    .order('hijri_year', { ascending: false })
    .order('hijri_month', { ascending: false })
    .limit(1)
    .single()

  let nextYear: number, nextMonth: number
  if (last) {
    if (last.hijri_month === 12) {
      nextYear = last.hijri_year + 1
      nextMonth = 1
    } else {
      nextYear = last.hijri_year
      nextMonth = last.hijri_month + 1
    }
  } else {
    // Default: current Hijri month
    const now = jalaali.toJalaali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
    nextYear = now.jy
    nextMonth = now.jm
  }

  // Compute Gregorian start/end for the Hijri month
  const { gy: sy, gm: sm, gd: sd } = jalaali.toGregorian(nextYear, nextMonth, 1)
  const daysInMonth = jalaali.jalaaliMonthLength(nextYear, nextMonth)
  const { gy: ey, gm: em, gd: ed } = jalaali.toGregorian(nextYear, nextMonth, daysInMonth)

  const pad = (n: number) => String(n).padStart(2, '0')
  const startDate = `${sy}-${pad(sm)}-${pad(sd)}`
  const endDate = `${ey}-${pad(em)}-${pad(ed)}`

  const { error } = await supabase.from('accounting_periods').insert({
    workshop_id: workshopId,
    hijri_year: nextYear,
    hijri_month: nextMonth,
    start_date: startDate,
    end_date: endDate,
    status: 'open',
  })

  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/(app)/periods', 'page')
  revalidatePath('/[locale]/(app)/layout', 'layout')
  return { success: true }
}

// ── REQUEST REOPEN ────────────────────────────────────────────────────────

export async function requestReopenPeriod(periodId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'periods.request_reopen')

  if (!reason || reason.trim().length < 10) throw new Error('REASON_REQUIRED')

  const { data: period } = await supabase
    .from('accounting_periods')
    .select('id, hijri_year, hijri_month')
    .eq('id', periodId)
    .single()
  if (!period) throw new Error('PERIOD_NOT_FOUND')

  const { error } = await supabase.from('approval_requests').insert({
    requested_by: user.id,
    action_type: 'reopen_closed_month',
    entity_type: 'accounting_period',
    entity_id: periodId,
    payload: {
      period_id: periodId,
      hijri_year: period.hijri_year,
      hijri_month: period.hijri_month,
      reason: reason.trim(),
    },
  })

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/periods', 'page')
  return { success: true }
}
