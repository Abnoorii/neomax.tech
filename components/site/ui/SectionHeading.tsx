import { cn } from '@/lib/utils'
import { Eyebrow } from './Eyebrow'

/**
 * Standard section header: eyebrow, title, optional lead, optional action.
 * Keeping it in one component is what makes vertical rhythm identical between
 * sections without repeating spacing values in every page.
 */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  tone = 'light',
  align = 'left',
  id,
  className,
  as: Heading = 'h2',
}: {
  eyebrow?: string
  title: React.ReactNode
  lead?: React.ReactNode
  action?: React.ReactNode
  tone?: 'light' | 'dark'
  align?: 'left' | 'center'
  id?: string
  className?: string
  as?: 'h1' | 'h2' | 'h3'
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'text-center')}>
        {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
        <Heading
          id={id}
          className={cn(
            'text-display-lg font-display text-balance',
            eyebrow && 'mt-5',
            tone === 'light' ? 'text-navy' : 'text-white',
          )}
        >
          {title}
        </Heading>
        {lead ? (
          <p
            className={cn(
              'mt-5 max-w-measure text-body-lg',
              align === 'center' && 'mx-auto',
              tone === 'light' ? 'text-slate-strong' : 'text-muted-dark',
            )}
          >
            {lead}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}
