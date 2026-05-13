'use client'

import { Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react'
import { useSyncQueue } from '@/hooks/use-sync-queue'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Props { locale: string }

export function SyncIndicator({ locale }: Props) {
  const { pendingCount, isSyncing, isOnline, sync } = useSyncQueue()

  if (isOnline && pendingCount === 0 && !isSyncing) return null

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md border',
      !isOnline && 'bg-slate-100 text-slate-600 border-slate-300',
      isOnline && pendingCount > 0 && 'bg-amber-50 text-amber-700 border-amber-300',
      isSyncing && 'bg-blue-50 text-blue-700 border-blue-300',
    )}>
      {!isOnline
        ? <><WifiOff className="h-3.5 w-3.5" />{locale === 'en' ? 'Offline' : 'آفلاین'}</>
        : isSyncing
        ? <><RefreshCw className="h-3.5 w-3.5 animate-spin" />{locale === 'en' ? 'Syncing…' : 'همگام‌سازی…'}</>
        : pendingCount > 0
        ? <>
            <RefreshCw className="h-3.5 w-3.5" />
            {locale === 'en' ? `${pendingCount} unsynced` : `${pendingCount} همگام نشده`}
            <Button size="sm" variant="ghost" className="h-5 px-1 text-xs" onClick={sync}>
              {locale === 'en' ? 'Sync' : 'همگام'}
            </Button>
          </>
        : null
      }
    </div>
  )
}
