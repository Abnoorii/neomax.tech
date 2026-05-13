import { NextRequest, NextResponse } from 'next/server'
import { syncProductionEntry } from '@/app/actions/production'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await syncProductionEntry(body)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'UNKNOWN_ERROR'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
