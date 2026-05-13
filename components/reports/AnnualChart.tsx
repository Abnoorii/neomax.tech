'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { hijriMonthName } from '@/lib/hijri'
import { formatAFN } from '@/lib/utils'

interface MonthData {
  month: number
  gross: number
  net: number
  runStatus: string | null
}

interface Props {
  months: MonthData[]
  hijriYear: number
  totalGross: number
  totalNet: number
  locale: string
}

export function AnnualChart({ months, hijriYear, totalGross, totalNet, locale }: Props) {
  const localeKey = locale as 'en' | 'dari' | 'pashto'
  const data = months.map(m => ({
    name: hijriMonthName(m.month, localeKey).slice(0, 3),
    gross: m.gross,
    net: m.net,
  }))

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard
          label={locale === 'en' ? 'Year' : 'سال'}
          value={String(hijriYear)}
        />
        <SummaryCard
          label={locale === 'en' ? 'Months Processed' : 'ماه‌های پردازش شده'}
          value={String(months.filter(m => m.runStatus).length)}
        />
        <SummaryCard
          label={locale === 'en' ? 'Annual Gross' : 'ناخالص سالانه'}
          value={formatAFN(totalGross)}
          highlight
        />
        <SummaryCard
          label={locale === 'en' ? 'Annual Net' : 'خالص سالانه'}
          value={formatAFN(totalNet)}
          highlight
        />
      </div>

      {/* Bar chart */}
      <div className="rounded-lg border bg-card p-4">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
              tick={{ fontSize: 11 }}
              width={48}
            />
            <Tooltip
              formatter={(val: unknown) => formatAFN(Number(val))}
              labelStyle={{ fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar
              dataKey="gross"
              name={locale === 'en' ? 'Gross' : 'ناخالص'}
              fill="#60a5fa"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="net"
              name={locale === 'en' ? 'Net' : 'خالص'}
              fill="#34d399"
              radius={[3, 3, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${highlight ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-base font-bold mt-0.5 ${highlight ? 'text-primary' : ''}`}>{value}</p>
    </div>
  )
}
