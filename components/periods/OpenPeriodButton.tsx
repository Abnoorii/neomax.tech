'use client'

import { useTransition, useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { openNextPeriod } from '@/app/actions/periods'

interface Props {
  workshopId: string
  locale: string
}

export function OpenPeriodButton({ workshopId, locale }: Props) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleOpen() {
    startTransition(async () => {
      setError('')
      try {
        await openNextPeriod(workshopId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'ERROR')
      }
    })
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button size="sm" className="gap-1.5" onClick={handleOpen} disabled={pending}>
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        {locale === 'en' ? 'Open Next Period' : 'باز کردن دوره بعدی'}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
