import jalaali from 'jalaali-js'

export const HIJRI_MONTHS_EN = [
  'Hamal', 'Sawar', 'Jawza', 'Saratan', 'Asad', 'Sunbula',
  'Mizan', 'Aqrab', 'Qaws', 'Jadi', 'Dalwa', 'Hoot',
]

export const HIJRI_MONTHS_DARI = [
  'حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله',
  'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت',
]

export interface HijriDate {
  jy: number
  jm: number
  jd: number
}

export function toHijri(gregorianDate: Date): HijriDate {
  const { jy, jm, jd } = jalaali.toJalaali(
    gregorianDate.getFullYear(),
    gregorianDate.getMonth() + 1,
    gregorianDate.getDate()
  )
  return { jy, jm, jd }
}

export function fromHijri(jy: number, jm: number, jd: number): Date {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
  return new Date(gy, gm - 1, gd)
}

export function hijriMonthName(month: number, lang: 'en' | 'dari' | 'pashto' = 'en'): string {
  if (lang === 'en') return HIJRI_MONTHS_EN[month - 1] ?? ''
  return HIJRI_MONTHS_DARI[month - 1] ?? ''
}

export function formatHijriDate(
  jy: number,
  jm: number,
  jd: number,
  lang: 'en' | 'dari' | 'pashto' = 'en'
): string {
  const monthName = hijriMonthName(jm, lang)
  if (lang === 'en') return `${jd} ${monthName} ${jy}`
  return `${jd} ${monthName} ${jy}`
}

export function getCurrentHijriDate(): HijriDate {
  return toHijri(new Date())
}

export function hijriMonthDays(jy: number, jm: number): number {
  return jalaali.jalaaliMonthLength(jy, jm)
}

export function getHijriMonthDateRange(jy: number, jm: number): { start: Date; end: Date } {
  const start = fromHijri(jy, jm, 1)
  const days = hijriMonthDays(jy, jm)
  const end = fromHijri(jy, jm, days)
  return { start, end }
}

// Count Fridays (weekly holiday) in a date range
export function countFridays(start: Date, end: Date): number {
  let count = 0
  const current = new Date(start)
  while (current <= end) {
    if (current.getDay() === 5) count++ // 5 = Friday
    current.setDate(current.getDate() + 1)
  }
  return count
}

export function getWorkingDays(jy: number, jm: number, additionalHolidays = 0): number {
  const { start, end } = getHijriMonthDateRange(jy, jm)
  const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return totalDays - countFridays(start, end) - additionalHolidays
}

export function toGregorianDateString(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd)
  return `${gy}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}
