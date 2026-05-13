import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RolesTab } from './RolesTab'
import { UsersTab } from './UsersTab'
import { Shield } from 'lucide-react'

export default async function UsersAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  if (!can(permissions, 'admin.manage_permissions') && !permissions.isAdmin) {
    redirect(`/${locale}/dashboard`)
  }

  const [rolesResult, permissionsResult, workshopsResult, sectionsResult] = await Promise.all([
    supabase.from('roles').select('*, role_permissions(permission_code)').order('is_system', { ascending: false }).order('name_en'),
    supabase.from('permissions').select('*').order('category').order('code'),
    supabase.from('workshops').select('id, name'),
    supabase.from('sections').select('id, code, name_en, workshop_id'),
  ])

  // Fetch users with profiles and roles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, user_roles(role_id, roles(code, name_en))')
    .order('created_at', { ascending: false })

  const isRTL = locale !== 'en'

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
          <Shield className="h-7 w-7 text-amber-500" />
          {locale === 'en' ? 'Users & Roles' : 'کاربران و نقش‌ها'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {locale === 'en'
            ? 'Manage roles, permissions, and user access scopes.'
            : 'مدیریت نقش‌ها، مجوزها و محدوده دسترسی کاربران.'}
        </p>
      </div>

      <Tabs defaultValue="roles">
        <TabsList>
          <TabsTrigger value="roles">{locale === 'en' ? 'Roles' : 'نقش‌ها'}</TabsTrigger>
          <TabsTrigger value="users">{locale === 'en' ? 'Users' : 'کاربران'}</TabsTrigger>
        </TabsList>

        <TabsContent value="roles">
          <RolesTab
            locale={locale}
            roles={rolesResult.data ?? []}
            allPermissions={permissionsResult.data ?? []}
          />
        </TabsContent>

        <TabsContent value="users">
          <UsersTab
            locale={locale}
            profiles={profiles ?? []}
            roles={rolesResult.data ?? []}
            workshops={workshopsResult.data ?? []}
            sections={sectionsResult.data ?? []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
