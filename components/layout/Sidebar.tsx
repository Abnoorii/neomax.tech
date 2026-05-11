'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CalendarCheck, Factory, Wallet,
  CreditCard, FileText, Clock, BarChart3, CheckCircle,
  Shield, Upload, Bot, ScrollText, Settings, ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserPermissions } from '@/lib/permissions'
import { can } from '@/lib/permissions'

interface NavItem {
  key: string
  href: string
  icon: React.ElementType
  permission?: string
  label: string
  labelDari: string
}

const navItems: NavItem[] = [
  { key: 'dashboard',  href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',          labelDari: 'داشبورد' },
  { key: 'employees',  href: '/employees',    icon: Users,           label: 'Employees',          labelDari: 'کارمندان',        permission: 'employees.view' },
  { key: 'attendance', href: '/attendance',   icon: CalendarCheck,   label: 'Attendance',         labelDari: 'حضور و غیاب',     permission: 'attendance.view_all' },
  { key: 'production', href: '/production',   icon: Factory,         label: 'Production',         labelDari: 'تولید',           permission: 'production.view_all' },
  { key: 'advances',   href: '/advances',     icon: Wallet,          label: 'Advances',           labelDari: 'پیشپرداخت‌ها',    permission: 'advances.view' },
  { key: 'payroll',    href: '/payroll',      icon: CreditCard,      label: 'Payroll',            labelDari: 'معاش',            permission: 'payroll.view' },
  { key: 'reports',    href: '/reports',      icon: FileText,        label: 'Reports',            labelDari: 'گزارش‌ها',        permission: 'reports.labor_cost' },
  { key: 'periods',    href: '/periods',      icon: Clock,           label: 'Periods',            labelDari: 'دوره‌ها',         permission: 'periods.close_month' },
  { key: 'rateCard',   href: '/rate-card',    icon: BarChart3,       label: 'Rate Card',          labelDari: 'کارت نرخ',        permission: 'rate_card.view' },
  { key: 'approvals',  href: '/approvals',    icon: CheckCircle,     label: 'Approvals',          labelDari: 'تأییدیه‌ها',      permission: 'admin.manage_approvals' },
  { key: 'users',      href: '/admin/users',  icon: Shield,          label: 'Users & Roles',      labelDari: 'کاربران و نقش‌ها', permission: 'admin.manage_users' },
  { key: 'import',     href: '/admin/import', icon: Upload,          label: 'Import',             labelDari: 'واردات',          permission: 'admin.manage_workshops' },
  { key: 'ai',         href: '/ai',           icon: Bot,             label: 'AI Assistant',       labelDari: 'دستیار هوش مصنوعی', permission: 'ai.use_nl_reporting' },
  { key: 'audit',      href: '/admin/audit',  icon: ScrollText,      label: 'Audit Log',          labelDari: 'سابقه تغییرات',  permission: 'admin.view_audit_log' },
  { key: 'settings',   href: '/settings',     icon: Settings,        label: 'Settings',           labelDari: 'تنظیمات' },
]

interface SidebarProps {
  locale: string
  permissions: UserPermissions
  pendingApprovals?: number
}

export function Sidebar({ locale, permissions, pendingApprovals = 0 }: SidebarProps) {
  const pathname = usePathname()
  const isRTL = locale !== 'en'
  const localePrefix = `/${locale}`

  const visibleItems = navItems.filter(item =>
    !item.permission || can(permissions, item.permission) || permissions.isAdmin
  )

  return (
    <aside
      className={cn(
        'flex flex-col w-64 min-h-screen bg-slate-900 text-slate-100',
        isRTL && 'font-[Vazirmatn]'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-900 text-sm">
          م
        </div>
        <span className="font-semibold text-sm">
          {locale === 'en' ? 'Misgaran Payroll' : 'معاش میسگران'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const href = `${localePrefix}${item.href}`
          const isActive = pathname.startsWith(href)
          const label = locale === 'en' ? item.label : item.labelDari
          const isApprovals = item.key === 'approvals'

          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group',
                isActive
                  ? 'bg-amber-500 text-slate-900 font-medium'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              {isApprovals && pendingApprovals > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {pendingApprovals > 9 ? '9+' : pendingApprovals}
                </span>
              )}
              {!isRTL && !isActive && (
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
