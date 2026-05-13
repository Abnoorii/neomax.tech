'use client'

import { useState, useTransition } from 'react'
import { Plus, Copy, Pencil, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { createRole, cloneRole, updateRolePermissions } from '@/app/actions/roles'
import { useToast } from '@/hooks/use-toast'

interface Permission { code: string; category: string; name_en: string }
interface Role {
  id: string
  code: string
  name_en: string
  name_dari: string | null
  description: string | null
  is_system: boolean
  is_active: boolean
  role_permissions: { permission_code: string }[]
}

interface Props {
  locale: string
  roles: Role[]
  allPermissions: Permission[]
}

type DialogMode = 'create' | 'clone' | 'edit' | null

export function RolesTab({ locale, roles, allPermissions }: Props) {
  const [mode, setMode] = useState<DialogMode>(null)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isRTL = locale !== 'en'

  const groupedPerms = allPermissions.reduce<Record<string, Permission[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  function openCreate() {
    setSelectedRole(null)
    setSelectedPerms(new Set())
    setMode('create')
  }

  function openClone(role: Role) {
    setSelectedRole(role)
    setSelectedPerms(new Set(role.role_permissions.map(rp => rp.permission_code)))
    setMode('clone')
  }

  function openEdit(role: Role) {
    setSelectedRole(role)
    setSelectedPerms(new Set(role.role_permissions.map(rp => rp.permission_code)))
    setMode('edit')
  }

  function togglePerm(code: string) {
    setSelectedPerms(prev => {
      const next = new Set(prev)
      if (next.has(code)) next.delete(code)
      else next.add(code)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const perms = Array.from(selectedPerms)

    startTransition(async () => {
      try {
        if (mode === 'create') {
          await createRole(fd, perms)
          toast({ title: locale === 'en' ? 'Role created' : 'نقش ایجاد شد', variant: 'default' })
        } else if (mode === 'clone' && selectedRole) {
          await cloneRole(selectedRole.id, fd)
          toast({ title: locale === 'en' ? 'Role cloned' : 'نقش کپی شد' })
        } else if (mode === 'edit' && selectedRole) {
          await updateRolePermissions(selectedRole.id, perms)
          toast({ title: locale === 'en' ? 'Permissions updated' : 'مجوزها بروزرسانی شد' })
        }
        setMode(null)
      } catch (err) {
        toast({ title: String(err), variant: 'destructive' })
      }
    })
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex justify-end">
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          {locale === 'en' ? 'Create Role' : 'ایجاد نقش'}
        </Button>
      </div>

      <div className="grid gap-3">
        {roles.map(role => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{role.name_en}</CardTitle>
                    {role.is_system && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        {locale === 'en' ? 'System' : 'سیستمی'}
                      </Badge>
                    )}
                    {!role.is_active && <Badge variant="outline" className="text-xs">{locale === 'en' ? 'Inactive' : 'غیرفعال'}</Badge>}
                  </div>
                  {role.name_dari && <p className="text-sm text-slate-500 font-[Vazirmatn]">{role.name_dari}</p>}
                  {role.description && <p className="text-xs text-slate-400">{role.description}</p>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(role)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openClone(role)}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {role.role_permissions.slice(0, 8).map(rp => (
                  <Badge key={rp.permission_code} variant="outline" className="text-xs font-mono">
                    {rp.permission_code}
                  </Badge>
                ))}
                {role.role_permissions.length > 8 && (
                  <Badge variant="outline" className="text-xs">
                    +{role.role_permissions.length - 8} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Clone/Edit Dialog */}
      <Dialog open={mode !== null} onOpenChange={open => !open && setMode(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? (locale === 'en' ? 'Create Role' : 'ایجاد نقش') :
               mode === 'clone' ? (locale === 'en' ? `Clone "${selectedRole?.name_en}"` : 'کپی نقش') :
               (locale === 'en' ? `Edit Permissions — ${selectedRole?.name_en}` : 'ویرایش مجوزها')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(mode === 'create' || mode === 'clone') && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">{locale === 'en' ? 'Role Code' : 'کد نقش'}</Label>
                  <Input id="code" name="code" placeholder="casting_supervisor" required pattern="[a-z_]+" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_en">{locale === 'en' ? 'Name (English)' : 'نام (انگلیسی)'}</Label>
                  <Input id="name_en" name="name_en" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name_dari">{locale === 'en' ? 'Name (Dari)' : 'نام (دری)'}</Label>
                  <Input id="name_dari" name="name_dari" dir="rtl" className="font-[Vazirmatn]" />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="description">{locale === 'en' ? 'Description' : 'توضیحات'}</Label>
                  <Textarea id="description" name="description" rows={2} />
                </div>
              </div>
            )}

            {/* Permission Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>{locale === 'en' ? 'Permissions' : 'مجوزها'}</Label>
                <span className="text-xs text-slate-400">{selectedPerms.size} selected</span>
              </div>

              {Object.entries(groupedPerms).map(([category, perms]) => (
                <div key={category} className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{category}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2">
                    {perms.map(perm => (
                      <label key={perm.code} className="flex items-start gap-2 cursor-pointer group">
                        <Checkbox
                          checked={selectedPerms.has(perm.code)}
                          onCheckedChange={() => togglePerm(perm.code)}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-xs font-mono text-slate-700 group-hover:text-slate-900">{perm.code}</p>
                          <p className="text-xs text-slate-400">{perm.name_en}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>
                {locale === 'en' ? 'Cancel' : 'لغو'}
              </Button>
              <Button type="submit" disabled={isPending}>
                <Check className="h-4 w-4" />
                {isPending ? (locale === 'en' ? 'Saving...' : 'در حال ذخیره...') : (locale === 'en' ? 'Save' : 'ذخیره')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
