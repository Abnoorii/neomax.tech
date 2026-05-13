'use client'

import { useState } from 'react'
import { Globe, LogOut, Menu, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TopbarProps {
  locale: string
  userEmail?: string
  userName?: string
  onMenuClick?: () => void
}

const localeLabels: Record<string, string> = {
  en: 'EN',
  dari: 'دری',
  pashto: 'پښتو',
}

export function Topbar({ locale, userEmail, userName, onMenuClick }: TopbarProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const switchLocale = (newLocale: string) => {
    const currentPath = window.location.pathname
    const pathWithoutLocale = currentPath.replace(/^\/(en|dari|pashto)/, '')
    router.push(`/${newLocale}${pathWithoutLocale}`)
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
  }

  const isRTL = locale !== 'en'

  return (
    <header
      className={cn(
        'flex items-center justify-between h-14 px-4 border-b border-slate-200 bg-white',
        isRTL && 'flex-row-reverse font-[Vazirmatn]'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>

      <div className={cn('flex items-center gap-2', isRTL && 'flex-row-reverse')}>
        {/* Language switcher */}
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Globe className="h-3.5 w-3.5 text-slate-500 mx-1" />
          {(['en', 'dari', 'pashto'] as const).map(l => (
            <button
              key={l}
              onClick={() => switchLocale(l)}
              className={cn(
                'px-2 py-0.5 text-xs rounded transition-colors',
                locale === l
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {localeLabels[l]}
            </button>
          ))}
        </div>

        {/* User menu */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm text-slate-700">
          <User className="h-4 w-4 text-slate-500" />
          <span className="hidden sm:inline max-w-32 truncate">
            {userName || userEmail || 'User'}
          </span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSignOut}
          disabled={isLoading}
          title={locale === 'en' ? 'Sign out' : 'خروج'}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
