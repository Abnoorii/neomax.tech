import { cn } from '@/lib/utils'

/**
 * The single horizontal frame for the site. Every section aligns to this, so
 * headings, cards, and rules share one set of alignment lines.
 */
export function Container({
  className,
  children,
  size = 'default',
}: {
  className?: string
  children: React.ReactNode
  size?: 'default' | 'narrow' | 'wide'
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-edge',
        size === 'default' && 'max-w-container',
        size === 'narrow' && 'max-w-3xl',
        size === 'wide' && 'max-w-[1440px]',
        className,
      )}
    >
      {children}
    </div>
  )
}
