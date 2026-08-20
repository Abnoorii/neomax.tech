import { cn } from '@/lib/utils'

/**
 * The recurring section label ("— What we do"). The rule is drawn rather than
 * typed as an em dash so it aligns optically with the text baseline.
 */
export function Eyebrow({
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
        'flex items-center gap-3 font-mono text-label uppercase',
        tone === 'light' ? 'text-slate-strong' : 'text-muted-dark',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn('h-px w-8 shrink-0', tone === 'light' ? 'bg-navy/30' : 'bg-white/30')}
      />
      {children}
    </p>
  )
}
