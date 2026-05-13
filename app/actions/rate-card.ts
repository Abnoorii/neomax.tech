'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

export async function createRateCardEntry(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'rate_card.create')

  const { error } = await supabase.from('rate_card').insert({
    work_code: formData.get('work_code') as string,
    description_dari: formData.get('description_dari') as string,
    description_en: (formData.get('description_en') as string) || null,
    category: (formData.get('category') as string) || null,
    unit_price: Number(formData.get('unit_price')),
    effective_from: formData.get('effective_from') as string,
    created_by: user.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/(app)/rate-card', 'page')
  return { success: true }
}

// Rate changes create an approval request — never mutate existing rows
export async function requestRateCardChange(
  oldRateCardId: string,
  formData: FormData,
  reason: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'rate_card.edit')

  const { data: old } = await supabase.from('rate_card').select('*').eq('id', oldRateCardId).single()
  if (!old) throw new Error('Rate card entry not found')

  const newPrice = Number(formData.get('unit_price'))
  const today = new Date().toISOString().split('T')[0]

  // Get workshop_id from first employee (for scoping notifications)
  const { data: firstWorkshop } = await supabase.from('workshops').select('id').limit(1).single()

  const { error } = await supabase.from('approval_requests').insert({
    action_type: 'rate_card_change',
    target_table: 'rate_card',
    target_record_id: oldRateCardId,
    requested_by: user.id,
    payload: {
      old_rate_card_id: oldRateCardId,
      work_code: old.work_code,
      description_dari: old.description_dari,
      description_en: old.description_en,
      category: old.category,
      before: { unit_price: old.unit_price },
      after: { unit_price: newPrice, effective_from: today },
    },
    reason,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    workshop_id: firstWorkshop?.id ?? null,
  })

  if (error) throw new Error(error.message)
  return { success: true, message: 'Rate change submitted for approval.' }
}

export async function bulkRateCardAdjustment(
  rateCardIds: string[],
  percentageChange: number,
  reason: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'rate_card.bulk_update')

  const { data: rates } = await supabase.from('rate_card').select('*').in('id', rateCardIds)
  if (!rates?.length) throw new Error('No rates found')

  const { data: firstWorkshop } = await supabase.from('workshops').select('id').limit(1).single()

  const { error } = await supabase.from('approval_requests').insert({
    action_type: 'rate_card_change',
    target_table: 'rate_card',
    requested_by: user.id,
    payload: {
      bulk: true,
      rate_card_ids: rateCardIds,
      percentage_change: percentageChange,
      affected_codes: rates.map(r => r.work_code),
    },
    reason,
    expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    workshop_id: firstWorkshop?.id ?? null,
  })

  if (error) throw new Error(error.message)
  return { success: true, message: `Bulk rate adjustment (${percentageChange > 0 ? '+' : ''}${percentageChange}%) submitted for approval.` }
}
