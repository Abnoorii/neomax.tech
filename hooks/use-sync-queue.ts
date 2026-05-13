'use client'

import { useCallback, useEffect, useState } from 'react'
import { getPendingCount } from '@/lib/offline/db'
import { syncAll } from '@/lib/offline/sync'
import { useOnline } from './use-online'

export function useSyncQueue() {
  const isOnline = useOnline()
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<{ synced: number; failed: number } | null>(null)

  const refreshCount = useCallback(async () => {
    if (typeof window === 'undefined') return
    try {
      const count = await getPendingCount()
      setPendingCount(count)
    } catch { /* IndexedDB not available */ }
  }, [])

  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) return
    setIsSyncing(true)
    try {
      const result = await syncAll()
      setLastSyncResult(result)
      await refreshCount()
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, refreshCount])

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingCount > 0) sync()
  }, [isOnline]) // eslint-disable-line

  useEffect(() => { refreshCount() }, [refreshCount])

  return { pendingCount, isSyncing, isOnline, sync, refreshCount, lastSyncResult }
}
