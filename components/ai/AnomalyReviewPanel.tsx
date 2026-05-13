'use client'

import { useState, useTransition } from 'react'
import { AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { reviewPayrollAnomalies, type AnomalyResult } from '@/app/actions/ai'

interface Props {
  runId: string
  locale: string
}

const SEVERITY_STYLES: Record<AnomalyResult['severity'], string> = {
  high:   'border-red-500/50 bg-red-50 dark:bg-red-950/20',
  medium: 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/20',
  low:    'border-slate-300 bg-slate-50 dark:bg-slate-900/20',
}

const SEVERITY_BADGE: Record<AnomalyResult['severity'], string> = {
  high:   'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  low:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
}

const LABEL = {
  en:   { run: 'Run Review', running: 'Analyzing…', none: 'No anomalies detected.', severity: { high: 'High', medium: 'Medium', low: 'Low' } },
  dari: { run: 'بررسی', running: 'در حال تحلیل…', none: 'هیچ ناهنجاری‌ای یافت نشد.', severity: { high: 'بالا', medium: 'متوسط', low: 'پایین' } },
} as const

export function AnomalyReviewPanel({ runId, locale }: Props) {
  const isRTL = locale !== 'en'
  const t = LABEL[locale === 'en' ? 'en' : 'dari']
  const [results, setResults] = useState<AnomalyResult[] | null>(null)
  const [pending, startTransition] = useTransition()

  function run() {
    startTransition(async () => {
      try {
        const data = await reviewPayrollAnomalies(runId)
        setResults(data)
      } catch {
        setResults([])
      }
    })
  }

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={run} disabled={pending} variant="outline">
          {pending
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin me-1" />{t.running}</>
            : <><RefreshCw className="h-3.5 w-3.5 me-1" />{t.run}</>}
        </Button>
      </div>

      {results !== null && (
        results.length === 0
          ? (
            <div className="flex items-center gap-2 rounded-lg border bg-green-50 dark:bg-green-950/20 px-3 py-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4 shrink-0" />
              {t.none}
            </div>
          )
          : (
            <div className="space-y-2">
              {results.map(r => (
                <div key={r.employeeId} className={cn('rounded-lg border px-3 py-2 text-sm', SEVERITY_STYLES[r.severity])}>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">{r.name}</span>
                    <span className="text-xs font-mono text-muted-foreground">{r.empCode}</span>
                    <span className={cn('ms-auto text-xs px-1.5 py-0.5 rounded-full font-medium', SEVERITY_BADGE[r.severity])}>
                      {t.severity[r.severity]}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-xs text-muted-foreground">
                    {r.anomalies.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          )
      )}
    </div>
  )
}
