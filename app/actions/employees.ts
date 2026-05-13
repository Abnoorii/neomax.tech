'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission, verifyApproval } from '@/lib/permissions'
import type { PayType, EmpStatus } from '@/types/database'

export async function createEmployee(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'employees.create')

  const { error } = await supabase.from('employees').insert({
    emp_code: formData.get('emp_code') as string,
    name_dari: formData.get('name_dari') as string,
    name_english: (formData.get('name_english') as string) || null,
    father_name: formData.get('father_name') as string,
    national_id: (formData.get('national_id') as string) || null,
    phone: (formData.get('phone') as string) || null,
    workshop_id: formData.get('workshop_id') as string,
    section_id: (formData.get('section_id') as string) || null,
    job_id: formData.get('job_id') as string,
    status: 'active' as EmpStatus,
    pay_type: formData.get('pay_type') as PayType,
    base_salary: Number(formData.get('base_salary') ?? 0),
    daily_rate: Number(formData.get('daily_rate') ?? 0),
    transport_rate: Number(formData.get('transport_rate') ?? 0),
    food_deduction_daily: Number(formData.get('food_deduction_daily') ?? 0),
    hire_date: (formData.get('hire_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/employees', 'page')
  return { success: true }
}

export async function updateEmployee(employeeId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'employees.edit')

  const { error } = await supabase.from('employees').update({
    name_dari: formData.get('name_dari') as string,
    name_english: (formData.get('name_english') as string) || null,
    father_name: formData.get('father_name') as string,
    national_id: (formData.get('national_id') as string) || null,
    phone: (formData.get('phone') as string) || null,
    section_id: (formData.get('section_id') as string) || null,
    job_id: formData.get('job_id') as string,
    transport_rate: Number(formData.get('transport_rate') ?? 0),
    food_deduction_daily: Number(formData.get('food_deduction_daily') ?? 0),
    hire_date: (formData.get('hire_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
  }).eq('id', employeeId)

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/employees', 'page')
  return { success: true }
}

// Salary changes require dual approval — create approval request instead of direct update
export async function requestSalaryChange(
  employeeId: string,
  newBaseSalary: number,
  newDailyRate: number,
  reason: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'employees.change_salary')

  // Get current values for before/after payload
  const { data: emp } = await supabase
    .from('employees')
    .select('base_salary, daily_rate, name_dari, emp_code')
    .eq('id', employeeId)
    .single()

  const { data: workshop } = await supabase
    .from('employees')
    .select('workshop_id')
    .eq('id', employeeId)
    .single()

  const { error } = await supabase.from('approval_requests').insert({
    action_type: 'salary_change',
    target_table: 'employees',
    target_record_id: employeeId,
    requested_by: user.id,
    payload: {
      before: { base_salary: emp?.base_salary, daily_rate: emp?.daily_rate },
      after: { base_salary: newBaseSalary, daily_rate: newDailyRate },
      employee_name: emp?.name_dari,
      emp_code: emp?.emp_code,
    },
    reason,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    workshop_id: workshop?.workshop_id ?? null,
  })

  if (error) throw new Error(error.message)
  return { success: true, message: 'Salary change request submitted for approval.' }
}

// Called AFTER approval is confirmed — server enforces it
export async function applySalaryChange(approvalRequestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  const { data: req } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('id', approvalRequestId)
    .eq('status', 'approved')
    .single()

  if (!req) throw new Error('APPROVAL_REQUIRED')
  if (req.requested_by === user.id) throw new Error('SAME_USER_APPROVAL')

  const payload = req.payload as { after: { base_salary: number; daily_rate: number } }

  const { error } = await supabase.from('employees').update({
    base_salary: payload.after.base_salary,
    daily_rate: payload.after.daily_rate,
  }).eq('id', req.target_record_id)

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/employees', 'page')
  return { success: true }
}

export async function changeEmployeeStatus(
  employeeId: string,
  newStatus: EmpStatus,
  reason: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  // Termination requires approval
  if (newStatus === 'terminated') {
    await requirePermission(user.id, 'employees.change_status')
    const { data: emp } = await supabase.from('employees').select('name_dari, emp_code, workshop_id').eq('id', employeeId).single()
    const { error } = await supabase.from('approval_requests').insert({
      action_type: 'employee_termination',
      target_table: 'employees',
      target_record_id: employeeId,
      requested_by: user.id,
      payload: { new_status: newStatus, employee_name: emp?.name_dari, emp_code: emp?.emp_code },
      reason,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      workshop_id: emp?.workshop_id ?? null,
    })
    if (error) throw new Error(error.message)
    return { success: true, pending: true }
  }

  // Other status changes can proceed directly
  await requirePermission(user.id, 'employees.change_status')
  const { error } = await supabase.from('employees').update({ status: newStatus }).eq('id', employeeId)
  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/employees', 'page')
  return { success: true }
}
