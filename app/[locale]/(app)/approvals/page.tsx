import { createClient } from '@/lib/supabase/server'
import { getUserPermissions, can } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ApprovalsInbox } from './ApprovalsInbox'
import { MyRequests } from './MyRequests'

export default async function ApprovalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const permissions = await getUserPermissions(user.id)

  const canApprove = can(permissions, 'admin.manage_approvals') ||
    can(permissions, 'approval.approve_salary_change') ||
    can(permissions, 'approval.approve_payroll') ||
    can(permissions, 'approval.approve_large_advance') ||
    can(permissions, 'approval.approve_termination') ||
    can(permissions, 'approval.approve_rate_change') ||
    permissions.isAdmin

  // Pending approvals for this user
  const { data: pendingApprovals } = await supabase
    .from('approval_requests')
    .select('*, profiles!approval_requests_requested_by_fkey(full_name, full_name_dari)')
    .eq('status', 'pending')
    .neq('requested_by', user.id)  // can't approve own requests
    .order('requested_at', { ascending: false })

  // My pending requests
  const { data: myRequests } = await supabase
    .from('approval_requests')
    .select('*, profiles!approval_requests_approved_by_fkey(full_name, full_name_dari)')
    .eq('requested_by', user.id)
    .order('requested_at', { ascending: false })
    .limit(50)

  const isRTL = locale !== 'en'

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
          <CheckCircle className="h-7 w-7 text-amber-500" />
          {locale === 'en' ? 'Approvals Center' : 'مرکز تأییدیه‌ها'}
        </h1>
      </div>

      <Tabs defaultValue={canApprove ? 'pending' : 'mine'}>
        <TabsList>
          {canApprove && (
            <TabsTrigger value="pending" className="gap-2">
              {locale === 'en' ? 'Pending My Approval' : 'در انتظار تأیید من'}
              {(pendingApprovals?.length ?? 0) > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-red-500 text-white rounded-full">
                  {pendingApprovals!.length}
                </span>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="mine">
            {locale === 'en' ? 'My Requests' : 'درخواست‌های من'}
          </TabsTrigger>
        </TabsList>

        {canApprove && (
          <TabsContent value="pending">
            <ApprovalsInbox
              locale={locale}
              approvals={pendingApprovals ?? []}
              currentUserId={user.id}
            />
          </TabsContent>
        )}

        <TabsContent value="mine">
          <MyRequests locale={locale} requests={myRequests ?? []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
