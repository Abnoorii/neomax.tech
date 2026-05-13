'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import type { AttendanceStatus } from '@/types/database'

const REASON_REQUIRED_AFTER_HOURS = 24
const EDIT_ANY_LIMIT_DAYS = 30
const EDIT_OWN_LIMIT_DAYS = 7

function hoursSince(dateStr: string, enteredAt: string): number {
  const entry = new Date(enteredAt)
  return (Date.now() - entry.getTime()) / (1000 * 60 * 60)
}

function daysSince(enteredAt: string): number {
  return hoursSince('', enteredAt) / 24
}

async function checkPeriodOpen(supabase: Awaited<ReturnType<typeof createClient>>, date: string): Promise<void> {
  const { data } = await supabase
    .from('accounting_periods')
    .select('status')
    .lte('start_date', date)
    .gte('end_date', date)
    .single()
  if (data?.status === 'closed') throw new Error('PERIOD_CLOSED')
}

export async function upsertAttendance(params: {
  employeeId: string
  date: string
  status: AttendanceStatus
  hours?: number
  overtimeHours?: number
  notes?: string | null
  reason?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await checkPeriodOpen(supabase, params.date)

  // Check if record already exists
  const { data: existing } = await supabase
    .from('attendance')
    .select('id, entered_at')
    .eq('employee_id', params.employeeId)
    .eq('date', params.date)
    .single()

  if (existing) {
    // This is an edit — apply tiered rules
    const ageHours = hoursSince(params.date, existing.entered_at)
    const ageDays = ageHours / 24

    if (ageDays > EDIT_ANY_LIMIT_DAYS) {
      // Requires override_lock permission
      await requirePermission(user.id, 'attendance.override_lock')
    } else if (ageDays > EDIT_OWN_LIMIT_DAYS) {
      await requirePermission(user.id, 'attendance.edit_any')
    }

    // Reason required after 24h
    if (ageHours > REASON_REQUIRED_AFTER_HOURS) {
      const reason = params.reason?.trim() ?? ''
      if (reason.length < 10) throw new Error('REASON_REQUIRED')
    }

    // Set session variable for trigger
    if (params.reason) {
      await supabase.rpc('set_config', { setting: 'app.change_reason', value: params.reason, is_local: true }).then(() => {}, () => {})
    }

    const { error } = await supabase
      .from('attendance')
      .update({
        status: params.status,
        hours: params.hours ?? 8,
        overtime_hours: params.overtimeHours ?? 0,
        notes: params.notes ?? null,
      })
      .eq('id', existing.id)

    if (error) throw new Error(error.message)
  } else {
    await requirePermission(user.id, 'attendance.enter')

    const { error } = await supabase.from('attendance').insert({
      employee_id: params.employeeId,
      date: params.date,
      status: params.status,
      hours: params.hours ?? 8,
      overtime_hours: params.overtimeHours ?? 0,
      notes: params.notes ?? null,
      entered_by: user.id,
    })

    if (error) throw new Error(error.message)
  }

  revalidatePath('/[locale]/(app)/attendance', 'page')
  return { success: true }
}

export async function bulkMarkPresent(employeeIds: string[], date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'attendance.enter')
  await checkPeriodOpen(supabase, date)

  // Upsert all as present — use onConflict to skip existing
  const rows = employeeIds.map(employeeId => ({
    employee_id: employeeId,
    date,
    status: 'present' as AttendanceStatus,
    hours: 8,
    overtime_hours: 0,
    entered_by: user.id,
  }))

  const { error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'employee_id,date', ignoreDuplicates: true })

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/attendance', 'page')
  return { success: true }
}

export async function bulkMarkHoliday(employeeIds: string[], date: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'attendance.enter')
  await checkPeriodOpen(supabase, date)

  const rows = employeeIds.map(employeeId => ({
    employee_id: employeeId,
    date,
    status: 'holiday' as AttendanceStatus,
    hours: 8,
    overtime_hours: 0,
    entered_by: user.id,
  }))

  const { error } = await supabase
    .from('attendance')
    .upsert(rows, { onConflict: 'employee_id,date', ignoreDuplicates: true })

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/attendance', 'page')
  return { success: true }
}

// Sync route handler (called from offline queue)
export async function syncAttendanceEntry(entry: {
  localId: string
  employeeId: string
  date: string
  status: AttendanceStatus
  hours: number
  overtimeHours: number
  notes: string | null
  reason: string | null
}) {
  return upsertAttendance({
    employeeId: entry.employeeId,
    date: entry.date,
    status: entry.status,
    hours: entry.hours,
    overtimeHours: entry.overtimeHours,
    notes: entry.notes,
    reason: entry.reason,
  })
}
