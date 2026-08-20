# NEOMAX design system

Reference for the marketing site in `app/(site)`. The internal payroll app under
`app/[locale]` is a separate product and does not use these tokens.

## Colour

Brand values from the brief, with two corrections made after measuring contrast
(`contrast()` from the dataviz skill's validator, WCAG 2.x ratios):

| Token | Value | Contrast | Use |
|---|---|---|---|
| `ink` | `#080B12` | — | Primary dark ground |
| `navy` | `#11182A` | 17.68:1 on white | Headings on light |
| `surface-dark` | `#151D31` | — | Dark cards |
| `surface-raised` | `#1C2740` | — | Second dark step, so dark cards separate |
| `off-white` | `#F5F6F8` | — | Long-form reading sections |
| `slate` | `#697386` | 4.78:1 on white, **4.42:1 on off-white** | Meta text on white only |
| `slate-strong` | `#55607A` | 6.29:1 on white | **Body copy** — replaces `slate` |
| `muted-dark` | `#9AA5BC` | 6.78:1 on `surface-dark` | Body copy on dark |
| `violet-500` | `#7657FF` | 4.59:1 on white | Primary action |
| `violet-600` | `#5B3EE0` | 6.54:1 on white | Links on light surfaces |
| `lime` | `#B7F34A` | 12.73:1 on `surface-dark` | Dark-surface labels and status only |
| `danger` | `#FF5D6C` | 5.62:1 on dark, **2.99:1 on white** | Dark surfaces only |
| `danger-strong` | `#D92D3D` | 4.78:1 on white | Errors on light surfaces |

**Corrections to the brief.** `slate` fails AA on `off-white`, so body copy uses
`slate-strong`. `danger` fails on white at 2.99:1, so light surfaces use
`danger-strong`. Both originals are kept for the surfaces where they do pass.

One accent per section. Lime is never a large background.

## Chart colour — computed, not chosen

Validated with the dataviz skill's `validate_palette.js` (OKLCH lightness band,
chroma floor, CVD separation under protanopia/deuteranopia, normal-vision floor,
contrast vs surface). Re-run it before changing any of these values.

- **Categorical caps at two slots**: `#7657FF` and `#729620`. The brief's
  `#B7F34A` (L 0.893) and `#41D69D` (L 0.784) both sit outside the lightness
  band for chart marks, and as a pair they collapse — worst normal-vision ΔE
  14.1, below the floor of 15. `#729620` is the lime hue re-stepped to pass in
  **both** light and dark modes.
- **`success` and `danger` are status colours only** — reserved meaning, always
  shipped with an icon and label, never a data series.
- **Funnel ramp is ordinal, not categorical.** Reordering the stages would
  change the meaning, so it takes a one-hue ramp with monotone lightness:
  dark `#C9BAFF → #9C85FF → #7657FF`, light `#B5A2FF → #8E74F5 → #5B3EE0`.
  Both pass the ordinal checks (monotone L, adjacent ΔL ≥ 0.06, light-end
  contrast ≥ 2:1).
- **Channel bars are nominal**, so every bar takes the slot-1 hue. Colouring
  them individually would spend the identity channel re-encoding bar length.
- **ROAS is a hero figure, not a one-bar chart**, and case-study results are
  stat tiles. The source gives headline numbers, never a series, so no
  time-series chart is drawn from them.
- Every chart ships a table view (`sr-only`) and direct labels.

## Type

Display **Manrope**, body **Inter**, data/labels **JetBrains Mono** — all
variable, all via `next/font` (self-hosted, no layout shift). Every step is
`clamp()`-driven so mobile stays scannable.

`display-xl` `display-lg` `display-md` `heading` `subheading` `body-lg` `body`
`body-sm` `label` `metric` `metric-sm`.

Measure is capped at `max-w-measure` (68ch) for long-form and `measure-sm`
(58ch) for supporting copy — inside the 55–75 character band.

> **`cn()` must know these sizes.** `lib/utils.ts` extends tailwind-merge's
> `font-size` group with them. Without it, tailwind-merge cannot tell
> `text-display-lg` (a size) from `text-navy` (a colour), groups them as
> conflicting, and silently drops the size — which collapses every heading that
> combines a size and a colour. Add any new `text-*` size to that list.

## Layout

Max width 1280px (`max-w-container`), 12/8/4-column grids, edge padding
`clamp(1.25rem, 0.7rem + 2.2vw, 2.5rem)`, section rhythm
`clamp(4.5rem, 2.8rem + 6vw, 8.5rem)`. `Container` and `Section` are the only
places spacing is defined, which is what keeps alignment lines shared.

**Grid children that hold wide content need `min-w-0`.** Grid items default to
`min-width: auto`, so a `whitespace-nowrap` button or a wide `<pre>` inside an
`overflow-x-auto` wrapper will push the whole column past the viewport.

## Motion

Durations 180–600ms, easing `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out, no
overshoot, no bounce). Nothing loops except the single live-status dot. No
scroll hijacking; the process section's sticky index is a passive read-out of
scroll position.

Content is authored visible and animation is only a refinement, so
`prefers-reduced-motion` loses nothing. Reduced motion is handled globally in
`globals.css` and per-component via `useReducedMotion`.

## Verification

Nothing is published as fact unless marked `verified` in `content/`. See
`content/verification.ts`. `NEXT_PUBLIC_CONTENT_MODE=verified-only` removes
unverified content entirely; the default `demo` renders it behind visible
"Illustrative" labelling.
