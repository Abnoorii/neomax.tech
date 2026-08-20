import type { Variants, Transition } from 'framer-motion'

/**
 * Shared motion language.
 *
 * Durations sit between 180ms and 600ms, easing is expo-out with no overshoot,
 * and nothing loops. Reduced motion is handled globally in globals.css and by
 * `useReducedMotion` where a component would otherwise animate on its own.
 */
export const EASE_ENTRANCE: Transition['ease'] = [0.16, 1, 0.3, 1]

export const transition = {
  fast: { duration: 0.18, ease: EASE_ENTRANCE },
  base: { duration: 0.34, ease: EASE_ENTRANCE },
  slow: { duration: 0.52, ease: EASE_ENTRANCE },
} satisfies Record<string, Transition>

/** Standard section reveal: a short rise, once, when scrolled into view. */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: transition.base },
}

export const revealFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transition.base },
}

/** Parent that staggers children without delaying the first one noticeably. */
export function staggerParent(stagger = 0.07, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren } },
  }
}

/** Viewport config used for every scroll reveal so behaviour stays uniform. */
export const revealViewport = { once: true, margin: '-80px 0px -80px 0px' } as const
