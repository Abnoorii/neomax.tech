'use client'

import { useState, useTransition, useCallback } from 'react'
import { CheckCircle2, XCircle, Heart, Sun, Clock, Loader2, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { useSyncQueue } from '@/hooks/use-sync-queue'
import { getDB } from '@/lib/offline/db'
import type { AttendanceStatus } from '@/types/database'
import { upsertAttendance, bulkMarkPresent, bulkMarkHoliday } from '@/app/actions/attendance'

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
  employees: Employee[]
  attendance: AttendanceRecord[]
  date: string
  locale: string
  canEdit: boolean
}

const STATUS_CONFIG: Record<AttendanceStatus, {
  label_en: string; label_dari: string; icon: React.ElementType; color: string
}> = {
  present:  { label_en: 'Present',  label_dari: 'حاضر',    icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200' },
  absent:   { label_en: 'Absent',   label_dari: 'غایب',    icon: XCircle,      color: 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' },
  sick:     { label_en: 'Sick',     label_dari: 'مریض',    icon: Heart,        color: 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200' },
  holiday:  { label_en: 'Holiday',  label_dari: 'رخصتی',   icon: Sun,          color: 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200' },
  half_day: { label_en: 'Half Day', label_dari: 'نیم روز', icon: Clock,        color: 'bg-purple-100 text-purple-700 border-purple-300 hover:bg-purple-200' },
}

const STATUS_ORDER: AttendanceStatus[] = ['present', 'absent', 'sick', 'holiday', 'half_day']

interface EditState {
  employeeId: string
  employeeName: string
  currentStatus: AttendanceStatus
  enteredAt: string | null
}

export function AttendanceGrid({ employees, attendance, date, locale, canEdit }: Props) {
  const isRTL = locale !== 'en'
  const { isOnline, refreshCount } = useSyncQueue()
  const [pending, startTransition] = useTransition()
  const [localOverrides, setLocalOverrides] = useState<Record<string, AttendanceStatus>>({})
  const [editState, setEditState] = useState<EditState | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)

  const getStatus = useCallback((emp: Employee): AttendanceStatus | null => {
    if (localOverrides[emp.id]) return localOverrides[emp.id]
    return attendance.find(a => a.employee_id === emp.id)?.status ?? null
  }, [localOverrides, attendance])

  const getEnteredAt = useCallback((empId: string): string | null => {
    return attendance.find(a => a.employee_id === empId)?.entered_at ?? null
  }, [attendance])

  async function saveStatus(empId: string, status: AttendanceStatus, reasonText?: string) {
    setSavingId(empId)
    try {
      if (isOnline) {
        await upsertAttendance({ employeeId: empId, date, status, reason: reasonText ?? null })
      } else {
        const db = getDB()
        await db.attendance.put({
          localId: `${empId}-${date}`,
          employeeId: empId,
          date,
          status,
          hours: status === 'half_day' ? 4 : 8,
          overtimeHours: 0,
          notes: null,
          reason: reasonText ?? null,
          syncStatus: 'pending',
          enteredAt: new Date().toISOString(),
        })
        await refreshCount()
      }
      setLocalOverrides(prev => ({ ...prev, [empId]: status }))
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'ERROR'
      if (msg === 'REASON_REQUIRED') {
        const emp = employees.find(e => e.id === empId)!
        const currentStatus = getStatus(emp) ?? 'present'
        setEditState({ employeeId: empId, employeeName: emp.name_dari, currentStatus, enteredAt: getEnteredAt(empId) })
        setReasonError(locale === 'en' ? 'Reason required (min 10 chars)' : 'دلیل لازم است (حداقل ۱۰ حرف)')
      }
    } finally {
      setSavingId(null)
    }
  }

  function handleStatusTap(emp: Employee, newStatus: AttendanceStatus) {
    if (!canEdit) return
    const current = getStatus(emp)
    if (current === newStatus) return
    startTransition(() => { saveStatus(emp.id, newStatus) })
  }

  function openReasonModal(emp: Employee) {
    const current = getStatus(emp) ?? 'present'
    setEditState({ employeeId: emp.id, employeeName: emp.name_dari, currentStatus: current, enteredAt: getEnteredAt(emp.id) })
    setReason('')
    setReasonError('')
  }

  async function handleReasonSave() {
    if (!editState) return
    if (reason.trim().length < 10) {
      setReasonError(locale === 'en' ? 'Min 10 characters required' : 'حداقل ۱۰ حرف لازم است')
      return
    }
    await saveStatus(editState.employeeId, editState.currentStatus, reason.trim())
    setEditState(null)
    setReason('')
    setReasonError('')
  }

  function handleBulkPresent() {
    startTransition(async () => {
      const ids = employees.map(e => e.id)
      if (isOnline) {
        await bulkMarkPresent(ids, date)
      } else {
        const db = getDB()
        for (const id of ids) {
          await db.attendance.put({
            localId: `${id}-${date}`,
            employeeId: id,
            date,
            status: 'present',
            hours: 8,
            overtimeHours: 0,
            notes: null,
            reason: null,
            syncStatus: 'pending',
            enteredAt: new Date().toISOString(),
          })
        }
        await refreshCount()
      }
      const overrides: Record<string, AttendanceStatus> = {}
      employees.forEach(e => { overrides[e.id] = 'present' })
      setLocalOverrides(overrides)
    })
  }

  function handleBulkHoliday() {
    startTransition(async () => {
      const ids = employees.map(e => e.id)
      if (isOnline) {
        await bulkMarkHoliday(ids, date)
      } else {
        const db = getDB()
        for (const id of ids) {
          await db.attendance.put({
            localId: `${id}-${date}`,
            employeeId: id,
            date,
            status: 'holiday',
            hours: 8,
            overtimeHours: 0,
            notes: null,
            reason: null,
            syncStatus: 'pending',
            enteredAt: new Date().toISOString(),
          })
        }
        await refreshCount()
      }
      const overrides: Record<string, AttendanceStatus> = {}
      employees.forEach(e => { overrides[e.id] = 'holiday' })
      setLocalOverrides(overrides)
    })
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {locale === 'en' ? 'No employees in scope.' : 'هیچ کارمندی یافت نشد.'}
      </div>
    )
  }

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Bulk action bar */}
      {canEdit && (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={handleBulkPresent}
            className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
          >
            {pending && <Loader2 className="h-3.5 w-3.5 animate-spin me-1" />}
            {locale === 'en' ? 'Mark All Present' : 'همه حاضر'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={handleBulkHoliday}
            className="text-blue-700 border-blue-300 hover:bg-blue-50"
          >
            {locale === 'en' ? 'Mark Friday Holiday' : 'جمعه رخصتی'}
          </Button>
        </div>
      )}

      {/* Employee rows */}
      <div className="divide-y rounded-lg border bg-card">
        {employees.map(emp => {
          const currentStatus = getStatus(emp)
          const isSaving = savingId === emp.id

          return (
            <div key={emp.id} className="flex items-center gap-3 px-3 py-3 min-h-[60px]">
              {/* Name */}
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{emp.name_dari}</p>
                <p className="text-xs text-muted-foreground">{emp.emp_code}</p>
              </div>

              {/* Status buttons */}
              <div className="flex gap-1.5 flex-wrap justify-end">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin self-center" />}
                {!isSaving && STATUS_ORDER.map(s => {
                  const cfg = STATUS_CONFIG[s]
                  const Icon = cfg.icon
                  const isActive = currentStatus === s
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!canEdit || pending}
                      onClick={() => handleStatusTap(emp, s)}
                      className={cn(
                        'flex items-center gap-1 px-2 py-1.5 rounded-md border text-xs font-medium transition-all',
                        'min-h-[36px] min-w-[48px] justify-center',
                        isActive ? cfg.color : 'bg-background text-muted-foreground border-border hover:bg-accent',
                        !canEdit && 'cursor-default',
                      )}
                      title={locale === 'en' ? cfg.label_en : cfg.label_dari}
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="hidden sm:inline">{locale === 'en' ? cfg.label_en : cfg.label_dari}</span>
                    </button>
                  )
                })}
              </div>

              {/* More options */}
              {canEdit && currentStatus && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => openReasonModal(emp)}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              )}
            </div>
          )
        })}
      </div>

      {/* Reason dialog */}
      <Dialog open={!!editState} onOpenChange={open => { if (!open) { setEditState(null); setReason('') } }}>
        <DialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>
              {locale === 'en' ? 'Edit Reason' : 'دلیل تغییر'}
            </DialogTitle>
          </DialogHeader>
          {editState && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{editState.employeeName}</p>
              <div className="space-y-1">
                <Textarea
                  value={reason}
                  onChange={e => { setReason(e.target.value); setReasonError('') }}
                  placeholder={locale === 'en' ? 'Reason for this change (min 10 chars)…' : 'دلیل این تغییر (حداقل ۱۰ حرف)…'}
                  rows={3}
                />
                {reasonError && <p className="text-xs text-destructive">{reasonError}</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditState(null)}>
              {locale === 'en' ? 'Cancel' : 'لغو'}
            </Button>
            <Button onClick={handleReasonSave}>
              {locale === 'en' ? 'Save' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function AttendanceGridSkeleton() {
  return (
    <div className="divide-y rounded-lg border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="flex gap-1.5">
            {Array.from({ length: 5 }).map((_, j) => <Skeleton key={j} className="h-9 w-12 rounded-md" />)}
          </div>
        </div>
      ))}
    </div>
  )
}
