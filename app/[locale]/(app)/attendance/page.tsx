import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { getCurrentHijriDate, toGregorianDateString } from '@/lib/hijri'
import { SyncIndicator } from '@/components/layout/SyncIndicator'
import { AttendanceGrid, AttendanceGridSkeleton } from '@/components/attendance/AttendanceGrid'
import { HijriDatePicker } from '@/components/attendance/HijriDatePicker'
import { AttendanceDateShell } from './AttendanceDateShell'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ date?: string }>
}

export default async function AttendancePage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { date: dateParam } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  const canEnter = can(permissions, 'attendance.enter')
  const canViewAny = can(permissions, 'attendance.view_any')

  // Resolve date: use query param or today's Hijri-equivalent Gregorian
  const hijriToday = getCurrentHijriDate()
  const defaultDate = toGregorianDateString(hijriToday.jy, hijriToday.jm, hijriToday.jd)
  const selectedDate = dateParam ?? defaultDate

  // Check if period is open for selected date
  const { data: period } = await supabase
    .from('accounting_periods')
    .select('status, hijri_month, hijri_year')
    .lte('start_date', selectedDate)
    .gte('end_date', selectedDate)
    .single()

  const periodOpen = period?.status === 'open'

  // Fetch in-scope employees
  const { data: employees } = await supabase
    .from('employees')
    .select('id, emp_code, name_dari, name_english, section_id')
    .eq('status', 'active')
    .order('name_dari')

  // Fetch attendance for this date
  const employeeIds = (employees ?? []).map(e => e.id)
  const { data: attendance } = employeeIds.length > 0
    ? await supabase
        .from('attendance')
        .select('employee_id, status, hours, overtime_hours, notes, entered_at')
        .in('employee_id', employeeIds)
        .eq('date', selectedDate)
    : { data: [] }

  const isRTL = locale !== 'en'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">
            {locale === 'en' ? 'Attendance' : 'حضور و غیاب'}
          </h1>
          {period && (
            <p className="text-sm text-muted-foreground">
              {!periodOpen && (locale === 'en' ? '🔒 Closed period — read only' : '🔒 دوره بسته — فقط خواندنی')}
            </p>
          )}
        </div>
        <SyncIndicator locale={locale} />
      </div>

      {/* Date picker shell (client — handles date navigation) */}
      <AttendanceDateShell
        locale={locale}
        selectedDate={selectedDate}
        defaultDate={defaultDate}
        employees={employees ?? []}
        attendance={attendance ?? []}
        canEdit={canEnter && periodOpen}
      />
    </div>
  )
}
