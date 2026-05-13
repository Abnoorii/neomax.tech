import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { DisburseForm } from '@/components/advances/DisburseForm'
import { AdvancesLedger } from '@/components/advances/AdvancesLedger'

interface PageProps {
  params: Promise<{ locale: string }>
}

type AdvanceEntry = {
  id: string
  date: string
  amount: number
  repaid_amount: number | null
  advance_type: string
  description: string | null
  status: 'active' | 'repaid' | 'waived'
}

export default async function AdvancesPage({ params }: PageProps) {
  const { locale } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  const canDisburse = can(permissions, 'advances.disburse')
  const canRepay = can(permissions, 'advances.repay')

  const { data: employees } = await supabase
    .from('employees')
    .select('id, emp_code, name_dari, name_english')
    .eq('status', 'active')
    .order('name_dari')

  const { data: advances } = await supabase
    .from('advances')
    .select('id, employee_id, date, amount, repaid_amount, advance_type, description, status')
    .order('date', { ascending: false })

  const empMap = Object.fromEntries((employees ?? []).map(e => [e.id, e]))
  const grouped: Record<string, AdvanceEntry[]> = {}

  for (const a of advances ?? []) {
    if (!grouped[a.employee_id]) grouped[a.employee_id] = []
    grouped[a.employee_id]!.push(a as AdvanceEntry)
  }

  const summaries = Object.entries(grouped)
    .map(([empId, entries]) => {
      const emp = empMap[empId]
      if (!emp) return null
      const totalDisbursed = entries.reduce((s, e) => s + (e.amount ?? 0), 0)
      const totalRepaid = entries.reduce((s, e) => s + (e.repaid_amount ?? 0), 0)
      return {
        id: empId,
        emp_code: emp.emp_code,
        name_dari: emp.name_dari,
        name_english: emp.name_english,
        entries,
        totalDisbursed,
        totalRepaid,
        outstanding: totalDisbursed - totalRepaid,
      }
    })
    .filter((s): s is NonNullable<typeof s> => s !== null)
    .sort((a, b) => b.outstanding - a.outstanding)

  const isRTL = locale !== 'en'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-xl font-bold">
          {locale === 'en' ? 'Advances Ledger' : 'دفتر پیشپرداخت‌ها'}
        </h1>
        <DisburseForm
          employees={employees ?? []}
          locale={locale}
          canDisburse={canDisburse}
        />
      </div>

      <AdvancesLedger
        summaries={summaries}
        locale={locale}
        canRepay={canRepay}
      />
    </div>
  )
}
