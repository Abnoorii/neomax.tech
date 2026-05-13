'use server'

import { createClient } from '@/lib/supabase/server'
import { requirePermission } from '@/lib/permissions'
import { getAnthropicClient, MODELS } from '@/lib/ai/client'
import { logAiCall } from '@/lib/ai/log'

// ── NATURAL-LANGUAGE LABOR COST QUERY ────────────────────────────────────

export async function nlQuery(question: string, periodId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'ai.use_nl_reporting')

  if (!question || question.trim().length < 3) throw new Error('QUESTION_TOO_SHORT')

  // Gather context data for the period
  const { data: period } = await supabase
    .from('accounting_periods')
    .select('id, hijri_year, hijri_month, start_date, end_date, workshop_id')
    .eq('id', periodId)
    .single()
  if (!period) throw new Error('PERIOD_NOT_FOUND')

  const [
    { data: payslips },
    { data: employees },
    { data: sections },
  ] = await Promise.all([
    supabase
      .from('payslips')
      .select(`
        employee_id, days_present, days_absent, days_sick,
        fixed_earnings, piece_rate_earnings, overtime, transport,
        food_deduction, tax, advance_recovery, net_pay
      `)
      .eq('payroll_run_id',
        (await supabase
          .from('payroll_runs')
          .select('id')
          .eq('period_id', periodId)
          .single()
        ).data?.id ?? ''
      ),
    supabase
      .from('employees')
      .select('id, emp_code, name_dari, pay_type, section_id')
      .eq('workshop_id', period.workshop_id)
      .eq('status', 'active'),
    supabase
      .from('sections')
      .select('id, code, name_dari, name_en')
      .eq('workshop_id', period.workshop_id),
  ])

  const empMap = Object.fromEntries((employees ?? []).map(e => [e.id, e]))
  const secMap = Object.fromEntries((sections ?? []).map(s => [s.id, s]))

  const summaryRows = (payslips ?? []).map(p => {
    const emp = empMap[p.employee_id]
    const sec = emp?.section_id ? secMap[emp.section_id] : null
    return {
      emp_code: emp?.emp_code ?? '?',
      name: emp?.name_dari ?? '?',
      section: sec?.name_en ?? 'N/A',
      pay_type: emp?.pay_type ?? '?',
      present: p.days_present,
      absent: p.days_absent,
      gross: (p.fixed_earnings ?? 0) + (p.piece_rate_earnings ?? 0) + (p.overtime ?? 0) + (p.transport ?? 0),
      net: p.net_pay ?? 0,
    }
  })

  const dataContext = JSON.stringify(summaryRows, null, 0)

  const systemPrompt = `You are a payroll analyst assistant for Misgaran Workshop, an Afghan coppersmith workshop.
You answer questions about labor costs, payroll, and attendance in clear, concise language.
You have access to payroll data for the period ${period.hijri_year}/${String(period.hijri_month).padStart(2, '0')} (Solar Hijri).
All monetary values are in AFN (Afghan Afghani).
Answer in the same language as the question (Dari or English). Be precise and cite numbers.
Format numbers with commas. Keep your answer under 300 words.`

  const userMessage = `Payroll data:\n${dataContext}\n\nQuestion: ${question}`

  const t0 = Date.now()
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: MODELS.fast,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const latencyMs = Date.now() - t0
  const answer = response.content[0]?.type === 'text' ? response.content[0].text : ''

  await logAiCall({
    userId: user.id,
    feature: 'nl_query',
    model: MODELS.fast,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs,
    requestSummary: question.slice(0, 120),
    responseSummary: answer.slice(0, 120),
  })

  return { answer, latencyMs, model: MODELS.fast }
}

// ── PAYROLL ANOMALY REVIEW ────────────────────────────────────────────────

export interface AnomalyResult {
  employeeId: string
  empCode: string
  name: string
  anomalies: string[]
  severity: 'low' | 'medium' | 'high'
}

export async function reviewPayrollAnomalies(runId: string): Promise<AnomalyResult[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'ai.use_nl_reporting')

  const { data: payslips } = await supabase
    .from('payslips')
    .select(`
      employee_id, days_present, days_absent, days_sick, days_holiday,
      fixed_earnings, piece_rate_earnings, overtime, transport,
      food_deduction, tax, advance_recovery, net_pay,
      advance_opening_balance, advance_closing_balance,
      employee:employees(emp_code, name_dari, pay_type, base_salary, daily_rate)
    `)
    .eq('payroll_run_id', runId)

  if (!payslips || payslips.length === 0) return []

  const rows = payslips.map(p => {
    const emp = p.employee as unknown as { emp_code: string; name_dari: string; pay_type: string; base_salary: number; daily_rate: number } | null
    const gross = (p.fixed_earnings ?? 0) + (p.piece_rate_earnings ?? 0) + (p.overtime ?? 0) + (p.transport ?? 0)
    return {
      employee_id: p.employee_id,
      emp_code: emp?.emp_code ?? '?',
      name: emp?.name_dari ?? '?',
      pay_type: emp?.pay_type ?? '?',
      base_salary: emp?.base_salary ?? 0,
      daily_rate: emp?.daily_rate ?? 0,
      days_present: p.days_present,
      days_absent: p.days_absent ?? 0,
      days_sick: p.days_sick ?? 0,
      days_holiday: p.days_holiday ?? 0,
      gross,
      net: p.net_pay ?? 0,
      advance_opening: p.advance_opening_balance ?? 0,
      advance_closing: p.advance_closing_balance ?? 0,
    }
  })

  const dataJson = JSON.stringify(rows, null, 0)

  const systemPrompt = `You are a payroll auditor. Analyze payroll rows and return a JSON array of anomalies.
Each item: { "employee_id": string, "emp_code": string, "name": string, "anomalies": string[], "severity": "low"|"medium"|"high" }
Only include employees WITH anomalies. Keep anomaly text concise (under 80 chars each).
Detect: zero-days-present with nonzero pay, gross > 2× base salary, 100% absence with pay, advance balance growing unexpectedly, net_pay < 0, overtime > 50% of gross.
Return ONLY the JSON array, no other text.`

  const t0 = Date.now()
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: MODELS.fast,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: dataJson }],
  })

  const latencyMs = Date.now() - t0
  const raw = response.content[0]?.type === 'text' ? response.content[0].text : '[]'

  await logAiCall({
    userId: user.id,
    feature: 'anomaly_review',
    model: MODELS.fast,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs,
    requestSummary: `run_id=${runId} rows=${rows.length}`,
    responseSummary: `${raw.length} chars`,
  })

  try {
    const results = JSON.parse(raw) as AnomalyResult[]
    return Array.isArray(results) ? results : []
  } catch {
    return []
  }
}

// ── VOICE TRANSCRIPT → PRODUCTION ENTRY ──────────────────────────────────
// Called from /api/ai/voice after Whisper transcription

export async function parseVoiceProductionEntry(
  transcript: string,
  availableWorkCodes: { code: string; description: string; unitPrice: number }[],
  locale: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'ai.use_voice_entry')

  const codesContext = availableWorkCodes
    .map(w => `${w.code}: ${w.description} (${w.unitPrice} AFN/unit)`)
    .join('\n')

  const systemPrompt = `You extract production entry data from voice transcripts for Misgaran Workshop.
Available work codes:\n${codesContext}

Return ONLY a JSON object: { "work_code": string, "quantity": number, "notes": string|null, "confidence": number }
confidence is 0-1. If unclear, set confidence < 0.7.
Match the work code to the closest available code even if the worker uses informal names.
The transcript may be in Dari, Pashto, or English.`

  const t0 = Date.now()
  const client = getAnthropicClient()

  const response = await client.messages.create({
    model: MODELS.voice,
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Transcript: "${transcript}"` }],
  })

  const latencyMs = Date.now() - t0
  const raw = response.content[0]?.type === 'text' ? response.content[0].text : '{}'

  await logAiCall({
    userId: user.id,
    feature: 'voice_entry',
    model: MODELS.voice,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
    latencyMs,
    requestSummary: transcript.slice(0, 100),
    responseSummary: raw.slice(0, 80),
  })

  try {
    return JSON.parse(raw) as { work_code: string; quantity: number; notes: string | null; confidence: number }
  } catch {
    return { work_code: '', quantity: 0, notes: null, confidence: 0 }
  }
}

// ── FETCH AI USAGE LOG ────────────────────────────────────────────────────

export async function getAiLog(limit = 50) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  await requirePermission(user.id, 'ai.view_logs')

  const { data, error } = await supabase
    .from('ai_log')
    .select('id, feature, model, input_tokens, output_tokens, cost_usd, latency_ms, request_summary, response_summary, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return data ?? []
}
