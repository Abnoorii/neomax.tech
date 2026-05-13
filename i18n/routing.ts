import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'dari', 'pashto'],
  defaultLocale: 'dari',
  localePrefix: 'always',
})
