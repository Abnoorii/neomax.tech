import { cn } from '@/lib/utils'

/**
 * Field wrapper. Owns the label/description/error wiring so every control in
 * the form announces the same way: errors are referenced by `aria-describedby`
 * and marked `aria-invalid` on the control itself.
 */
export function FormField({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => React.ReactNode
  className?: string
}) {
  const errorId = `${id}-error`
  const hintId = `${id}-hint`
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ')

  return (
    <div className={className}>
      <label htmlFor={id} className="block text-body-sm font-medium text-navy">
        {label}
        {required ? (
          <span className="ml-1 text-danger-strong" aria-hidden="true">
            *
          </span>
        ) : (
          <span className="ml-2 font-normal text-slate">(optional)</span>
        )}
      </label>

      {hint ? (
        <p id={hintId} className="mt-1 text-body-sm text-slate">
          {hint}
        </p>
      ) : null}

      <div className="mt-2">
        {children({
          id,
          'aria-invalid': Boolean(error),
          'aria-describedby': describedBy || undefined,
        })}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-body-sm text-danger-strong">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export const controlClasses =
  'w-full rounded-md border bg-white px-3.5 text-body-sm text-navy transition-colors duration-fast placeholder:text-slate aria-[invalid=true]:border-danger-strong border-soft-gray focus:border-violet-500'

export const inputClasses = cn(controlClasses, 'h-12')
export const textareaClasses = cn(controlClasses, 'min-h-[8rem] py-3 leading-relaxed')
export const selectClasses = cn(controlClasses, 'h-12 appearance-none pr-10')
