'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import {
  calculatePayslip,
  sumPayslips,
  type EmployeePayInput,
  type AttendanceSummary,
  type ProductionLine,
} from '@/lib/payroll/calculate'

// ── PREPARE PAYROLL RUN ────────────────────────────────────────────────────
// Fetches all data for the period, calculates every payslip, writes to DB
// as a draft run. Idempotent — re-running replaces draft payslips.

export async function preparePayrollRun(periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'payroll.prepare')

  // 1. Fetch period
  const { data: period, error: pErr } = await supabase
    .from('accounting_periods')
    .select('id, workshop_id, start_date, end_date, status, hijri_year, hijri_month')
    .eq('id', periodId)
    .single()
  if (pErr || !period) throw new Error('PERIOD_NOT_FOUND')

  // 2. Fetch all active employees in workshop
  const { data: employees } = await supabase
    .from('employees')
    .select('id, pay_type, base_salary, daily_rate, transport_rate, food_deduction_daily')
    .eq('workshop_id', period.workshop_id)
    .eq('status', 'active')

  if (!employees || employees.length === 0) throw new Error('NO_EMPLOYEES')

  const empIds = employees.map(e => e.id)

  // 3. Fetch attendance for period
  const { data: attendance } = await supabase
    .from('attendance')
    .select('employee_id, date, status, hours, overtime_hours')
    .in('employee_id', empIds)
    .gte('date', period.start_date)
    .lte('date', period.end_date)

  // 4. Fetch production for period
  const { data: production } = await supabase
    .from('production')
    .select('employee_id, work_code, quantity, unit_price')
    .in('employee_id', empIds)
    .gte('date', period.start_date)
    .lte('date', period.end_date)

  // 5. Fetch rate card descriptions
  const { data: rateCards } = await supabase
    .from('rate_card')
    .select('work_code, description_dari, description_en')

  const rateDesc = Object.fromEntries(
    (rateCards ?? []).map(r => [r.work_code, r.description_dari ?? r.description_en ?? r.work_code])
  )

  // 6. Fetch outstanding advance balances per employee
  const { data: advances } = await supabase
    .from('advances')
    .select('employee_id, amount, repaid_amount, status')
    .in('employee_id', empIds)
    .eq('status', 'active')

  const advanceBalances: Record<string, number> = {}
  for (const a of advances ?? []) {
    const outstanding = (a.amount ?? 0) - (a.repaid_amount ?? 0)
    advanceBalances[a.employee_id] = (advanceBalances[a.employee_id] ?? 0) + outstanding
  }

  // 7. Compute working days in period (Mon–Thu + Sat, i.e., exclude Fri)
  let workingDaysInPeriod = 0
  const start = new Date(period.start_date)
  const end = new Date(period.end_date)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    if (d.getDay() !== 5) workingDaysInPeriod++ // 5 = Friday
  }

  // 8. Build per-employee summaries
  const attByEmp: Record<string, typeof attendance> = {}
  for (const a of attendance ?? []) {
    if (!attByEmp[a.employee_id]) attByEmp[a.employee_id] = []
    attByEmp[a.employee_id]!.push(a)
  }

  const prodByEmp: Record<string, typeof production> = {}
  for (const p of production ?? []) {
    if (!prodByEmp[p.employee_id]) prodByEmp[p.employee_id] = []
    prodByEmp[p.employee_id]!.push(p)
  }

  // 9. Calculate payslips
  const payslipCalcs = employees.map(emp => {
    const empAtt = attByEmp[emp.id] ?? []
    const summary: AttendanceSummary = {
      daysPresent: empAtt.filter(a => a.status === 'present').length,
      daysAbsent: empAtt.filter(a => a.status === 'absent').length,
      daysHoliday: empAtt.filter(a => a.status === 'holiday').length,
      daysSick: empAtt.filter(a => a.status === 'sick').length,
      totalOvertimeHours: empAtt.reduce((s, a) => s + (a.overtime_hours ?? 0), 0),
      workingDaysInPeriod,
    }
    const prodLines = Object.values(
      (prodByEmp[emp.id] ?? []).reduce((acc, p) => {
        const key = p.work_code
        if (!acc[key]) acc[key] = { workCode: p.work_code, description: rateDesc[p.work_code] ?? p.work_code, quantity: 0, unitPrice: p.unit_price }
        acc[key].quantity += p.quantity
        return acc
      }, {} as Record<string, ProductionLine>)
    )

    const input: EmployeePayInput = {
      id: emp.id,
      payType: emp.pay_type,
      baseSalary: emp.base_salary,
      dailyRate: emp.daily_rate,
      transportRate: emp.transport_rate,
      foodDeductionDaily: emp.food_deduction_daily,
      advanceBalance: advanceBalances[emp.id] ?? 0,
      attendance: summary,
      productionLines: prodLines,
    }
    return calculatePayslip(input)
  })

  const totals = sumPayslips(payslipCalcs)

  // 10. Upsert payroll_run (one per period)
  const { data: existingRun } = await supabase
    .from('payroll_runs')
    .select('id, status')
    .eq('period_id', periodId)
    .single()

  if (existingRun && existingRun.status !== 'draft') {
    throw new Error('PAYROLL_ALREADY_SUBMITTED')
  }

  let runId: string
  if (existingRun) {
    runId = existingRun.id
    const { error } = await supabase
      .from('payroll_runs')
      .update({
        total_gross: totals.totalGross,
        total_deductions: totals.totalDeductions,
        total_net: totals.totalNet,
        prepared_by: user.id,
      })
      .eq('id', runId)
    if (error) throw new Error(error.message)
  } else {
    const { data: newRun, error } = await supabase
      .from('payroll_runs')
      .insert({
        workshop_id: period.workshop_id,
        period_id: periodId,
        status: 'draft',
        prepared_by: user.id,
        total_gross: totals.totalGross,
        total_deductions: totals.totalDeductions,
        total_net: totals.totalNet,
      })
      .select('id')
      .single()
    if (error || !newRun) throw new Error(error?.message ?? 'INSERT_FAILED')
    runId = newRun.id
  }

  // 11. Delete existing draft payslips and re-insert
  await supabase.from('payslips').delete().eq('payroll_run_id', runId)

  const payslipRows = payslipCalcs.map(p => ({
    payroll_run_id: runId,
    employee_id: p.employeeId,
    days_present: p.daysPresent,
    days_absent: p.daysAbsent,
    days_holiday: p.daysHoliday,
    days_sick: p.daysSick,
    fixed_earnings: p.fixedEarnings,
    piece_rate_earnings: p.pieceRateEarnings,
    piece_rate_lines: p.pieceRateLines,
    overtime: p.overtime,
    transport: p.transport,
    food_deduction: p.foodDeduction,
    tax: p.tax,
    advance_recovery: p.advanceRecovery,
    advance_opening_balance: p.advanceOpeningBalance,
    advance_closing_balance: p.advanceClosingBalance,
  }))

  const { error: insErr } = await supabase.from('payslips').insert(payslipRows)
  if (insErr) throw new Error(insErr.message)

  revalidatePath('/[locale]/(app)/payroll', 'page')
  return { success: true, runId, ...totals, headcount: payslipCalcs.length }
}

// ── SUBMIT FOR APPROVAL ────────────────────────────────────────────────────

export async function submitPayrollForApproval(runId: string, notes?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'payroll.prepare')

  const { data: run } = await supabase
    .from('payroll_runs')
    .select('id, status, period_id, total_gross, total_net, workshop_id')
    .eq('id', runId)
    .single()

  if (!run) throw new Error('RUN_NOT_FOUND')
  if (run.status !== 'draft') throw new Error('NOT_A_DRAFT')

  // Create approval request
  const { error: apErr } = await supabase.from('approval_requests').insert({
    requested_by: user.id,
    action_type: 'payroll_run_approval',
    entity_type: 'payroll_run',
    entity_id: runId,
    payload: {
      run_id: runId,
      period_id: run.period_id,
      total_gross: run.total_gross,
      total_net: run.total_net,
      notes: notes ?? null,
    },
  })
  if (apErr) throw new Error(apErr.message)

  // Move run to pending_approval
  const { error } = await supabase
    .from('payroll_runs')
    .update({ status: 'pending_approval' })
    .eq('id', runId)
  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/(app)/payroll', 'page')
  return { success: true }
}

// ── MARK AS PAID ───────────────────────────────────────────────────────────

export async function markPayrollPaid(runId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'payroll.mark_paid')

  const { error } = await supabase
    .from('payroll_runs')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', runId)
    .eq('status', 'approved')

  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/(app)/payroll', 'page')
  return { success: true }
}

// ── FETCH PAYROLL DETAILS ──────────────────────────────────────────────────

export async function getPayrollRunDetails(runId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  const { data: run } = await supabase
    .from('payroll_runs')
    .select('*, period:accounting_periods(*)')
    .eq('id', runId)
    .single()

  if (!run) throw new Error('NOT_FOUND')

  const { data: payslips } = await supabase
    .from('payslips')
    .select('*, employee:employees(id, emp_code, name_dari, name_english, job_id)')
    .eq('payroll_run_id', runId)
    .order('employee(name_dari)')

  return { run, payslips: payslips ?? [] }
}
