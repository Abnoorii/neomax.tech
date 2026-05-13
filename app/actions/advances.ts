'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

const LARGE_ADVANCE_THRESHOLD = 5000 // AFN — requires dual-approval above this

export async function disburseAdvance(params: {
  employeeId: string
  amount: number
  advanceType: 'cash' | 'kind' | 'deduction'
  description?: string | null
  date: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'advances.disburse')

  if (params.amount <= 0) throw new Error('INVALID_AMOUNT')

  // Large advances require approval workflow
  if (params.amount > LARGE_ADVANCE_THRESHOLD) {
    // Get employee info for payload
    const { data: emp } = await supabase
      .from('employees')
      .select('name, emp_code')
      .eq('id', params.employeeId)
      .single()

    const { error } = await supabase.from('approval_requests').insert({
      requested_by: user.id,
      action_type: 'advance_disburse',
      entity_type: 'advance',
      entity_id: params.employeeId,
      payload: {
        employee_id: params.employeeId,
        employee_name: emp?.name ?? '',
        emp_code: emp?.emp_code ?? '',
        amount: params.amount,
        advance_type: params.advanceType,
        description: params.description ?? null,
        date: params.date,
      },
    })
    if (error) throw new Error(error.message)
    revalidatePath('/[locale]/(app)/advances', 'page')
    return { success: true, requiresApproval: true }
  }

  // Small advance — direct insert
  const { error } = await supabase.from('advances').insert({
    employee_id: params.employeeId,
    amount: params.amount,
    advance_type: params.advanceType,
    description: params.description ?? null,
    date: params.date,
    entered_by: user.id,
    status: 'active',
  })
  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/(app)/advances', 'page')
  return { success: true, requiresApproval: false }
}

export async function repayAdvance(params: {
  advanceId: string
  amount: number
  date: string
  notes?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'advances.repay')

  if (params.amount <= 0) throw new Error('INVALID_AMOUNT')

  const { data: advance } = await supabase
    .from('advances')
    .select('id, amount, repaid_amount')
    .eq('id', params.advanceId)
    .single()

  if (!advance) throw new Error('ADVANCE_NOT_FOUND')

  const newRepaid = (advance.repaid_amount ?? 0) + params.amount
  const newStatus = newRepaid >= advance.amount ? 'repaid' : 'active'

  const { error } = await supabase
    .from('advances')
    .update({
      repaid_amount: newRepaid,
      status: newStatus,
      repaid_at: newStatus === 'repaid' ? new Date().toISOString() : null,
    })
    .eq('id', params.advanceId)

  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/(app)/advances', 'page')
  return { success: true }
}

export async function getEmployeeAdvanceSummary(employeeId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  const { data, error } = await supabase
    .from('advances')
    .select('*')
    .eq('employee_id', employeeId)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)

  const totalDisbursed = (data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0)
  const totalRepaid = (data ?? []).reduce((s, r) => s + (r.repaid_amount ?? 0), 0)
  const outstanding = totalDisbursed - totalRepaid

  return { entries: data ?? [], totalDisbursed, totalRepaid, outstanding }
}
