import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Visible, non-dismissable labelling for content NEOMAX has not yet verified.
 * This is the mechanism that keeps demo figures from reading as fact — it is
 * deliberately legible rather than a faint footnote.
 */
export function UnverifiedNotice({
  children,
  tone = 'light',
  className,
}: {
  children: React.ReactNode
  tone?: 'light' | 'dark'
  className?: string
}) {
  return (
    <p
      className={cn(
        'flex items-start gap-2.5 rounded-md border px-4 py-3 text-body-sm',
        tone === 'light'
          ? 'border-soft-gray bg-off-white text-slate-strong'
          : 'border-white/15 bg-white/[0.04] text-muted-dark',
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

/** Compact inline marker for a single unverified card or figure. */
export function UnverifiedTag({
  tone = 'light',
  label = 'Illustrative',
  className,
}: {
  tone?: 'light' | 'dark'
  label?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.12em]',
        tone === 'light'
          ? 'border border-soft-gray bg-white text-slate-strong'
          : 'border border-white/20 bg-white/[0.06] text-muted-dark',
        className,
      )}
    >
      {label}
    </span>
  )
}
