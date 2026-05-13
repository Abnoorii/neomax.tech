import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { BarChart3 } from 'lucide-react'
import { RateCardTable } from './RateCardTable'

export default async function RateCardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)
  if (!can(permissions, 'rate_card.view') && !permissions.isAdmin) redirect(`/${locale}/dashboard`)

  // Get current (active) rates only — effective_from <= today AND effective_to IS NULL or >= today
  const today = new Date().toISOString().split('T')[0]
  const { data: rates } = await supabase
    .from('rate_card')
    .select('*')
    .lte('effective_from', today)
    .or(`effective_to.is.null,effective_to.gte.${today}`)
    .order('category')
    .order('work_code')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
          <BarChart3 className="h-7 w-7 text-amber-500" />
          {locale === 'en' ? 'Rate Card' : 'کارت نرخ'}
        </h1>
      </div>
      <RateCardTable
        locale={locale}
        rates={rates ?? []}
        canCreate={can(permissions, 'rate_card.create') || permissions.isAdmin}
        canEdit={can(permissions, 'rate_card.edit') || permissions.isAdmin}
        canBulk={can(permissions, 'rate_card.bulk_update') || permissions.isAdmin}
      />
    </div>
  )
}
