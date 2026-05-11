import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { Users } from 'lucide-react'
import { EmployeeList } from './EmployeeList'

export default async function EmployeesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ search?: string; section?: string; status?: string; pay_type?: string }>
}) {
  const { locale } = await params
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  if (!can(permissions, 'employees.view') && !permissions.isAdmin) {
    redirect(`/${locale}/dashboard`)
  }

  let query = supabase
    .from('employees')
    .select('*, sections(code, name_en, name_dari), jobs(code, name_en, name_dari), workshops(name)')
    .order('name_dari')

  if (sp.search) {
    query = query.or(`name_dari.ilike.%${sp.search}%,name_english.ilike.%${sp.search}%,emp_code.ilike.%${sp.search}%`)
  }
  if (sp.section) query = query.eq('section_id', sp.section)
  if (sp.status) query = query.eq('status', sp.status)
  if (sp.pay_type) query = query.eq('pay_type', sp.pay_type)

  // Apply scope
  if (!permissions.isAdmin && permissions.sectionScope) {
    query = query.in('section_id', permissions.sectionScope)
  }

  const [empResult, sectionsResult, jobsResult, workshopsResult] = await Promise.all([
    query,
    supabase.from('sections').select('*').eq('is_active', true),
    supabase.from('jobs').select('*').eq('is_active', true).order('name_en'),
    supabase.from('workshops').select('*'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
          <Users className="h-7 w-7 text-amber-500" />
          {locale === 'en' ? 'Employees' : 'کارمندان'}
          <span className="text-slate-400 text-base font-normal">
            ({empResult.data?.length ?? 0})
          </span>
        </h1>
      </div>

      <EmployeeList
        locale={locale}
        employees={empResult.data ?? []}
        sections={sectionsResult.data ?? []}
        jobs={jobsResult.data ?? []}
        workshops={workshopsResult.data ?? []}
        canCreate={can(permissions, 'employees.create') || permissions.isAdmin}
        canEdit={can(permissions, 'employees.edit') || permissions.isAdmin}
        canChangeSalary={can(permissions, 'employees.change_salary') || permissions.isAdmin}
        canChangeStatus={can(permissions, 'employees.change_status') || permissions.isAdmin}
        filters={sp}
      />
    </div>
  )
}
