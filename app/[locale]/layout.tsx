import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'

export const metadata: Metadata = {
  title: 'Misgaran Payroll | معاش میسگران',
  description: 'Workshop Payroll Management System',
  manifest: '/manifest.json',
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}

const RTL_LOCALES = new Set(['dari', 'pashto'])

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'dari' | 'pashto')) {
    notFound()
  }

  const messages = await getMessages()
  const dir = RTL_LOCALES.has(locale) ? 'rtl' : 'ltr'

  return (
    <NextIntlClientProvider messages={messages}>
      {/* Vazirmatn is only needed by the internal app, so it loads here rather
          than in the root layout where it would block the marketing site. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {/* lang/dir live on a wrapper because <html> belongs to the root layout. */}
      <div lang={locale} dir={dir} className="min-h-screen bg-background text-foreground">
        {children}
      </div>
    </NextIntlClientProvider>
  )
}
