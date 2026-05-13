'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

async function getPeriodBounds(periodId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('accounting_periods')
    .select('id, workshop_id, start_date, end_date, hijri_year, hijri_month')
    .eq('id', periodId)
    .single()
  if (error || !data) throw new Error('PERIOD_NOT_FOUND')
  return data
}

// ── 1. PAYROLL SUMMARY ────────────────────────────────────────────────────

export async function getPayrollSummaryReport(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'reports.view')

  const period = await getPeriodBounds(periodId)

  const { data: run } = await supabase
    .from('payroll_runs')
    .select('id, status, total_gross, total_deductions, total_net')
    .eq('period_id', periodId)
    .single()

  if (!run) return { period, run: null, rows: [] }

  const { data: payslips } = await supabase
    .from('payslips')
    .select(`
      employee_id, days_present, days_absent,
      fixed_earnings, piece_rate_earnings, overtime, transport,
      food_deduction, tax, advance_recovery, net_pay,
      employee:employees(emp_code, name_dari, name_english, pay_type, section_id)
    `)
    .eq('payroll_run_id', run.id)

  return { period, run, rows: payslips ?? [] }
}

// ── 2. ATTENDANCE REPORT ──────────────────────────────────────────────────

export async function getAttendanceReport(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'reports.view')

  const period = await getPeriodBounds(periodId)

  const { data: employees } = await supabase
    .from('employees')
    .select('id, emp_code, name_dari, name_english, section_id')
    .eq('workshop_id', period.workshop_id)
    .eq('status', 'active')
    .order('name_dari')

  const empIds = (employees ?? []).map(e => e.id)

  const { data: attendance } = empIds.length > 0
    ? await supabase
        .from('attendance')
        .select('employee_id, status')
        .in('employee_id', empIds)
        .gte('date', period.start_date)
        .lte('date', period.end_date)
    : { data: [] }

  const rows = (employees ?? []).map(emp => {
    const att = (attendance ?? []).filter(a => a.employee_id === emp.id)
    return {
      ...emp,
      present: att.filter(a => a.status === 'present').length,
      absent: att.filter(a => a.status === 'absent').length,
      sick: att.filter(a => a.status === 'sick').length,
      holiday: att.filter(a => a.status === 'holiday').length,
      half_day: att.filter(a => a.status === 'half_day').length,
    }
  })

  return { period, rows }
}

// ── 3. PRODUCTION REPORT ──────────────────────────────────────────────────

export async function getProductionReport(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'reports.view')

  const period = await getPeriodBounds(periodId)

  const { data: employees } = await supabase
    .from('employees')
    .select('id, emp_code, name_dari')
    .eq('workshop_id', period.workshop_id)
    .eq('status', 'active')

  const empIds = (employees ?? []).map(e => e.id)
  const empMap = Object.fromEntries((employees ?? []).map(e => [e.id, e]))

  const { data: production } = empIds.length > 0
    ? await supabase
        .from('production')
        .select('employee_id, work_code, quantity, unit_price')
        .in('employee_id', empIds)
        .gte('date', period.start_date)
        .lte('date', period.end_date)
    : { data: [] }

  const { data: rateCards } = await supabase
    .from('rate_card')
    .select('work_code, description_dari, description_en')

  const rateDesc = Object.fromEntries(
    (rateCards ?? []).map(r => [r.work_code, r.description_dari ?? r.description_en ?? r.work_code])
  )

  // Group by employee → work_code
  const grouped: Record<string, Record<string, { qty: number; price: number; total: number; desc: string }>> = {}
  for (const p of production ?? []) {
    if (!grouped[p.employee_id]) grouped[p.employee_id] = {}
    const g = grouped[p.employee_id]!
    if (!g[p.work_code]) g[p.work_code] = { qty: 0, price: p.unit_price, total: 0, desc: rateDesc[p.work_code] ?? p.work_code }
    g[p.work_code]!.qty += p.quantity
    g[p.work_code]!.total += p.quantity * p.unit_price
  }

  const rows = Object.entries(grouped).map(([empId, lines]) => ({
    employee: empMap[empId] ?? { emp_code: '?', name_dari: empId },
    lines: Object.entries(lines).map(([code, v]) => ({ work_code: code, ...v })),
    totalAmount: Object.values(lines).reduce((s, l) => s + l.total, 0),
  })).sort((a, b) => a.employee.name_dari.localeCompare(b.employee.name_dari))

  return { period, rows }
}

// ── 4. ADVANCES REPORT ────────────────────────────────────────────────────

export async function getAdvancesReport(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'reports.view')

  const period = await getPeriodBounds(periodId)

  const { data: employees } = await supabase
    .from('employees')
    .select('id, emp_code, name_dari')
    .eq('workshop_id', period.workshop_id)
    .eq('status', 'active')
    .order('name_dari')

  const empIds = (employees ?? []).map(e => e.id)
  const empMap = Object.fromEntries((employees ?? []).map(e => [e.id, e]))

  // All active advances (not period-scoped — running balance)
  const { data: advances } = empIds.length > 0
    ? await supabase
        .from('advances')
        .select('employee_id, amount, repaid_amount, advance_type, date')
        .in('employee_id', empIds)
        .order('date')
    : { data: [] }

  // Payslip advance recovery this period
  const { data: run } = await supabase
    .from('payroll_runs')
    .select('id')
    .eq('period_id', periodId)
    .single()

  const recoveryMap: Record<string, number> = {}
  if (run) {
    const { data: slips } = await supabase
      .from('payslips')
      .select('employee_id, advance_opening_balance, advance_recovery, advance_closing_balance')
      .eq('payroll_run_id', run.id)
    for (const s of slips ?? []) {
      recoveryMap[s.employee_id] = s.advance_recovery ?? 0
    }
  }

  const rows = (employees ?? []).map(emp => {
    const empAdv = (advances ?? []).filter(a => a.employee_id === emp.id)
    const opening = empAdv.reduce((s, a) => s + (a.amount ?? 0) - (a.repaid_amount ?? 0), 0)
    const disbursed = empAdv
      .filter(a => a.date >= period.start_date && a.date <= period.end_date)
      .reduce((s, a) => s + (a.amount ?? 0), 0)
    const recovered = recoveryMap[emp.id] ?? 0
    return {
      ...empMap[emp.id]!,
      openingBalance: opening,
      disbursed,
      recovered,
      closingBalance: opening + disbursed - recovered,
    }
  }).filter(r => r.openingBalance !== 0 || r.disbursed !== 0)

  return { period, rows }
}

// ── 5. LABOR COST REPORT ──────────────────────────────────────────────────

export async function getLaborCostReport(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'reports.view')

  const period = await getPeriodBounds(periodId)

  const { data: sections } = await supabase
    .from('sections')
    .select('id, code, name_dari, name_en')
    .eq('workshop_id', period.workshop_id)

  const { data: run } = await supabase
    .from('payroll_runs')
    .select('id')
    .eq('period_id', periodId)
    .single()

  if (!run) return { period, rows: [], totals: { gross: 0, deductions: 0, net: 0 } }

  const { data: payslips } = await supabase
    .from('payslips')
    .select(`
      fixed_earnings, piece_rate_earnings, overtime, transport,
      food_deduction, tax, advance_recovery, net_pay,
      employee:employees(section_id)
    `)
    .eq('payroll_run_id', run.id)

  const sectionMap = Object.fromEntries((sections ?? []).map(s => [s.id, s]))
  const bySec: Record<string, { gross: number; deductions: number; net: number; headcount: number }> = {}

  for (const s of payslips ?? []) {
    const secId = (s.employee as unknown as { section_id: string | null } | null)?.section_id ?? '__none__'
    if (!bySec[secId]) bySec[secId] = { gross: 0, deductions: 0, net: 0, headcount: 0 }
    const gross = (s.fixed_earnings ?? 0) + (s.piece_rate_earnings ?? 0) + (s.overtime ?? 0) + (s.transport ?? 0)
    const ded = (s.food_deduction ?? 0) + (s.tax ?? 0) + (s.advance_recovery ?? 0)
    bySec[secId]!.gross += gross
    bySec[secId]!.deductions += ded
    bySec[secId]!.net += s.net_pay ?? 0
    bySec[secId]!.headcount++
  }

  const rows = Object.entries(bySec).map(([secId, v]) => ({
    section: sectionMap[secId] ?? { code: '—', name_dari: 'سایر', name_en: 'Other' },
    ...v,
  })).sort((a, b) => a.section.code.localeCompare(b.section.code))

  const totals = rows.reduce((s, r) => ({
    gross: s.gross + r.gross,
    deductions: s.deductions + r.deductions,
    net: s.net + r.net,
  }), { gross: 0, deductions: 0, net: 0 })

  return { period, rows, totals }
}

// ── 6. TAX REPORT ────────────────────────────────────────────────────────

export async function getTaxReport(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'reports.view')

  const period = await getPeriodBounds(periodId)

  const { data: run } = await supabase
    .from('payroll_runs')
    .select('id')
    .eq('period_id', periodId)
    .single()

  if (!run) return { period, rows: [], totalTax: 0 }

  const { data: payslips } = await supabase
    .from('payslips')
    .select(`
      fixed_earnings, piece_rate_earnings, overtime, transport, tax,
      employee:employees(emp_code, name_dari, name_english)
    `)
    .eq('payroll_run_id', run.id)
    .gt('tax', 0)

  const rows = (payslips ?? []).map(s => {
    const gross = (s.fixed_earnings ?? 0) + (s.piece_rate_earnings ?? 0) + (s.overtime ?? 0) + (s.transport ?? 0)
    return {
      employee: s.employee as unknown as { emp_code: string; name_dari: string; name_english: string | null } | null,
      taxableGross: gross,
      tax: s.tax ?? 0,
    }
  })

  const totalTax = rows.reduce((s, r) => s + r.tax, 0)
  return { period, rows, totalTax }
}

// ── 7. DISBURSEMENT LIST ─────────────────────────────────────────────────

export async function getDisbursementList(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'reports.view')

  const period = await getPeriodBounds(periodId)

  const { data: run } = await supabase
    .from('payroll_runs')
    .select('id, status')
    .eq('period_id', periodId)
    .single()

  if (!run) return { period, run: null, rows: [] }

  const { data: payslips } = await supabase
    .from('payslips')
    .select(`
      net_pay,
      employee:employees(emp_code, name_dari, name_english, bank_account, hawala_provider, phone)
    `)
    .eq('payroll_run_id', run.id)
    .order('employee(name_dari)')

  const rows = (payslips ?? []).map(s => ({
    employee: s.employee as unknown as {
      emp_code: string; name_dari: string; name_english: string | null
      bank_account: string | null; hawala_provider: string | null; phone: string | null
    } | null,
    netPay: s.net_pay ?? 0,
  }))

  return { period, run, rows }
}

// ── 8. ANNUAL REPORT ──────────────────────────────────────────────────────

export async function getAnnualReport(hijriYear: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'reports.view')

  const { data: periods } = await supabase
    .from('accounting_periods')
    .select('id, hijri_month, start_date, end_date, status')
    .eq('hijri_year', hijriYear)
    .order('hijri_month')

  const periodIds = (periods ?? []).map(p => p.id)

  const { data: runs } = periodIds.length > 0
    ? await supabase
        .from('payroll_runs')
        .select('period_id, total_gross, total_net, status')
        .in('period_id', periodIds)
    : { data: [] }

  const runMap = Object.fromEntries((runs ?? []).map(r => [r.period_id, r]))

  const months = (periods ?? []).map(p => ({
    month: p.hijri_month,
    periodId: p.id,
    status: p.status,
    gross: runMap[p.id]?.total_gross ?? 0,
    net: runMap[p.id]?.total_net ?? 0,
    runStatus: runMap[p.id]?.status ?? null,
  }))

  const totalGross = months.reduce((s, m) => s + m.gross, 0)
  const totalNet = months.reduce((s, m) => s + m.net, 0)

  return { hijriYear, months, totalGross, totalNet }
}
