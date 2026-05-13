'use client'

import { useState, useTransition } from 'react'
import { Plus, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn, formatAFN } from '@/lib/utils'
import { upsertProduction } from '@/app/actions/production'
import { getDB } from '@/lib/offline/db'
import { useSyncQueue } from '@/hooks/use-sync-queue'

interface RateCard {
  work_code: string
  description_en: string
  description_dari: string
  unit_price: number
  unit_en: string
  unit_dari: string
}

interface Employee {
  id: string
  emp_code: string
  name_dari: string
  name_english: string | null
}

interface Props {
  employees: Employee[]
  rateCards: RateCard[]
  date: string
  locale: string
  canEnter: boolean
}

export function ProductionForm({ employees, rateCards, date, locale, canEnter }: Props) {
  const isRTL = locale !== 'en'
  const { isOnline, refreshCount } = useSyncQueue()
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [employeeId, setEmployeeId] = useState('')
  const [workCode, setWorkCode] = useState('')
  const [quantity, setQuantity] = useState('')
  const [notes, setNotes] = useState('')
  const [codeSearch, setCodeSearch] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const filteredRates = rateCards.filter(r =>
    r.work_code.toLowerCase().includes(codeSearch.toLowerCase()) ||
    r.description_en.toLowerCase().includes(codeSearch.toLowerCase()) ||
    r.description_dari.includes(codeSearch)
  )

  const selectedRate = rateCards.find(r => r.work_code === workCode)
  const totalValue = selectedRate && quantity ? selectedRate.unit_price * parseFloat(quantity) : 0

  function resetForm() {
    setEmployeeId('')
    setWorkCode('')
    setQuantity('')
    setNotes('')
    setCodeSearch('')
    setError('')
    setSuccess(false)
  }

  function handleSave() {
    if (!employeeId) { setError(locale === 'en' ? 'Select an employee' : 'کارمند انتخاب کنید'); return }
    if (!workCode) { setError(locale === 'en' ? 'Select a work code' : 'کد کار را انتخاب کنید'); return }
    const qty = parseFloat(quantity)
    if (!qty || qty <= 0) { setError(locale === 'en' ? 'Enter a valid quantity' : 'مقدار معتبر وارد کنید'); return }

    startTransition(async () => {
      setError('')
      try {
        const rate = rateCards.find(r => r.work_code === workCode)
        if (isOnline) {
          await upsertProduction({ employeeId, date, workCode, quantity: qty, notes: notes || null })
        } else {
          const db = getDB()
          await db.production.put({
            localId: `${employeeId}-${date}-${workCode}`,
            employeeId,
            date,
            workCode,
            quantity: qty,
            unitPrice: rate?.unit_price ?? 0,
            notes: notes || null,
            syncStatus: 'pending',
            enteredAt: new Date().toISOString(),
          })
          await refreshCount()
        }
        setSuccess(true)
        setTimeout(() => { setOpen(false); resetForm() }, 800)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }

  if (!canEnter) return null

  return (
    <>
      <Button onClick={() => { resetForm(); setOpen(true) }} size="sm" className="gap-1.5">
        <Plus className="h-4 w-4" />
        {locale === 'en' ? 'Add Entry' : 'ثبت کار'}
      </Button>

      <Dialog open={open} onOpenChange={open => { setOpen(open); if (!open) resetForm() }}>
        <DialogContent className="max-w-sm" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader>
            <DialogTitle>{locale === 'en' ? 'Production Entry' : 'ثبت تولید'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Employee */}
            <div className="space-y-1.5">
              <Label>{locale === 'en' ? 'Employee' : 'کارمند'}</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger>
                  <SelectValue placeholder={locale === 'en' ? 'Select employee…' : 'کارمند…'} />
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

            {/* Work code search */}
            <div className="space-y-1.5">
              <Label>{locale === 'en' ? 'Work Code' : 'کد کار'}</Label>
              <div className="relative">
                <Search className="absolute start-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="ps-8"
                  placeholder={locale === 'en' ? 'Search work code…' : 'جستجو…'}
                  value={codeSearch}
                  onChange={e => setCodeSearch(e.target.value)}
                />
              </div>
              <div className="border rounded-md max-h-40 overflow-y-auto divide-y">
                {filteredRates.length === 0 && (
                  <p className="text-xs text-muted-foreground p-2">
                    {locale === 'en' ? 'No results' : 'نتیجه‌ای نیست'}
                  </p>
                )}
                {filteredRates.map(r => (
                  <button
                    key={r.work_code}
                    type="button"
                    onClick={() => { setWorkCode(r.work_code); setCodeSearch('') }}
                    className={cn(
                      'w-full text-start px-3 py-2 text-sm hover:bg-accent transition-colors',
                      workCode === r.work_code && 'bg-primary/10 font-medium',
                    )}
                  >
                    <span className="font-mono text-xs text-muted-foreground me-2">{r.work_code}</span>
                    {locale === 'en' ? r.description_en : r.description_dari}
                    <span className="float-end text-muted-foreground text-xs">
                      {formatAFN(r.unit_price)}/{locale === 'en' ? r.unit_en : r.unit_dari}
                    </span>
                  </button>
                ))}
              </div>
              {selectedRate && !codeSearch && (
                <p className="text-xs text-muted-foreground">
                  {locale === 'en' ? 'Selected:' : 'انتخاب شده:'} {selectedRate.work_code} — {formatAFN(selectedRate.unit_price)}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <Label>{locale === 'en' ? 'Quantity' : 'مقدار'}</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="0"
              />
              {totalValue > 0 && (
                <p className="text-xs text-emerald-700 font-medium">
                  {locale === 'en' ? 'Total:' : 'مجموع:'} {formatAFN(totalValue)}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>{locale === 'en' ? 'Notes (optional)' : 'یادداشت (اختیاری)'}</Label>
              <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}
            {success && (
              <p className="text-xs text-emerald-700">
                {locale === 'en' ? 'Saved!' : 'ذخیره شد!'}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {locale === 'en' ? 'Cancel' : 'لغو'}
            </Button>
            <Button onClick={handleSave} disabled={pending}>
              {pending && <Loader2 className="h-3.5 w-3.5 animate-spin me-1" />}
              {locale === 'en' ? 'Save' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
