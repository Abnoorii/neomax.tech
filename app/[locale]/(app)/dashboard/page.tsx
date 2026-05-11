import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CalendarCheck, Factory, CreditCard, TrendingUp, AlertCircle } from 'lucide-react'
import { formatAFN } from '@/lib/utils'
import { getCurrentHijriDate, hijriMonthName } from '@/lib/hijri'

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const permissions = await getUserPermissions(user.id)
  const hjDate = getCurrentHijriDate()
  const monthName = hijriMonthName(hjDate.jm, locale === 'en' ? 'en' : 'dari')

  const [employeeCount, todayAttendance, pendingApprovals] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('attendance').select('id', { count: 'exact', head: true }).eq('date', new Date().toISOString().split('T')[0]).eq('status', 'present'),
    supabase.from('approval_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const isRTL = locale !== 'en'

  const stats = [
    {
      title: locale === 'en' ? 'Active Employees' : 'کارمندان فعال',
      value: employeeCount.count ?? 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      visible: can(permissions, 'employees.view'),
    },
    {
      title: locale === 'en' ? 'Present Today' : 'حاضر امروز',
      value: todayAttendance.count ?? 0,
      icon: CalendarCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
      visible: can(permissions, 'attendance.view_all'),
    },
    {
      title: locale === 'en' ? 'Pending Approvals' : 'تأییدیه‌های در انتظار',
      value: pendingApprovals.count ?? 0,
      icon: AlertCircle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      visible: can(permissions, 'admin.manage_approvals'),
    },
  ]

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          {locale === 'en' ? 'Dashboard' : 'داشبورد'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {locale === 'en'
            ? `${monthName} ${hjDate.jy} — ${new Date().toLocaleDateString()}`
            : `${monthName} ${hjDate.jy}`}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.filter(s => s.visible).map(stat => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === 'en' ? 'Quick Actions' : 'اقدامات سریع'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {can(permissions, 'attendance.enter') && (
              <a href={`/${locale}/attendance`} className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-slate-50 transition-colors text-center">
                <CalendarCheck className="h-6 w-6 text-green-600" />
                <span className="text-xs font-medium text-slate-700">
                  {locale === 'en' ? 'Mark Attendance' : 'ثبت حضور'}
                </span>
              </a>
            )}
            {can(permissions, 'production.enter') && (
              <a href={`/${locale}/production`} className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-slate-50 transition-colors text-center">
                <Factory className="h-6 w-6 text-blue-600" />
                <span className="text-xs font-medium text-slate-700">
                  {locale === 'en' ? 'Log Production' : 'ثبت تولید'}
                </span>
              </a>
            )}
            {can(permissions, 'payroll.prepare') && (
              <a href={`/${locale}/payroll`} className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-slate-50 transition-colors text-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
                <span className="text-xs font-medium text-slate-700">
                  {locale === 'en' ? 'Run Payroll' : 'محاسبه معاش'}
                </span>
              </a>
            )}
            {can(permissions, 'reports.labor_cost') && (
              <a href={`/${locale}/reports`} className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-slate-50 transition-colors text-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
                <span className="text-xs font-medium text-slate-700">
                  {locale === 'en' ? 'View Reports' : 'مشاهده گزارش‌ها'}
                </span>
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
