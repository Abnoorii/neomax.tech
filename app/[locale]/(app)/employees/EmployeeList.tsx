'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Plus, Search, Pencil, MoreHorizontal, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createEmployee, updateEmployee, requestSalaryChange, changeEmployeeStatus } from '@/app/actions/employees'
import { useToast } from '@/hooks/use-toast'
import { formatAFN } from '@/lib/utils'
import type { PayType, EmpStatus } from '@/types/database'

interface Employee {
  id: string; emp_code: string; name_dari: string; name_english: string | null
  father_name: string; phone: string | null; national_id: string | null; status: EmpStatus; pay_type: PayType
  base_salary: number; daily_rate: number; transport_rate: number; food_deduction_daily: number
  section_id: string | null; job_id: string; workshop_id: string; hire_date: string | null; notes: string | null
  sections: { code: string; name_en: string; name_dari: string } | null
  jobs: { code: string; name_en: string; name_dari: string } | null
  workshops: { name: string } | null
}
interface Section { id: string; code: string; name_en: string; name_dari: string; workshop_id: string }
interface Job { id: string; code: string; name_en: string; name_dari: string }
interface Workshop { id: string; name: string }

interface Props {
  locale: string
  employees: Employee[]
  sections: Section[]
  jobs: Job[]
  workshops: Workshop[]
  canCreate: boolean; canEdit: boolean; canChangeSalary: boolean; canChangeStatus: boolean
  filters: { search?: string; section?: string; status?: string; pay_type?: string }
}

const statusColors: Record<EmpStatus, string> = {
  active: 'success', inactive: 'warning', suspended: 'warning', terminated: 'destructive',
} as const

const payTypeLabels: Record<string, { en: string; dari: string }> = {
  fixed: { en: 'Fixed', dari: 'ثابت' },
  daily: { en: 'Daily', dari: 'روزانه' },
  piece_rate: { en: 'Piece Rate', dari: 'کاری' },
  mixed: { en: 'Mixed', dari: 'مختلط' },
}

type DialogMode = 'create' | 'edit' | 'salary' | 'status' | null

export function EmployeeList({ locale, employees, sections, jobs, workshops, canCreate, canEdit, canChangeSalary, canChangeStatus, filters }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<DialogMode>(null)
  const [selected, setSelected] = useState<Employee | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isRTL = locale !== 'en'

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== 'all') params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params}`)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (mode === 'create') {
          await createEmployee(fd)
          toast({ title: locale === 'en' ? 'Employee created' : 'کارمند ایجاد شد' })
        } else if (mode === 'edit' && selected) {
          await updateEmployee(selected.id, fd)
          toast({ title: locale === 'en' ? 'Employee updated' : 'کارمند بروزرسانی شد' })
        } else if (mode === 'salary' && selected) {
          await requestSalaryChange(
            selected.id,
            Number(fd.get('base_salary')),
            Number(fd.get('daily_rate')),
            fd.get('reason') as string
          )
          toast({ title: locale === 'en' ? 'Salary change submitted for approval' : 'درخواست تغییر معاش ارسال شد' })
        } else if (mode === 'status' && selected) {
          const result = await changeEmployeeStatus(
            selected.id,
            fd.get('new_status') as EmpStatus,
            fd.get('reason') as string
          )
          if (result.pending) {
            toast({ title: locale === 'en' ? 'Termination submitted for approval' : 'درخواست برکناری ارسال شد' })
          } else {
            toast({ title: locale === 'en' ? 'Status updated' : 'وضعیت بروزرسانی شد' })
          }
        }
        setMode(null)
      } catch (err) {
        toast({ title: String(err), variant: 'destructive' })
      }
    })
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={locale === 'en' ? 'Search by name or code…' : 'جستجو بر اساس نام یا کد…'}
            defaultValue={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        <Select defaultValue={filters.section || 'all'} onValueChange={v => updateFilter('section', v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={locale === 'en' ? 'Section' : 'بخش'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === 'en' ? 'All Sections' : 'همه بخش‌ها'}</SelectItem>
            {sections.map(s => <SelectItem key={s.id} value={s.id}>{locale === 'en' ? s.name_en : s.name_dari}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select defaultValue={filters.status || 'all'} onValueChange={v => updateFilter('status', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={locale === 'en' ? 'Status' : 'وضعیت'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === 'en' ? 'All Statuses' : 'همه'}</SelectItem>
            {['active', 'inactive', 'suspended', 'terminated'].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select defaultValue={filters.pay_type || 'all'} onValueChange={v => updateFilter('pay_type', v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder={locale === 'en' ? 'Pay Type' : 'نوع معاش'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{locale === 'en' ? 'All Types' : 'همه'}</SelectItem>
            {Object.entries(payTypeLabels).map(([v, l]) => (
              <SelectItem key={v} value={v}>{locale === 'en' ? l.en : l.dari}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {canCreate && (
          <Button onClick={() => { setSelected(null); setMode('create') }} size="sm">
            <Plus className="h-4 w-4" />
            {locale === 'en' ? 'Add Employee' : 'افزودن کارمند'}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{locale === 'en' ? 'Code' : 'کد'}</TableHead>
              <TableHead>{locale === 'en' ? 'Name' : 'نام'}</TableHead>
              <TableHead>{locale === 'en' ? 'Section' : 'بخش'}</TableHead>
              <TableHead>{locale === 'en' ? 'Job' : 'وظیفه'}</TableHead>
              <TableHead>{locale === 'en' ? 'Pay Type' : 'نوع معاش'}</TableHead>
              <TableHead>{locale === 'en' ? 'Salary' : 'معاش'}</TableHead>
              <TableHead>{locale === 'en' ? 'Status' : 'وضعیت'}</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-slate-400 py-12">
                  {locale === 'en' ? 'No employees found.' : 'کارمندی یافت نشد.'}
                </TableCell>
              </TableRow>
            ) : (
              employees.map(emp => (
                <TableRow key={emp.id}>
                  <TableCell className="font-mono text-xs">{emp.emp_code}</TableCell>
                  <TableCell>
                    <div className="font-medium font-[Vazirmatn]">{emp.name_dari}</div>
                    {emp.name_english && <div className="text-xs text-slate-400">{emp.name_english}</div>}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {locale === 'en' ? emp.sections?.name_en : emp.sections?.name_dari ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {locale === 'en' ? emp.jobs?.name_en : emp.jobs?.name_dari ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {locale === 'en' ? payTypeLabels[emp.pay_type]?.en : payTypeLabels[emp.pay_type]?.dari}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm font-mono">
                    {emp.pay_type === 'piece_rate' ? '—' : formatAFN(emp.base_salary || emp.daily_rate, locale as 'en' | 'dari')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusColors[emp.status] as 'success' | 'warning' | 'destructive'}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {canEdit && (
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(emp); setMode('edit') }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {canChangeSalary && emp.pay_type !== 'piece_rate' && (
                        <Button variant="ghost" size="sm" onClick={() => { setSelected(emp); setMode('salary') }}>
                          <TrendingUp className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={mode === 'create' || mode === 'edit'} onOpenChange={o => !o && setMode(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {mode === 'create' ? (locale === 'en' ? 'Add Employee' : 'افزودن کارمند') : (locale === 'en' ? 'Edit Employee' : 'ویرایش کارمند')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {mode === 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="emp_code">{locale === 'en' ? 'Employee Code *' : 'کد کارمند *'}</Label>
                  <Input id="emp_code" name="emp_code" placeholder="EMP-001" required />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name_dari">{locale === 'en' ? 'Name (Dari) *' : 'نام (دری) *'}</Label>
                <Input id="name_dari" name="name_dari" defaultValue={selected?.name_dari} required dir="rtl" className="font-[Vazirmatn]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name_english">{locale === 'en' ? 'Name (English)' : 'نام (انگلیسی)'}</Label>
                <Input id="name_english" name="name_english" defaultValue={selected?.name_english ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="father_name">{locale === 'en' ? "Father's Name *" : 'نام پدر *'}</Label>
                <Input id="father_name" name="father_name" defaultValue={selected?.father_name} required dir="rtl" className="font-[Vazirmatn]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{locale === 'en' ? 'Phone' : 'تلفن'}</Label>
                <Input id="phone" name="phone" defaultValue={selected?.phone ?? ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="national_id">{locale === 'en' ? 'National ID' : 'کارت ملی'}</Label>
                <Input id="national_id" name="national_id" defaultValue={selected?.national_id ?? ''} />
              </div>

              {/* Workshop */}
              <div className="space-y-2">
                <Label htmlFor="workshop_id">{locale === 'en' ? 'Workshop *' : 'کارگاه *'}</Label>
                <select name="workshop_id" id="workshop_id" required defaultValue={selected?.workshop_id ?? workshops[0]?.id}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {workshops.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>

              {/* Section */}
              <div className="space-y-2">
                <Label htmlFor="section_id">{locale === 'en' ? 'Section' : 'بخش'}</Label>
                <select name="section_id" id="section_id" defaultValue={selected?.section_id ?? ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">{locale === 'en' ? 'No section' : 'بخش ندارد'}</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{locale === 'en' ? s.name_en : s.name_dari}</option>)}
                </select>
              </div>

              {/* Job */}
              <div className="space-y-2">
                <Label htmlFor="job_id">{locale === 'en' ? 'Job Title *' : 'وظیفه *'}</Label>
                <select name="job_id" id="job_id" required defaultValue={selected?.job_id ?? ''}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">{locale === 'en' ? 'Select job...' : 'وظیفه را انتخاب کنید...'}</option>
                  {jobs.map(j => <option key={j.id} value={j.id}>{locale === 'en' ? j.name_en : j.name_dari}</option>)}
                </select>
              </div>

              {/* Pay Type */}
              <div className="space-y-2">
                <Label htmlFor="pay_type">{locale === 'en' ? 'Pay Type *' : 'نوع معاش *'}</Label>
                <select name="pay_type" id="pay_type" required defaultValue={selected?.pay_type ?? 'fixed'}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {Object.entries(payTypeLabels).map(([v, l]) => (
                    <option key={v} value={v}>{locale === 'en' ? l.en : l.dari}</option>
                  ))}
                </select>
              </div>

              {/* Financial fields — hidden in edit mode (salary change is separate) */}
              {mode === 'create' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="base_salary">{locale === 'en' ? 'Base Salary (AFN)' : 'معاش پایه (افغانی)'}</Label>
                    <Input id="base_salary" name="base_salary" type="number" min="0" defaultValue="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="daily_rate">{locale === 'en' ? 'Daily Rate (AFN)' : 'نرخ روزانه (افغانی)'}</Label>
                    <Input id="daily_rate" name="daily_rate" type="number" min="0" defaultValue="0" />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="transport_rate">{locale === 'en' ? 'Transport/Day (AFN)' : 'کرایه روزانه (افغانی)'}</Label>
                <Input id="transport_rate" name="transport_rate" type="number" min="0" defaultValue={selected?.transport_rate ?? 0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="food_deduction_daily">{locale === 'en' ? 'Food Deduction/Day (AFN)' : 'کسر غذا روزانه (افغانی)'}</Label>
                <Input id="food_deduction_daily" name="food_deduction_daily" type="number" min="0" defaultValue={selected?.food_deduction_daily ?? 0} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hire_date">{locale === 'en' ? 'Hire Date' : 'تاریخ استخدام'}</Label>
                <Input id="hire_date" name="hire_date" type="date" defaultValue={selected?.hire_date ?? ''} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="notes">{locale === 'en' ? 'Notes' : 'یادداشت'}</Label>
                <Textarea id="notes" name="notes" rows={2} defaultValue={selected?.notes ?? ''} />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>{locale === 'en' ? 'Cancel' : 'لغو'}</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '...' : (mode === 'create' ? (locale === 'en' ? 'Create' : 'ایجاد') : (locale === 'en' ? 'Save' : 'ذخیره'))}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Salary Change Dialog */}
      <Dialog open={mode === 'salary'} onOpenChange={o => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === 'en' ? 'Request Salary Change' : 'درخواست تغییر معاش'}
              {selected && <span className="block text-sm font-normal text-slate-500 mt-1 font-[Vazirmatn]">{selected.name_dari} ({selected.emp_code})</span>}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{locale === 'en' ? 'New Base Salary (AFN)' : 'معاش پایه جدید (افغانی)'}</Label>
                <Input name="base_salary" type="number" min="0" defaultValue={selected?.base_salary} />
              </div>
              <div className="space-y-2">
                <Label>{locale === 'en' ? 'New Daily Rate (AFN)' : 'نرخ روزانه جدید (افغانی)'}</Label>
                <Input name="daily_rate" type="number" min="0" defaultValue={selected?.daily_rate} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{locale === 'en' ? 'Reason for Change *' : 'دلیل تغییر *'}</Label>
              <Textarea name="reason" required rows={3} placeholder={locale === 'en' ? 'Explain why this salary change is needed…' : 'دلیل تغییر معاش را توضیح دهید…'} />
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
              {locale === 'en'
                ? 'This request will be sent to Finance for dual approval before taking effect.'
                : 'این درخواست برای تأیید دوگانه به مالی ارسال می‌شود.'}
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>{locale === 'en' ? 'Cancel' : 'لغو'}</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? '...' : (locale === 'en' ? 'Submit Request' : 'ارسال درخواست')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
