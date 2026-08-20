'use client'

import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Paired range + numeric input bound to one value.
 *
 * Both controls are real form controls sharing a label, so the value is
 * reachable by pointer, keyboard, and screen reader. The number input is the
 * accessible escape hatch for anyone who cannot operate a slider precisely.
 */
export function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  hint,
  tone = 'dark',
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  format: (value: number) => string
  hint?: string
  tone?: 'light' | 'dark'
}) {
  const id = useId()
  const numberId = `${id}-number`
  const hintId = `${id}-hint`
  const percent = ((value - min) / (max - min)) * 100

  const commit = (next: number) => {
    if (Number.isNaN(next)) return
    onChange(Math.min(max, Math.max(min, next)))
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={numberId}
          className={cn(
            'text-body-sm font-medium',
            tone === 'dark' ? 'text-white' : 'text-navy',
          )}
        >
          {label}
        </label>
        <input
          id={numberId}
          type="number"
          inputMode="decimal"
          value={value}
          min={min}
          max={max}
          step={step}
          aria-describedby={hint ? hintId : undefined}
          onChange={event => commit(Number(event.target.value))}
          className={cn(
            'tabular h-11 w-28 rounded-md border px-2.5 text-right font-mono text-body-sm',
            tone === 'dark'
              ? 'border-white/15 bg-white/[0.04] text-white'
              : 'border-soft-gray bg-white text-navy',
          )}
        />
      </div>

      <input
        id={id}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        aria-label={`${label} slider`}
        aria-valuetext={format(value)}
        onChange={event => commit(Number(event.target.value))}
        className={cn(
          'mt-3 h-11 w-full cursor-pointer appearance-none bg-transparent',
          // Track is painted with a gradient so the filled portion is visible.
          '[&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full',
          '[&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full',
          '[&::-webkit-slider-thumb]:mt-[-7px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5',
          '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
          '[&::-webkit-slider-thumb]:bg-violet-500 [&::-webkit-slider-thumb]:border-2',
          '[&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full',
          '[&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:bg-violet-500',
          tone === 'dark'
            ? '[&::-webkit-slider-thumb]:border-ink [&::-moz-range-thumb]:border-ink'
            : '[&::-webkit-slider-thumb]:border-white [&::-moz-range-thumb]:border-white',
        )}
        style={{
          // Explicit two-stop gradient keeps the filled track readable in both tones.
          background: `linear-gradient(to right, #7657FF 0%, #7657FF ${percent}%, ${
            tone === 'dark' ? 'rgba(255,255,255,0.14)' : '#E7E9EE'
          } ${percent}%, ${tone === 'dark' ? 'rgba(255,255,255,0.14)' : '#E7E9EE'} 100%)`,
          backgroundSize: '100% 6px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="flex items-center justify-between">
        <span
          className={cn(
            'tabular font-mono text-[0.6875rem]',
            tone === 'dark' ? 'text-muted-dark' : 'text-slate',
          )}
        >
          {format(min)}
        </span>
        <span
          className={cn(
            'tabular font-mono text-[0.6875rem]',
            tone === 'dark' ? 'text-muted-dark' : 'text-slate',
          )}
        >
          {format(max)}
        </span>
      </div>

      {hint ? (
        <p
          id={hintId}
          className={cn('mt-2 text-[0.75rem]', tone === 'dark' ? 'text-muted-dark' : 'text-slate')}
        >
          {hint}
        </p>
      ) : null}
    </div>
  )
}
