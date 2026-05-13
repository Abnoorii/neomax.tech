import { createClient } from './supabase/server'
export type { PermissionCode, UserPermissions } from './permissions-shared'
export { can, canAny, canAll } from './permissions-shared'
import type { UserPermissions } from './permissions-shared'

export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const supabase = await createClient()

  const [profileResult, permResult, scopeResults] = await Promise.all([
    supabase.from('profiles').select('is_admin').eq('id', userId).single(),
    supabase
      .from('user_roles')
      .select('role_id, roles!inner(role_permissions!inner(permission_code))')
      .eq('user_id', userId),
    Promise.all([
      supabase.from('user_workshop_scope').select('workshop_id').eq('user_id', userId),
      supabase.from('user_section_scope').select('section_id').eq('user_id', userId),
      supabase.from('user_employee_scope').select('employee_id').eq('user_id', userId),
      supabase.from('user_pay_type_scope').select('pay_type').eq('user_id', userId),
    ]),
  ])

  const isAdmin = profileResult.data?.is_admin ?? false

  const permissions = new Set<string>()
  if (permResult.data) {
    for (const userRole of permResult.data) {
      const role = userRole.roles as unknown as { role_permissions: { permission_code: string }[] } | null
      if (role?.role_permissions) {
        for (const rp of role.role_permissions) {
          permissions.add(rp.permission_code)
        }
      }
    }
  }

  const [workshopScope, sectionScope, employeeScope, payTypeScope] = scopeResults

  return {
    permissions,
    isAdmin,
    workshopScope: workshopScope.data?.length
      ? workshopScope.data.map(r => r.workshop_id)
      : null,
    sectionScope: sectionScope.data?.length
      ? sectionScope.data.map(r => r.section_id)
      : null,
    employeeScope: employeeScope.data?.length
      ? employeeScope.data.map(r => r.employee_id)
      : null,
    payTypeScope: payTypeScope.data?.length
      ? payTypeScope.data.map(r => r.pay_type)
      : null,
  }
}

// Server-side guard — throws if permission not held
export async function requirePermission(userId: string, permission: string): Promise<void> {
  const perms = await getUserPermissions(userId)
  if (!can(perms, permission)) {
    throw new Error('UNAUTHORIZED')
  }
}

// Verify dual-approval: approved request must exist and approver ≠ requester
export async function verifyApproval(
  actionType: string,
  targetRecordId: string,
  approverId: string
): Promise<void> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('approval_requests')
    .select('id, requested_by, status')
    .eq('action_type', actionType)
    .eq('target_record_id', targetRecordId)
    .eq('status', 'approved')
    .single()

  if (error || !data) {
    throw new Error('APPROVAL_REQUIRED')
  }

  if (data.requested_by === approverId) {
    throw new Error('SAME_USER_APPROVAL')
  }
}
