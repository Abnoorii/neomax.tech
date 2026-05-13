'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  toHijri,
  fromHijri,
  hijriMonthName,
  HIJRI_MONTHS_EN,
  HIJRI_MONTHS_DARI,
} from '@/lib/hijri'
import { cn } from '@/lib/utils'
import jalaali from 'jalaali-js'

interface Props {
  value: string       // ISO date string YYYY-MM-DD
  onChange: (iso: string) => void
  locale: string
  disabled?: boolean
  minDate?: string
  maxDate?: string
}

function isoToHijri(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  const { jy, jm, jd } = jalaali.toJalaali(y, m, d)
  return { jy, jm, jd }
}

function hijriToIso(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

function daysInMonth(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm)
}

export function HijriDatePicker({ value, onChange, locale, disabled, minDate, maxDate }: Props) {
  const isRTL = locale !== 'en'
  const { jy: selY, jm: selM, jd: selD } = isoToHijri(value)
  const [viewY, setViewY] = useState(selY)
  const [viewM, setViewM] = useState(selM)
  const [open, setOpen] = useState(false)

  const months = locale === 'en' ? HIJRI_MONTHS_EN : HIJRI_MONTHS_DARI

  function prevMonth() {
    if (viewM === 1) { setViewY(y => y - 1); setViewM(12) }
    else setViewM(m => m - 1)
  }
  function nextMonth() {
    if (viewM === 12) { setViewY(y => y + 1); setViewM(1) }
    else setViewM(m => m + 1)
  }

  function selectDay(d: number) {
    const iso = hijriToIso(viewY, viewM, d)
    if (minDate && iso < minDate) return
    if (maxDate && iso > maxDate) return
    onChange(iso)
    setOpen(false)
  }

  const totalDays = daysInMonth(viewY, viewM)
  // Jalaali week starts Saturday (6) → map to 0-based offset
  const { gy: firstGy, gm: firstGm, gd: firstGd } = jalaali.toGregorian(viewY, viewM, 1)
  const firstDow = new Date(firstGy, firstGm - 1, firstGd).getDay() // 0=Sun
  // Afghan week: Sat=0 … Fri=6
  const offset = (firstDow + 1) % 7

  const dayLabel = locale === 'en'
    ? `${months[selM - 1]} ${selD}, ${selY}`
    : `${selD} ${months[selM - 1]} ${selY}`

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        className={cn('min-w-[160px] justify-start gap-2 font-normal', isRTL && 'flex-row-reverse')}
        onClick={() => { setViewY(selY); setViewM(selM); setOpen(true) }}
      >
        <Calendar className="h-4 w-4 shrink-0" />
        <span>{dayLabel}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xs p-0" dir={isRTL ? 'rtl' : 'ltr'}>
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={isRTL ? nextMonth : prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold">
                {months[viewM - 1]} {viewY}
              </span>
              <Button variant="ghost" size="icon" onClick={isRTL ? prevMonth : nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="px-3 pb-4">
            {/* Weekday headers: Sat Sun Mon Tue Wed Thu Fri */}
            <div className="grid grid-cols-7 mb-1">
              {(locale === 'en'
                ? ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr']
                : ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']
              ).map(d => (
                <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: totalDays }, (_, i) => i + 1).map(d => {
                const iso = hijriToIso(viewY, viewM, d)
                const isSelected = viewY === selY && viewM === selM && d === selD
                const isDisabled = (!!minDate && iso < minDate) || (!!maxDate && iso > maxDate)
                const isToday = iso === new Date().toISOString().slice(0, 10)
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => selectDay(d)}
                    className={cn(
                      'h-8 w-full rounded-md text-sm transition-colors',
                      isSelected && 'bg-primary text-primary-foreground',
                      !isSelected && isToday && 'border border-primary text-primary',
                      !isSelected && !isToday && !isDisabled && 'hover:bg-accent',
                      isDisabled && 'opacity-30 cursor-not-allowed',
                    )}
                  >
                    {d}
                  </button>
                )
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
