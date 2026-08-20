import { cn } from '@/lib/utils'

/**
 * NEOMAX wordmark.
 *
 * Set in the display face at extra-bold with tight tracking, with the O
 * replaced by the brand's cut-counter glyph: a rounded square whose counter is
 * sliced by a rising diagonal. Drawn in `currentColor` so it inverts cleanly
 * between the light and dark sections without shipping two assets.
 */
export function Wordmark({
  className,
  title = 'NEOMAX',
}: {
  className?: string
  title?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex select-none items-center font-display text-[1.375rem] font-extrabold leading-none tracking-[-0.045em]',
        className,
      )}
    >
      {/* The accessible name lives here; the glyph parts are decorative. */}
      <span className="sr-only">{title}</span>
      <span aria-hidden="true" className="inline-flex items-center">
        NE
        <CutO />
        MAX
      </span>
    </span>
  )
}

/** The sliced-counter O. Sized in `em` so it tracks the wordmark's font size. */
function CutO() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="mx-[0.02em] h-[0.72em] w-[0.72em]"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id="neomax-o-cut">
          <rect width="100" height="100" fill="black" />
          {/* Outer body of the glyph */}
          <rect x="5" y="5" width="90" height="90" rx="25" fill="white" />
          {/* Counter punched back out. Sized so the remaining stroke matches
              the weight of the surrounding Manrope ExtraBold letterforms. */}
          <rect x="23" y="23" width="54" height="54" rx="10" fill="black" />
          {/* The rising slice that crosses body and counter alike */}
          <polygon points="-6,73 106,43 106,53 -6,83" fill="black" />
        </mask>
      </defs>
      <rect width="100" height="100" fill="currentColor" mask="url(#neomax-o-cut)" />
    </svg>
  )
}
