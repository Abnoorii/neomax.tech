'use client'

import { getDB } from './db'

export async function syncPendingAttendance(): Promise<{ synced: number; failed: number }> {
  const db = getDB()
  const pending = await db.attendance.where('syncStatus').equals('pending').toArray()
  let synced = 0, failed = 0

  for (const entry of pending) {
    try {
      const res = await fetch('/api/attendance/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (res.ok) {
        await db.attendance.update(entry.id!, { syncStatus: 'synced' })
        synced++
      } else {
        const { error } = await res.json()
        await db.attendance.update(entry.id!, { syncStatus: 'failed', errorMessage: error })
        failed++
      }
    } catch {
      await db.attendance.update(entry.id!, { syncStatus: 'failed', errorMessage: 'Network error' })
      failed++
    }
  }
  return { synced, failed }
}

export async function syncPendingProduction(): Promise<{ synced: number; failed: number }> {
  const db = getDB()
  const pending = await db.production.where('syncStatus').equals('pending').toArray()
  let synced = 0, failed = 0

  for (const entry of pending) {
    try {
      const res = await fetch('/api/production/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (res.ok) {
        await db.production.update(entry.id!, { syncStatus: 'synced' })
        synced++
      } else {
        const { error } = await res.json()
        await db.production.update(entry.id!, { syncStatus: 'failed', errorMessage: error })
        failed++
      }
    } catch {
      await db.production.update(entry.id!, { syncStatus: 'failed', errorMessage: 'Network error' })
      failed++
    }
  }
  return { synced, failed }
}

export async function syncAll() {
  const [att, prod] = await Promise.all([
    syncPendingAttendance(),
    syncPendingProduction(),
  ])
  return { synced: att.synced + prod.synced, failed: att.failed + prod.failed }
}
