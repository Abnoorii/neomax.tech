'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

const REASON_REQUIRED_AFTER_HOURS = 24
const EDIT_ANY_LIMIT_DAYS = 30
const EDIT_OWN_LIMIT_DAYS = 7

function hoursSince(enteredAt: string): number {
  return (Date.now() - new Date(enteredAt).getTime()) / (1000 * 60 * 60)
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

export async function upsertProduction(params: {
  employeeId: string
  date: string
  workCode: string
  quantity: number
  unitPrice?: number
  notes?: string | null
  reason?: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await checkPeriodOpen(supabase, params.date)

  // Snapshot the current unit price from rate card if not supplied
  let unitPrice = params.unitPrice
  if (unitPrice === undefined) {
    const { data: rate } = await supabase.rpc('get_rate', {
      _work_code: params.workCode,
      _on_date: params.date,
    })
    if (!rate) throw new Error('NO_RATE_FOUND')
    unitPrice = rate as number
  }

  // Check if record already exists
  const { data: existing } = await supabase
    .from('production')
    .select('id, entered_at')
    .eq('employee_id', params.employeeId)
    .eq('date', params.date)
    .eq('work_code', params.workCode)
    .single()

  if (existing) {
    const ageHours = hoursSince(existing.entered_at)
    const ageDays = ageHours / 24

    if (ageDays > EDIT_ANY_LIMIT_DAYS) {
      await requirePermission(user.id, 'production.override_lock')
    } else if (ageDays > EDIT_OWN_LIMIT_DAYS) {
      await requirePermission(user.id, 'production.edit_any')
    }

    if (ageHours > REASON_REQUIRED_AFTER_HOURS) {
      const reason = params.reason?.trim() ?? ''
      if (reason.length < 10) throw new Error('REASON_REQUIRED')
    }

    if (params.reason) {
      await supabase.rpc('set_config', { setting: 'app.change_reason', value: params.reason, is_local: true }).then(() => {}, () => {})
    }

    const { error } = await supabase
      .from('production')
      .update({
        quantity: params.quantity,
        unit_price: unitPrice,
        notes: params.notes ?? null,
      })
      .eq('id', existing.id)

    if (error) throw new Error(error.message)
  } else {
    await requirePermission(user.id, 'production.enter')

    const { error } = await supabase.from('production').insert({
      employee_id: params.employeeId,
      date: params.date,
      work_code: params.workCode,
      quantity: params.quantity,
      unit_price: unitPrice,
      notes: params.notes ?? null,
      entered_by: user.id,
    })

    if (error) throw new Error(error.message)
  }

  revalidatePath('/[locale]/(app)/production', 'page')
  return { success: true }
}

export async function deleteProduction(productionId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'production.edit_any')

  if (!reason || reason.trim().length < 10) throw new Error('REASON_REQUIRED')

  await supabase.rpc('set_config', { setting: 'app.change_reason', value: reason, is_local: true }).then(() => {}, () => {})

  const { error } = await supabase.from('production').delete().eq('id', productionId)
  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/(app)/production', 'page')
  return { success: true }
}

export async function syncProductionEntry(entry: {
  localId: string
  employeeId: string
  date: string
  workCode: string
  quantity: number
  unitPrice: number
  notes: string | null
  reason: string | null
}) {
  return upsertProduction({
    employeeId: entry.employeeId,
    date: entry.date,
    workCode: entry.workCode,
    quantity: entry.quantity,
    unitPrice: entry.unitPrice,
    notes: entry.notes,
    reason: entry.reason,
  })
}
