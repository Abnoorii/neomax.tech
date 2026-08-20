import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * tailwind-merge has to be told about the design system's custom font sizes.
 * Without this it cannot tell `text-display-lg` (a size) from `text-navy` (a
 * colour), puts them in the same conflict group, and silently drops the size —
 * which collapses every heading that combines a size and a colour through cn().
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'display-xl',
            'display-lg',
            'display-md',
            'heading',
            'subheading',
            'body-lg',
            'body',
            'body-sm',
            'label',
            'metric',
            'metric-sm',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAFN(amount: number, locale: 'en' | 'dari' | 'pashto' = 'en'): string {
  const formatted = new Intl.NumberFormat('en-US').format(Math.abs(amount))
  if (locale === 'en') return `${amount < 0 ? '-' : ''}${formatted} AFN`
  return `${amount < 0 ? '-' : ''}${formatted} افغانی`
}

export function formatPersianDigits(n: number | string): string {
  return String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
}
