'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { revealUp, revealViewport, staggerParent } from '@/lib/site/motion'
import { cn } from '@/lib/utils'

/**
 * Scroll reveal. Content is authored visible and animates only as a refinement,
 * so a reader with reduced motion (or no JS-driven animation) loses nothing.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  as?: 'div' | 'li' | 'article' | 'section'
}) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as]

  if (reduceMotion) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Component
      className={className}
      variants={revealUp}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
      transition={{ delay }}
    >
      {children}
    </Component>
  )
}

/** Staggers direct `Reveal` children so a grid resolves in reading order. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  stagger?: number
  as?: 'div' | 'ul' | 'ol'
}) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as]

  if (reduceMotion) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Component
      className={cn(className)}
      variants={staggerParent(stagger)}
      initial="hidden"
      whileInView="visible"
      viewport={revealViewport}
    >
      {children}
    </Component>
  )
}

/** Child of `RevealGroup` — inherits the parent's stagger timing. */
export function RevealItem({
  children,
  className,
  as = 'div',
}: {
  children: React.ReactNode
  className?: string
  as?: 'div' | 'li' | 'article'
}) {
  const reduceMotion = useReducedMotion()
  const Component = motion[as]

  if (reduceMotion) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }

  return (
    <Component className={className} variants={revealUp}>
      {children}
    </Component>
  )
}
