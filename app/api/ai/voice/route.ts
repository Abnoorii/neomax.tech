import { NextRequest, NextResponse } from 'next/server'
import { parseVoiceProductionEntry } from '@/app/actions/ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      transcript: string
      workCodes: { code: string; description: string; unitPrice: number }[]
      locale: string
    }

    if (!body.transcript?.trim()) {
      return NextResponse.json({ error: 'EMPTY_TRANSCRIPT' }, { status: 400 })
    }

    const result = await parseVoiceProductionEntry(
      body.transcript,
      body.workCodes ?? [],
      body.locale ?? 'dari',
    )

    return NextResponse.json(result)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'ERROR'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
