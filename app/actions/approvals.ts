'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

export async function approveRequest(approvalRequestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  // Fetch request to check action type and requester
  const { data: req, error: fetchErr } = await supabase
    .from('approval_requests')
    .select('*')
    .eq('id', approvalRequestId)
    .eq('status', 'pending')
    .single()

  if (fetchErr || !req) throw new Error('Request not found or already resolved.')

  // Block same-user approval
  if (req.requested_by === user.id) throw new Error('SAME_USER_APPROVAL')

  // Verify approver has the correct permission for this action type
  const permissionMap: Record<string, string> = {
    salary_change: 'approval.approve_salary_change',
    employee_termination: 'approval.approve_termination',
    rate_card_change: 'approval.approve_rate_change',
    payroll_run_approval: 'approval.approve_payroll',
    large_advance: 'approval.approve_large_advance',
    advance_writeoff: 'approval.approve_writeoff',
    reopen_closed_month: 'approval.approve_reopen_month',
    void_record: 'approval.approve_void',
    policy_change: 'approval.approve_policy_change',
  }
  const requiredPerm = permissionMap[req.action_type]
  if (requiredPerm) await requirePermission(user.id, requiredPerm)

  const { error } = await supabase
    .from('approval_requests')
    .update({ status: 'approved', approved_by: user.id, approved_at: new Date().toISOString() })
    .eq('id', approvalRequestId)

  if (error) throw new Error(error.message)

  // Execute the action immediately after approval
  await executeApprovedAction(req, user.id)

  revalidatePath('/[locale]/(app)/approvals', 'page')
  return { success: true }
}

export async function rejectRequest(approvalRequestId: string, rejectionReason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  const { data: req } = await supabase.from('approval_requests').select('requested_by, action_type').eq('id', approvalRequestId).single()
  if (!req) throw new Error('Not found')
  if (req.requested_by === user.id) throw new Error('SAME_USER_APPROVAL')

  const { error } = await supabase
    .from('approval_requests')
    .update({ status: 'rejected', approved_by: user.id, approved_at: new Date().toISOString(), rejection_reason: rejectionReason })
    .eq('id', approvalRequestId)

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/approvals', 'page')
  return { success: true }
}

export async function cancelRequest(approvalRequestId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  // Only the requester can cancel their own pending request
  const { error } = await supabase
    .from('approval_requests')
    .update({ status: 'rejected', rejection_reason: 'Cancelled by requester' })
    .eq('id', approvalRequestId)
    .eq('requested_by', user.id)
    .eq('status', 'pending')

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/approvals', 'page')
  return { success: true }
}

// Execute the underlying action after approval
async function executeApprovedAction(req: Record<string, unknown>, approverId: string) {
  const supabase = await createClient()
  const payload = req.payload as Record<string, unknown>

  switch (req.action_type) {
    case 'salary_change': {
      const after = payload.after as { base_salary: number; daily_rate: number }
      await supabase.from('employees').update({
        base_salary: after.base_salary,
        daily_rate: after.daily_rate,
      }).eq('id', req.target_record_id as string)
      break
    }
    case 'employee_termination': {
      await supabase.from('employees').update({ status: 'terminated' }).eq('id', req.target_record_id as string)
      break
    }
    case 'rate_card_change': {
      const after = payload.after as { unit_price: number; effective_from: string }
      // Close old row
      if (payload.old_rate_card_id) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        await supabase.from('rate_card').update({ effective_to: yesterday.toISOString().split('T')[0] }).eq('id', payload.old_rate_card_id as string)
      }
      // Create new versioned row
      await supabase.from('rate_card').insert({
        work_code: payload.work_code as string,
        description_dari: payload.description_dari as string,
        description_en: payload.description_en as string | null,
        category: payload.category as string | null,
        unit_price: after.unit_price,
        effective_from: after.effective_from,
        created_by: approverId,
      })
      break
    }
    case 'reopen_closed_month': {
      await supabase.from('accounting_periods').update({
        status: 'open',
        reopened_by: approverId,
        reopened_at: new Date().toISOString(),
        reopen_reason: payload.reason as string,
      }).eq('id', req.target_record_id as string)
      break
    }
    // Other action types (payroll, advance) handled by their own modules
    default:
      break
  }
}
