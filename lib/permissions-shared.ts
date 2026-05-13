export type PermissionCode = string

export interface UserPermissions {
  permissions: Set<string>
  isAdmin: boolean
  workshopScope: string[] | null
  sectionScope: string[] | null
  employeeScope: string[] | null
  payTypeScope: string[] | null
}

export function can(perms: UserPermissions, permission: string): boolean {
  if (perms.isAdmin) return true
  return perms.permissions.has(permission)
}

export function canAny(perms: UserPermissions, permissions: string[]): boolean {
  return permissions.some(p => can(perms, p))
}

export function canAll(perms: UserPermissions, permissions: string[]): boolean {
  return permissions.every(p => can(perms, p))
}
