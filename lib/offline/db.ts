import Dexie, { type Table } from 'dexie'

export interface OfflineAttendance {
  id?: number
  localId: string              // uuid generated client-side
  employeeId: string
  date: string                 // YYYY-MM-DD gregorian
  status: string
  hours: number
  overtimeHours: number
  notes: string | null
  reason: string | null
  enteredAt: string
  syncStatus: 'pending' | 'synced' | 'failed'
  errorMessage?: string
}

export interface OfflineProduction {
  id?: number
  localId: string
  employeeId: string
  date: string
  rateCardId?: string
  workCode: string
  quantity: number
  unitPrice: number
  notes: string | null
  enteredAt: string
  syncStatus: 'pending' | 'synced' | 'failed'
  errorMessage?: string
}

export interface SyncMeta {
  id?: number
  key: string
  lastSyncAt: string
}

class MisgaranDB extends Dexie {
  attendance!: Table<OfflineAttendance>
  production!: Table<OfflineProduction>
  syncMeta!: Table<SyncMeta>

  constructor() {
    super('MisgaranPayroll')
    this.version(1).stores({
      attendance: '++id, localId, employeeId, date, syncStatus',
      production: '++id, localId, employeeId, date, syncStatus',
      syncMeta: '++id, key',
    })
  }
}

// Singleton — only created client-side
let _db: MisgaranDB | null = null

export function getDB(): MisgaranDB {
  if (typeof window === 'undefined') throw new Error('IndexedDB only available in browser')
  if (!_db) _db = new MisgaranDB()
  return _db
}

export async function getPendingCount(): Promise<number> {
  const db = getDB()
  const [att, prod] = await Promise.all([
    db.attendance.where('syncStatus').equals('pending').count(),
    db.production.where('syncStatus').equals('pending').count(),
  ])
  return att + prod
}
