import { cn } from '@/lib/utils'

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: React.ReactNode
  tone?: 'neutral' | 'violet' | 'dark' | 'lime' | 'outline-dark'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em]',
        tone === 'neutral' && 'bg-off-white text-slate-strong',
        tone === 'violet' && 'bg-violet-500/10 text-violet-700',
        tone === 'dark' && 'bg-white/10 text-white',
        tone === 'lime' && 'bg-lime/15 text-lime',
        tone === 'outline-dark' && 'border border-white/20 text-muted-dark',
        className,
      )}
    >
      {children}
    </span>
  )
}
