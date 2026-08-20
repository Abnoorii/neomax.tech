import { cn } from '@/lib/utils'
import { Container } from './Container'

type Tone = 'light' | 'off-white' | 'dark' | 'ink'

const toneClasses: Record<Tone, string> = {
  light: 'bg-white text-navy',
  'off-white': 'bg-off-white text-navy',
  dark: 'bg-surface-dark text-white neomax-dark',
  ink: 'bg-ink text-white neomax-dark',
}

/**
 * Vertical rhythm primitive. Section padding is the only place section spacing
 * is defined, which keeps the page's rhythm consistent across routes.
 */
export function Section({
  id,
  tone = 'light',
  className,
  containerClassName,
  size = 'default',
  containerSize,
  children,
  as: Component = 'section',
  'aria-labelledby': ariaLabelledBy,
}: {
  id?: string
  tone?: Tone
  className?: string
  containerClassName?: string
  size?: 'default' | 'compact'
  containerSize?: 'default' | 'narrow' | 'wide'
  children: React.ReactNode
  as?: 'section' | 'div' | 'footer' | 'article'
  'aria-labelledby'?: string
}) {
  return (
    <Component
      id={id}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        toneClasses[tone],
        size === 'default' ? 'py-section' : 'py-section-sm',
        className,
      )}
    >
      <Container size={containerSize} className={containerClassName}>
        {children}
      </Container>
    </Component>
  )
}
