/**
 * Content verification gating.
 *
 * Nothing in `content/` is published as fact unless it is marked `verified`.
 * Everything sourced from the supplied draft (metrics, client names, case-study
 * results, testimonials) ships as `demo` or `pending` until NEOMAX confirms it.
 *
 * `NEXT_PUBLIC_CONTENT_MODE` controls what reaches the page:
 *   - "demo" (default) — unverified content renders, but always behind a visible
 *     "Illustrative" label so a reader is never misled.
 *   - "verified-only" — unverified content is removed from the page entirely and
 *     sections with nothing left to show hide themselves.
 */
export type VerificationStatus = 'verified' | 'pending' | 'demo'

export type Verifiable = {
  verificationStatus: VerificationStatus
}

export type ContentMode = 'demo' | 'verified-only'

export const contentMode: ContentMode =
  process.env.NEXT_PUBLIC_CONTENT_MODE === 'verified-only' ? 'verified-only' : 'demo'

/** True when unverified items may be rendered (always with a visible label). */
export const showsUnverified = contentMode === 'demo'

export function isVerified(item: Verifiable): boolean {
  return item.verificationStatus === 'verified'
}

/** Drops unverified entries when the site is running in verified-only mode. */
export function publishable<T extends Verifiable>(items: readonly T[]): T[] {
  return showsUnverified ? [...items] : items.filter(isVerified)
}

/** Whether a single item may appear at all. */
export function canPublish(item: Verifiable): boolean {
  return showsUnverified || isVerified(item)
}

/** Whether the "Illustrative" label must be attached to this item. */
export function needsLabel(item: Verifiable): boolean {
  return item.verificationStatus !== 'verified'
}
