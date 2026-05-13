import { redirect } from 'next/navigation'
import { Bot, MessageSquare, AlertTriangle, Mic, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { hijriMonthName } from '@/lib/hijri'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NLQueryPanel } from '@/components/ai/NLQueryPanel'
import { AnomalyReviewPanel } from '@/components/ai/AnomalyReviewPanel'
import { AIUsageLog } from '@/components/ai/AIUsageLog'

interface PageProps {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ period?: string; run?: string; tab?: string }>
}

export default async function AIPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { period: periodParam, run: runParam, tab = 'nl' } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  const canNL    = can(permissions, 'ai.use_nl_reporting')
  const canLogs  = can(permissions, 'ai.view_logs')

  if (!canNL && !canLogs) redirect(`/${locale}/dashboard`)

  const localeKey = locale as 'en' | 'dari' | 'pashto'
  const isRTL = locale !== 'en'

  // Periods for NL query selector
  const { data: periods } = await supabase
    .from('accounting_periods')
    .select('id, hijri_year, hijri_month, status')
    .order('hijri_year', { ascending: false })
    .order('hijri_month', { ascending: false })

  const openPeriod = (periods ?? []).find(p => p.status === 'open')
  const selectedPeriodId = periodParam ?? openPeriod?.id ?? (periods?.[0]?.id ?? '')
  const selectedPeriod = (periods ?? []).find(p => p.id === selectedPeriodId)

  // Payroll runs for anomaly review
  const { data: runs } = await supabase
    .from('payroll_runs')
    .select('id, status, period_id, accounting_periods(hijri_year, hijri_month)')
    .order('created_at', { ascending: false })
    .limit(12)

  const selectedRunId = runParam ?? runs?.[0]?.id ?? ''

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold leading-tight">
            {locale === 'en' ? 'AI Assistant' : 'دستیار هوش مصنوعی'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {locale === 'en'
              ? 'Natural-language queries, anomaly review, voice entry'
              : 'پرسش‌های طبیعی، بررسی ناهنجاری، ورود صوتی'}
          </p>
        </div>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList className="w-full sm:w-auto">
          {canNL && (
            <>
              <TabsTrigger value="nl" className="gap-1.5">
                <MessageSquare className="h-3.5 w-3.5" />
                {locale === 'en' ? 'Query' : 'پرسش'}
              </TabsTrigger>
              <TabsTrigger value="anomaly" className="gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />
                {locale === 'en' ? 'Anomalies' : 'ناهنجاری‌ها'}
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-1.5">
                <Mic className="h-3.5 w-3.5" />
                {locale === 'en' ? 'Voice' : 'صوتی'}
              </TabsTrigger>
            </>
          )}
          {canLogs && (
            <TabsTrigger value="log" className="gap-1.5">
              <BarChart3 className="h-3.5 w-3.5" />
              {locale === 'en' ? 'Usage Log' : 'گزارش استفاده'}
            </TabsTrigger>
          )}
        </TabsList>

        {/* ── NL QUERY ── */}
        {canNL && (
          <TabsContent value="nl" className="mt-4">
            <div className="rounded-lg border p-4 space-y-4">
              {/* Period selector */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">
                  {locale === 'en' ? 'Period:' : 'دوره:'}
                </span>
                <form method="GET" className="flex items-center gap-2">
                  <input type="hidden" name="tab" value="nl" />
                  <select
                    name="period"
                    defaultValue={selectedPeriodId}
                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {(periods ?? []).map(p => (
                      <option key={p.id} value={p.id}>
                        {hijriMonthName(p.hijri_month, localeKey)} {p.hijri_year}
                        {p.status === 'open' ? (locale === 'en' ? ' (Open)' : ' (باز)') : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="h-8 px-2 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors"
                  >
                    {locale === 'en' ? 'Go' : 'برو'}
                  </button>
                </form>
                {selectedPeriod && (
                  <span className="text-xs text-muted-foreground">
                    {hijriMonthName(selectedPeriod.hijri_month, localeKey)} {selectedPeriod.hijri_year}
                  </span>
                )}
              </div>

              {selectedPeriodId
                ? <NLQueryPanel periodId={selectedPeriodId} locale={locale} />
                : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {locale === 'en' ? 'No period selected.' : 'دوره‌ای انتخاب نشده.'}
                  </p>
                )}
            </div>
          </TabsContent>
        )}

        {/* ── ANOMALY REVIEW ── */}
        {canNL && (
          <TabsContent value="anomaly" className="mt-4">
            <div className="rounded-lg border p-4 space-y-4">
              <div>
                <h2 className="font-medium text-sm">
                  {locale === 'en' ? 'Payroll Anomaly Review' : 'بررسی ناهنجاری‌های معاش'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locale === 'en'
                    ? 'AI scans the selected payroll run for unusual patterns.'
                    : 'هوش مصنوعی اجرای معاش انتخابی را برای الگوهای غیرمعمول بررسی می‌کند.'}
                </p>
              </div>

              {/* Run selector */}
              {(runs ?? []).length > 0 && (
                <form method="GET" className="flex items-center gap-2 flex-wrap">
                  <input type="hidden" name="tab" value="anomaly" />
                  <span className="text-sm text-muted-foreground">
                    {locale === 'en' ? 'Run:' : 'اجرا:'}
                  </span>
                  <select
                    name="run"
                    defaultValue={selectedRunId}
                    className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {(runs ?? []).map(r => {
                      const ap = r.accounting_periods as unknown as { hijri_year: number; hijri_month: number } | null
                      const label = ap
                        ? `${hijriMonthName(ap.hijri_month, localeKey)} ${ap.hijri_year}`
                        : r.id.slice(0, 8)
                      return (
                        <option key={r.id} value={r.id}>
                          {label} — {r.status}
                        </option>
                      )
                    })}
                  </select>
                  <button
                    type="submit"
                    className="h-8 px-2 text-sm rounded-md border border-input bg-background hover:bg-accent transition-colors"
                  >
                    {locale === 'en' ? 'Go' : 'برو'}
                  </button>
                </form>
              )}

              {selectedRunId
                ? <AnomalyReviewPanel runId={selectedRunId} locale={locale} />
                : (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {locale === 'en' ? 'No payroll runs available.' : 'هیچ اجرای معاشی موجود نیست.'}
                  </p>
                )}
            </div>
          </TabsContent>
        )}

        {/* ── VOICE ENTRY INFO ── */}
        {canNL && (
          <TabsContent value="voice" className="mt-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <h2 className="font-medium text-sm">
                  {locale === 'en' ? 'Voice Production Entry' : 'ورود صوتی تولید'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locale === 'en'
                    ? 'The microphone button is embedded in the Production Entry form. Navigate to Production to use voice input for entries in Dari, Pashto, or English.'
                    : 'دکمه میکروفون در فرم ورود تولید جاسازی شده است. برای ورود صوتی به بخش تولید بروید.'}
                </p>
              </div>
              <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                <strong>{locale === 'en' ? 'How it works:' : 'نحوه کار:'}</strong>
                {' '}
                {locale === 'en'
                  ? 'Tap the mic on the Production form → speak the work code and quantity → AI parses and pre-fills the form.'
                  : 'روی میکروفون ضربه بزنید ← کد کار و مقدار را بگویید ← هوش مصنوعی فرم را پر می‌کند.'}
              </div>
            </div>
          </TabsContent>
        )}

        {/* ── USAGE LOG ── */}
        {canLogs && (
          <TabsContent value="log" className="mt-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div>
                <h2 className="font-medium text-sm">
                  {locale === 'en' ? 'AI Usage Log' : 'گزارش استفاده از هوش مصنوعی'}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {locale === 'en' ? 'Last 50 AI calls with token counts and estimated costs.' : '۵۰ فراخوانی اخیر با تعداد توکن و هزینه تخمینی.'}
                </p>
              </div>
              <AIUsageLog locale={locale} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
