'use client'

import { useState, useTransition } from 'react'
import { Pencil, UserCheck, UserX, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { assignUserRoles, setUserSectionScope, setUserWorkshopScope, toggleUserActive } from '@/app/actions/roles'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  full_name: string | null
  full_name_dari: string | null
  language: string
  is_active: boolean
  is_admin: boolean
  created_at: string
  user_roles: { role_id: string; roles: { code: string; name_en: string } | null }[]
}

interface Role { id: string; code: string; name_en: string; name_dari: string | null }
interface Workshop { id: string; name: string }
interface Section { id: string; code: string; name_en: string; workshop_id: string }

interface Props {
  locale: string
  profiles: UserProfile[]
  roles: Role[]
  workshops: Workshop[]
  sections: Section[]
}

export function UsersTab({ locale, profiles, roles, workshops, sections }: Props) {
  const [editUser, setEditUser] = useState<UserProfile | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set())
  const [selectedWorkshops, setSelectedWorkshops] = useState<Set<string>>(new Set())
  const [selectedSections, setSelectedSections] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  function openEdit(u: UserProfile) {
    setEditUser(u)
    setSelectedRoles(new Set(u.user_roles.map(r => r.role_id)))
    setSelectedWorkshops(new Set())
    setSelectedSections(new Set())
  }

  function handleSave() {
    if (!editUser) return
    startTransition(async () => {
      try {
        await assignUserRoles(editUser.id, Array.from(selectedRoles))
        await setUserWorkshopScope(editUser.id, Array.from(selectedWorkshops))
        await setUserSectionScope(editUser.id, Array.from(selectedSections))
        toast({ title: locale === 'en' ? 'User updated' : 'کاربر بروزرسانی شد' })
        setEditUser(null)
      } catch (err) {
        toast({ title: String(err), variant: 'destructive' })
      }
    })
  }

  async function handleToggleActive(userId: string, active: boolean) {
    try {
      await toggleUserActive(userId, active)
      toast({ title: active ? (locale === 'en' ? 'User activated' : 'کاربر فعال شد') : (locale === 'en' ? 'User deactivated' : 'کاربر غیرفعال شد') })
    } catch (err) {
      toast({ title: String(err), variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-3 mt-4">
      {profiles.map(u => {
        const displayName = locale === 'en' ? u.full_name : (u.full_name_dari || u.full_name)
        const roleNames = u.user_roles.map(r => r.roles?.name_en).filter(Boolean)

        return (
          <Card key={u.id}>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold shrink-0">
                {(displayName || 'U')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm text-slate-900 truncate">{displayName || u.id.slice(0, 8)}</p>
                  {u.is_admin && <Badge variant="warning" className="text-xs">Admin</Badge>}
                  {!u.is_active && <Badge variant="outline" className="text-xs">{locale === 'en' ? 'Inactive' : 'غیرفعال'}</Badge>}
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {roleNames.length > 0
                    ? roleNames.map(r => <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>)
                    : <span className="text-xs text-slate-400">{locale === 'en' ? 'No roles assigned' : 'نقشی تعیین نشده'}</span>
                  }
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={u.is_active}
                  onCheckedChange={v => handleToggleActive(u.id, v)}
                  disabled={u.is_admin}
                />
                <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Edit User Dialog */}
      <Dialog open={editUser !== null} onOpenChange={o => !o && setEditUser(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {locale === 'en' ? 'Edit User Access' : 'ویرایش دسترسی کاربر'}
              {editUser && <span className="block text-sm font-normal text-slate-500 mt-1">{editUser.full_name || editUser.id}</span>}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            {/* Roles */}
            <div className="space-y-2">
              <Label>{locale === 'en' ? 'Roles' : 'نقش‌ها'}</Label>
              <div className="grid grid-cols-2 gap-1.5 border rounded-md p-3">
                {roles.map(role => (
                  <label key={role.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedRoles.has(role.id)}
                      onCheckedChange={() => setSelectedRoles(prev => {
                        const next = new Set(prev)
                        if (next.has(role.id)) next.delete(role.id)
                        else next.add(role.id)
                        return next
                      })}
                    />
                    <span>{role.name_en}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Workshop Scope */}
            <div className="space-y-2">
              <Label>
                {locale === 'en' ? 'Workshop Scope' : 'محدوده کارگاه'}
                <span className="text-xs text-slate-400 ml-2 font-normal">
                  {locale === 'en' ? '(empty = all)' : '(خالی = همه)'}
                </span>
              </Label>
              <div className="space-y-1.5 border rounded-md p-3">
                {workshops.map(w => (
                  <label key={w.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedWorkshops.has(w.id)}
                      onCheckedChange={() => setSelectedWorkshops(prev => {
                        const next = new Set(prev)
                        if (next.has(w.id)) next.delete(w.id)
                        else next.add(w.id)
                        return next
                      })}
                    />
                    <span>{w.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Section Scope */}
            <div className="space-y-2">
              <Label>
                {locale === 'en' ? 'Section Scope' : 'محدوده بخش'}
                <span className="text-xs text-slate-400 ml-2 font-normal">
                  {locale === 'en' ? '(empty = all)' : '(خالی = همه)'}
                </span>
              </Label>
              <div className="grid grid-cols-2 gap-1.5 border rounded-md p-3">
                {sections.map(s => (
                  <label key={s.id} className="flex items-center gap-2 cursor-pointer text-sm">
                    <Checkbox
                      checked={selectedSections.has(s.id)}
                      onCheckedChange={() => setSelectedSections(prev => {
                        const next = new Set(prev)
                        if (next.has(s.id)) next.delete(s.id)
                        else next.add(s.id)
                        return next
                      })}
                    />
                    <span>{s.name_en}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              {locale === 'en' ? 'Cancel' : 'لغو'}
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? '...' : (locale === 'en' ? 'Save' : 'ذخیره')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
