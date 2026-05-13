'use client'

import { useState, useTransition } from 'react'
import { Plus, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { formatAFN } from '@/lib/utils'
import { disburseAdvance } from '@/app/actions/advances'
import { getCurrentHijriDate, toGregorianDateString } from '@/lib/hijri'

interface Employee {
  id: string
  emp_code: string
  name_dari: string
}

interface Props {
  employees: Employee[]
  locale: string
  canDisburse: boolean
  onSuccess?: () => void
}

const LARGE_ADVANCE_THRESHOLD = 5000

export function DisburseForm({ employees, locale, canDisburse, onSuccess }: Props) {
  const isRTL = locale !== 'en'
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [amount, setAmount] = useState('')
  const [advanceType, setAdvanceType] = useState<'cash' | 'kind' | 'deduction'>('cash')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ requiresApproval: boolean } | null>(null)

  const hijriToday = getCurrentHijriDate()
  const today = toGregorianDateString(hijriToday.jy, hijriToday.jm, hijriToday.jd)
  const amountNum = parseFloat(amount) || 0
  const isLarge = amountNum > LARGE_ADVANCE_THRESHOLD

  function reset() {
    setEmployeeId('')
    setAmount('')
    setAdvanceType('cash')
    setDescription('')
    setError('')
    setResult(null)
  }

  function handleSave() {
    if (!employeeId) { setError(locale === 'en' ? 'Select an employee' : 'کارمند انتخاب کنید'); return }
    if (amountNum <= 0) { setError(locale === 'en' ? 'Enter a valid amount' : 'مبلغ معتبر وارد کنید'); return }

    startTransition(async () => {
      setError('')
      try {
        const res = await disburseAdvance({
          employeeId,
          amount: amountNum,
          advanceType,
          description: description || null,
          date: today,
        })
        setResult(res)
        onSuccess?.()
        setTimeout(() => { setOpen(false); reset() }, 1500)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }

  if (!canDisburse) return null

  return (
    <>
      <Button onClick={() => { reset(); setOpen(true) }} size="sm" className="gap-1.5">
        <Plus className="h-4 w-4" />
        {locale === 'en' ? 'Disburse Advance' : 'پرداخت پیشپرداخت'}
      </Button>

      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{locale === 'en' ? 'Disburse Advance' : 'پرداخت پیشپرداخت'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{locale === 'en' ? 'Employee' : 'کارمند'}</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder={locale === 'en' ? 'Select…' : 'انتخاب…'} />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.name_dari} ({e.emp_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{locale === 'en' ? 'Amount (AFN)' : 'مبلغ (افغانی)'}</Label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
              />
              {amountNum > 0 && (
                <p className="text-xs text-muted-foreground">{formatAFN(amountNum)}</p>
              )}
              {isLarge && (
                <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {locale === 'en'
                    ? `Amount exceeds ${formatAFN(LARGE_ADVANCE_THRESHOLD)} — dual approval required`
                    : `مبلغ از ${formatAFN(LARGE_ADVANCE_THRESHOLD)} بیشتر است — تأیید دوگانه لازم است`}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>{locale === 'en' ? 'Type' : 'نوع'}</Label>
              <Select value={advanceType} onValueChange={v => setAdvanceType(v as typeof advanceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">{locale === 'en' ? 'Cash' : 'نقدی'}</SelectItem>
                  <SelectItem value="kind">{locale === 'en' ? 'In Kind' : 'جنسی'}</SelectItem>
                  <SelectItem value="deduction">{locale === 'en' ? 'Deduction' : 'کسر'}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>{locale === 'en' ? 'Description (optional)' : 'توضیح (اختیاری)'}</Label>
              <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
            {result && (
              <p className="text-xs text-emerald-700">
                {result.requiresApproval
                  ? (locale === 'en' ? 'Approval request submitted.' : 'درخواست تأیید ارسال شد.')
                  : (locale === 'en' ? 'Disbursed successfully.' : 'با موفقیت پرداخت شد.')}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {locale === 'en' ? 'Cancel' : 'لغو'}
            </Button>
            <Button onClick={handleSave} disabled={pending}>
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin me-1" />}
              {locale === 'en' ? (isLarge ? 'Submit for Approval' : 'Disburse') : (isLarge ? 'ارسال برای تأیید' : 'پرداخت')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
