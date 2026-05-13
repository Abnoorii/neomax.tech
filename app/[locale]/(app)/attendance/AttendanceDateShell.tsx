'use client'

import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { HijriDatePicker } from '@/components/attendance/HijriDatePicker'
import { AttendanceGrid } from '@/components/attendance/AttendanceGrid'
import type { AttendanceStatus } from '@/types/database'

interface Employee {
  id: string
  emp_code: string
  name_dari: string
  name_english: string | null
}

interface AttendanceRecord {
  employee_id: string
  status: AttendanceStatus
  hours: number
  overtime_hours: number
  notes: string | null
  entered_at: string
}

interface Props {
  locale: string
  selectedDate: string
  defaultDate: string
  employees: Employee[]
  attendance: AttendanceRecord[]
  canEdit: boolean
}

export function AttendanceDateShell({ locale, selectedDate, defaultDate, employees, attendance, canEdit }: Props) {
  const router = useRouter()
  const params = useParams()

  function handleDateChange(iso: string) {
    router.push(`/${locale}/attendance?date=${iso}`)
  }

  return (
    <div className="space-y-4">
      <HijriDatePicker
        value={selectedDate}
        onChange={handleDateChange}
        locale={locale}
        maxDate={defaultDate}
      />
      <AttendanceGrid
        employees={employees}
        attendance={attendance}
        date={selectedDate}
        locale={locale}
        canEdit={canEdit}
      />
    </div>
  )
}
