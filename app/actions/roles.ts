'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'

export async function createRole(formData: FormData, permissionCodes: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'admin.manage_permissions')

  const { data: role, error } = await supabase.from('roles').insert({
    code: formData.get('code') as string,
    name_en: formData.get('name_en') as string,
    name_dari: (formData.get('name_dari') as string) || null,
    description: (formData.get('description') as string) || null,
    is_system: false,
    created_by: user.id,
  }).select().single()

  if (error) throw new Error(error.message)

  if (permissionCodes.length > 0) {
    const { error: rpError } = await supabase.from('role_permissions').insert(
      permissionCodes.map(code => ({ role_id: role.id, permission_code: code }))
    )
    if (rpError) throw new Error(rpError.message)
  }

  revalidatePath('/[locale]/(app)/admin/users', 'page')
  return { success: true, roleId: role.id }
}

export async function cloneRole(sourceRoleId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'admin.manage_permissions')

  // Get source permissions
  const { data: sourcePerms } = await supabase
    .from('role_permissions')
    .select('permission_code')
    .eq('role_id', sourceRoleId)

  const { data: role, error } = await supabase.from('roles').insert({
    code: formData.get('code') as string,
    name_en: formData.get('name_en') as string,
    name_dari: (formData.get('name_dari') as string) || null,
    description: (formData.get('description') as string) || null,
    is_system: false,
    created_by: user.id,
  }).select().single()

  if (error) throw new Error(error.message)

  if (sourcePerms?.length) {
    await supabase.from('role_permissions').insert(
      sourcePerms.map(p => ({ role_id: role.id, permission_code: p.permission_code }))
    )
  }

  revalidatePath('/[locale]/(app)/admin/users', 'page')
  return { success: true, roleId: role.id }
}

export async function updateRolePermissions(roleId: string, permissionCodes: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'admin.manage_permissions')

  // Check not system role
  const { data: role } = await supabase.from('roles').select('is_system').eq('id', roleId).single()
  // System roles can have permissions updated, just not deleted

  // Replace all permissions
  await supabase.from('role_permissions').delete().eq('role_id', roleId)

  if (permissionCodes.length > 0) {
    const { error } = await supabase.from('role_permissions').insert(
      permissionCodes.map(code => ({ role_id: roleId, permission_code: code }))
    )
    if (error) throw new Error(error.message)
  }

  revalidatePath('/[locale]/(app)/admin/users', 'page')
  return { success: true }
}

export async function assignUserRoles(userId: string, roleIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'admin.manage_permissions')

  // Remove existing roles
  await supabase.from('user_roles').delete().eq('user_id', userId)

  if (roleIds.length > 0) {
    const { error } = await supabase.from('user_roles').insert(
      roleIds.map(role_id => ({ user_id: userId, role_id, assigned_by: user.id }))
    )
    if (error) throw new Error(error.message)
  }

  revalidatePath('/[locale]/(app)/admin/users', 'page')
  return { success: true }
}

export async function setUserWorkshopScope(userId: string, workshopIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'admin.manage_permissions')

  await supabase.from('user_workshop_scope').delete().eq('user_id', userId)

  if (workshopIds.length > 0) {
    await supabase.from('user_workshop_scope').insert(
      workshopIds.map(workshop_id => ({ user_id: userId, workshop_id }))
    )
  }

  revalidatePath('/[locale]/(app)/admin/users', 'page')
  return { success: true }
}

export async function setUserSectionScope(userId: string, sectionIds: string[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'admin.manage_permissions')

  await supabase.from('user_section_scope').delete().eq('user_id', userId)

  if (sectionIds.length > 0) {
    await supabase.from('user_section_scope').insert(
      sectionIds.map(section_id => ({ user_id: userId, section_id }))
    )
  }

  revalidatePath('/[locale]/(app)/admin/users', 'page')
  return { success: true }
}

export async function toggleUserActive(userId: string, isActive: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')

  await requirePermission(user.id, 'admin.manage_users')

  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', userId)
  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/(app)/admin/users', 'page')
  return { success: true }
}
