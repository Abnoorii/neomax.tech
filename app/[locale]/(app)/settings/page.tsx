import { Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const profile = user
    ? (await supabase.from('profiles').select('*').eq('id', user.id).single()).data
    : null

  const isRTL = locale !== 'en'

  return (
    <div className="space-y-6 max-w-2xl" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
          <Settings className="h-7 w-7 text-amber-500" />
          {locale === 'en' ? 'Settings' : 'تنظیمات'}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {locale === 'en' ? 'Profile' : 'پروفایل'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <div className="flex justify-between">
            <span className="font-medium">{locale === 'en' ? 'Email' : 'ایمیل'}</span>
            <span>{user?.email ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">{locale === 'en' ? 'Language' : 'زبان'}</span>
            <span>{profile?.language ?? 'dari'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">{locale === 'en' ? 'Admin' : 'مدیر'}</span>
            <span>{profile?.is_admin ? (locale === 'en' ? 'Yes' : 'بله') : (locale === 'en' ? 'No' : 'خیر')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
