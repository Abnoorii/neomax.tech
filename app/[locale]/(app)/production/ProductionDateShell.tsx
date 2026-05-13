'use client'

import { useRouter } from 'next/navigation'
import { HijriDatePicker } from '@/components/attendance/HijriDatePicker'
import { ProductionForm } from '@/components/production/ProductionForm'
import { ProductionList } from '@/components/production/ProductionList'

interface Employee {
  id: string
  emp_code: string
  name_dari: string
  name_english: string | null
}

interface RateCard {
  work_code: string
  description_en: string
  description_dari: string
  unit_price: number
  unit_en: string
  unit_dari: string
}

interface ProductionEntry {
  id: string
  employee_id: string
  date: string
  work_code: string
  quantity: number
  unit_price: number
  notes: string | null
  entered_at: string
  employee?: { name_dari: string; emp_code: string } | null
}

interface Props {
  locale: string
  selectedDate: string
  defaultDate: string
  employees: Employee[]
  rateCards: RateCard[]
  entries: ProductionEntry[]
  canEnter: boolean
}

export function ProductionDateShell({ locale, selectedDate, defaultDate, employees, rateCards, entries, canEnter }: Props) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <HijriDatePicker
          value={selectedDate}
          onChange={iso => router.push(`/${locale}/production?date=${iso}`)}
          locale={locale}
          maxDate={defaultDate}
        />
        <ProductionForm
          employees={employees}
          rateCards={rateCards}
          date={selectedDate}
          locale={locale}
          canEnter={canEnter}
        />
      </div>
      <ProductionList entries={entries} locale={locale} selectedDate={selectedDate} />
    </div>
  )
}
