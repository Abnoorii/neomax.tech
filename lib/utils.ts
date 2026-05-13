import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
