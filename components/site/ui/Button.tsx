import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * One button geometry across the site: heights are fixed per size so buttons
 * sitting side by side always align, and every target clears 44px on touch.
 */
const buttonStyles = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-fast ease-entrance disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-violet-500 text-white hover:bg-violet-600 focus-visible:outline-violet-500',
        'on-dark': 'bg-white text-ink hover:bg-off-white focus-visible:outline-lime',
        outline:
          'border border-soft-gray bg-white text-navy hover:border-navy hover:bg-off-white focus-visible:outline-violet-500',
        'outline-dark':
          'border border-white/25 bg-transparent text-white hover:border-white/60 hover:bg-white/5 focus-visible:outline-lime',
        ghost: 'text-navy hover:bg-off-white focus-visible:outline-violet-500',
        'ghost-dark': 'text-white hover:bg-white/10 focus-visible:outline-lime',
      },
      size: {
        sm: 'h-10 px-4 text-body-sm',
        md: 'h-12 px-6 text-body-sm',
        lg: 'h-14 px-8 text-body',
      },
      full: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', full: false },
  },
)

type ButtonStyleProps = VariantProps<typeof buttonStyles>

export function Button({
  className,
  variant,
  size,
  full,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps) {
  return <button className={cn(buttonStyles({ variant, size, full }), className)} {...props} />
}

export function ButtonLink({
  className,
  variant,
  size,
  full,
  href,
  external,
  ...props
}: Omit<React.ComponentProps<typeof Link>, 'href'> &
  ButtonStyleProps & { href: string; external?: boolean }) {
  const classes = cn(buttonStyles({ variant, size, full }), className)

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props} />
    )
  }

  return <Link href={href} className={classes} {...props} />
}
