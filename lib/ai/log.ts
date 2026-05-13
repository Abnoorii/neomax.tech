import { createClient } from '@/lib/supabase/server'

interface LogEntry {
  userId: string
  feature: string
  model: string
  inputTokens?: number
  outputTokens?: number
  latencyMs?: number
  requestSummary?: string
  responseSummary?: string
}

export async function logAiCall(entry: LogEntry): Promise<void> {
  try {
    const supabase = await createClient()
    const costUsd = estimateCost(entry.model, entry.inputTokens ?? 0, entry.outputTokens ?? 0)
    await supabase.from('ai_log').insert({
      user_id: entry.userId,
      feature: entry.feature,
      model: entry.model,
      input_tokens: entry.inputTokens ?? null,
      output_tokens: entry.outputTokens ?? null,
      cost_usd: costUsd,
      latency_ms: entry.latencyMs ?? null,
      request_summary: entry.requestSummary ?? null,
      response_summary: entry.responseSummary ?? null,
    })
  } catch {
    // Never let logging failure break the main flow
  }
}

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Haiku pricing (per million tokens): input $0.80, output $4.00
  const rates: Record<string, { input: number; output: number }> = {
    'claude-haiku-4-5-20251001': { input: 0.80 / 1_000_000, output: 4.00 / 1_000_000 },
    'claude-sonnet-4-6':         { input: 3.00 / 1_000_000, output: 15.00 / 1_000_000 },
  }
  const r = rates[model] ?? rates['claude-haiku-4-5-20251001']!
  return Math.round((inputTokens * r.input + outputTokens * r.output) * 1_000_000) / 1_000_000
}
