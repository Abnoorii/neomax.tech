'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Layers } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { createRateCardEntry, requestRateCardChange, bulkRateCardAdjustment } from '@/app/actions/rate-card'
import { useToast } from '@/hooks/use-toast'
import { formatAFN } from '@/lib/utils'

interface RateCard {
  id: string; work_code: string; description_dari: string; description_en: string | null
  category: string | null; unit_price: number; effective_from: string; effective_to: string | null
}

interface Props {
  locale: string; rates: RateCard[]
  canCreate: boolean; canEdit: boolean; canBulk: boolean
}

const CATEGORIES = ['casting', 'forming', 'polishing', 'finishing', 'other']

type DialogMode = 'create' | 'edit' | 'bulk' | null

export function RateCardTable({ locale, rates, canCreate, canEdit, canBulk }: Props) {
  const [mode, setMode] = useState<DialogMode>(null)
  const [selected, setSelected] = useState<RateCard | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const isRTL = locale !== 'en'

  const grouped = rates.reduce<Record<string, RateCard[]>>((acc, r) => {
    const cat = r.category ?? 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  function toggleId(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      try {
        if (mode === 'create') {
          fd.set('effective_from', new Date().toISOString().split('T')[0])
          await createRateCardEntry(fd)
          toast({ title: locale === 'en' ? 'Rate card entry created' : 'ورودی کارت نرخ ایجاد شد' })
        } else if (mode === 'edit' && selected) {
          await requestRateCardChange(selected.id, fd, fd.get('reason') as string)
          toast({ title: locale === 'en' ? 'Rate change submitted for approval' : 'درخواست تغییر نرخ ارسال شد' })
        } else if (mode === 'bulk') {
          await bulkRateCardAdjustment(
            Array.from(selectedIds),
            Number(fd.get('percentage')),
            fd.get('reason') as string
          )
          toast({ title: locale === 'en' ? 'Bulk adjustment submitted for approval' : 'تعدیل گروهی ارسال شد' })
          setSelectedIds(new Set())
        }
        setMode(null)
      } catch (err) {
        toast({ title: String(err), variant: 'destructive' })
      }
    })
  }

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex gap-2 justify-end">
        {canBulk && selectedIds.size > 0 && (
          <Button variant="outline" size="sm" onClick={() => setMode('bulk')}>
            <Layers className="h-4 w-4" />
            {locale === 'en' ? `Bulk Adjust (${selectedIds.size})` : `تعدیل گروهی (${selectedIds.size})`}
          </Button>
        )}
        {canCreate && (
          <Button size="sm" onClick={() => { setSelected(null); setMode('create') }}>
            <Plus className="h-4 w-4" />
            {locale === 'en' ? 'Add Rate' : 'افزودن نرخ'}
          </Button>
        )}
      </div>

      {CATEGORIES.filter(cat => grouped[cat]?.length > 0).map(cat => (
        <div key={cat} className="border rounded-lg overflow-hidden">
          <div className="bg-slate-50 px-4 py-2 border-b">
            <h3 className="text-sm font-semibold text-slate-700 capitalize">{cat}</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                {(canBulk) && <TableHead className="w-10"></TableHead>}
                <TableHead>{locale === 'en' ? 'Code' : 'کد'}</TableHead>
                <TableHead>{locale === 'en' ? 'Description' : 'توضیحات'}</TableHead>
                <TableHead>{locale === 'en' ? 'Unit Price' : 'نرخ واحد'}</TableHead>
                <TableHead>{locale === 'en' ? 'Effective From' : 'از تاریخ'}</TableHead>
                {canEdit && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(grouped[cat] ?? []).map(rate => (
                <TableRow key={rate.id}>
                  {canBulk && (
                    <TableCell>
                      <Checkbox checked={selectedIds.has(rate.id)} onCheckedChange={() => toggleId(rate.id)} />
                    </TableCell>
                  )}
                  <TableCell className="font-mono text-xs font-medium">{rate.work_code}</TableCell>
                  <TableCell>
                    <p className="font-[Vazirmatn] text-sm">{rate.description_dari}</p>
                    {rate.description_en && <p className="text-xs text-slate-400">{rate.description_en}</p>}
                  </TableCell>
                  <TableCell className="font-semibold text-sm">{formatAFN(rate.unit_price, locale as 'en' | 'dari')}</TableCell>
                  <TableCell className="text-xs text-slate-500">{rate.effective_from}</TableCell>
                  {canEdit && (
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => { setSelected(rate); setMode('edit') }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

      {/* Create Dialog */}
      <Dialog open={mode === 'create'} onOpenChange={o => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{locale === 'en' ? 'Add Rate Card Entry' : 'افزودن نرخ'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{locale === 'en' ? 'Work Code *' : 'کد کار *'}</Label>
                <Input name="work_code" placeholder="DR-M10-Lit" required />
              </div>
              <div className="space-y-2">
                <Label>{locale === 'en' ? 'Category' : 'دسته‌بندی'}</Label>
                <select name="category" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{locale === 'en' ? 'Description (Dari) *' : 'توضیحات (دری) *'}</Label>
                <Input name="description_dari" required dir="rtl" className="font-[Vazirmatn]" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>{locale === 'en' ? 'Description (English)' : 'توضیحات (انگلیسی)'}</Label>
                <Input name="description_en" />
              </div>
              <div className="space-y-2">
                <Label>{locale === 'en' ? 'Unit Price (AFN) *' : 'نرخ واحد (افغانی) *'}</Label>
                <Input name="unit_price" type="number" min="0" step="0.01" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>{locale === 'en' ? 'Cancel' : 'لغو'}</Button>
              <Button type="submit" disabled={isPending}>{isPending ? '...' : (locale === 'en' ? 'Create' : 'ایجاد')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit (Rate Change Request) Dialog */}
      <Dialog open={mode === 'edit'} onOpenChange={o => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === 'en' ? 'Request Rate Change' : 'درخواست تغییر نرخ'}
              {selected && <span className="block text-sm font-mono font-normal text-slate-500 mt-1">{selected.work_code}</span>}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-4 items-center text-sm bg-slate-50 p-3 rounded-md">
              <span className="text-slate-500">{locale === 'en' ? 'Current price:' : 'نرخ فعلی:'}</span>
              <span className="font-semibold">{selected && formatAFN(selected.unit_price, locale as 'en' | 'dari')}</span>
            </div>
            <div className="space-y-2">
              <Label>{locale === 'en' ? 'New Unit Price (AFN) *' : 'نرخ واحد جدید (افغانی) *'}</Label>
              <Input name="unit_price" type="number" min="0" step="0.01" defaultValue={selected?.unit_price} required />
            </div>
            <div className="space-y-2">
              <Label>{locale === 'en' ? 'Reason *' : 'دلیل *'}</Label>
              <Textarea name="reason" required rows={3} />
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
              {locale === 'en'
                ? 'This creates a new versioned row. The old rate is preserved for historical payroll. Requires Finance approval.'
                : 'این یک ردیف نسخه‌بندی شده جدید ایجاد می‌کند. نرخ قدیمی برای معاش تاریخی حفظ می‌شود. نیاز به تأیید مالی دارد.'}
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>{locale === 'en' ? 'Cancel' : 'لغو'}</Button>
              <Button type="submit" disabled={isPending}>{isPending ? '...' : (locale === 'en' ? 'Submit Request' : 'ارسال درخواست')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Adjustment Dialog */}
      <Dialog open={mode === 'bulk'} onOpenChange={o => !o && setMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {locale === 'en' ? `Bulk Rate Adjustment (${selectedIds.size} rates)` : `تعدیل گروهی نرخ (${selectedIds.size} نرخ)`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{locale === 'en' ? 'Percentage Change *' : 'درصد تغییر *'}</Label>
              <div className="flex gap-2 items-center">
                <Input name="percentage" type="number" step="0.1" placeholder="+5 or -10" required className="w-32" />
                <span className="text-slate-500">%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{locale === 'en' ? 'Reason *' : 'دلیل *'}</Label>
              <Textarea name="reason" required rows={3} />
            </div>
            <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
              {locale === 'en' ? 'Requires Finance dual approval before taking effect.' : 'نیاز به تأیید دوگانه مالی قبل از اجرا دارد.'}
            </p>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMode(null)}>{locale === 'en' ? 'Cancel' : 'لغو'}</Button>
              <Button type="submit" disabled={isPending}>{isPending ? '...' : (locale === 'en' ? 'Submit for Approval' : 'ارسال برای تأیید')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
