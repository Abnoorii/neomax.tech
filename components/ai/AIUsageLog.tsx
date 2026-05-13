'use client'

import { useState, useTransition } from 'react'
import { RefreshCw, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getAiLog } from '@/app/actions/ai'

type LogRow = Awaited<ReturnType<typeof getAiLog>>[number]

interface Props {
  locale: string
}

function fmt(ms: number | null) {
  return ms != null ? `${ms}ms` : '—'
}

function fmtCost(usd: number | null) {
  if (usd == null) return '—'
  return usd < 0.001 ? '<$0.001' : `$${usd.toFixed(4)}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })
}

export function AIUsageLog({ locale }: Props) {
  const isRTL = locale !== 'en'
  const [rows, setRows] = useState<LogRow[] | null>(null)
  const [pending, startTransition] = useTransition()

  function load() {
    startTransition(async () => {
      try {
        const data = await getAiLog(50)
        setRows(data)
      } catch {
        setRows([])
      }
    })
  }

  return (
    <div className="space-y-3" dir={isRTL ? 'rtl' : 'ltr'}>
      <Button size="sm" variant="outline" onClick={load} disabled={pending}>
        {pending
          ? <><Loader2 className="h-3.5 w-3.5 animate-spin me-1" />Loading…</>
          : <><RefreshCw className="h-3.5 w-3.5 me-1" />Load Log</>}
      </Button>

      {rows !== null && (
        rows.length === 0
          ? <p className="text-sm text-muted-foreground">No AI calls logged yet.</p>
          : (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50 text-muted-foreground">
                    <th className="px-3 py-2 text-start font-medium">Feature</th>
                    <th className="px-3 py-2 text-start font-medium">Model</th>
                    <th className="px-3 py-2 text-end font-medium">In</th>
                    <th className="px-3 py-2 text-end font-medium">Out</th>
                    <th className="px-3 py-2 text-end font-medium">Cost</th>
                    <th className="px-3 py-2 text-end font-medium">Latency</th>
                    <th className="px-3 py-2 text-start font-medium">Summary</th>
                    <th className="px-3 py-2 text-start font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-1.5 font-mono">{r.feature}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{r.model?.split('-').slice(-2).join('-')}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums">{r.input_tokens ?? '—'}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums">{r.output_tokens ?? '—'}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums">{fmtCost(r.cost_usd)}</td>
                      <td className="px-3 py-1.5 text-end tabular-nums">{fmt(r.latency_ms)}</td>
                      <td className="px-3 py-1.5 text-muted-foreground max-w-[200px] truncate">{r.request_summary}</td>
                      <td className="px-3 py-1.5 text-muted-foreground whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}
    </div>
  )
}
