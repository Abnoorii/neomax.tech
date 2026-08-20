'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, Check, ChevronDown, Loader2 } from 'lucide-react'
import {
  contactSchema,
  SERVICE_OPTIONS,
  BUDGET_OPTIONS,
  REVENUE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  type ContactInput,
  type ContactResult,
} from '@/lib/site/contact-schema'
import { submitEnquiry } from '@/app/actions/contact'
import { site } from '@/content/site'
import { Button } from '@/components/site/ui/Button'
import {
  FormField,
  inputClasses,
  selectClasses,
  textareaClasses,
} from '@/components/site/forms/FormField'

export function ContactForm({ defaultService }: { defaultService?: string }) {
  const [result, setResult] = useState<ContactResult | null>(null)
  const mountedAt = useRef<number>(Date.now())
  const statusRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      service: (SERVICE_OPTIONS.find(option => option === defaultService) ??
        undefined) as ContactInput['service'],
      companyWebsiteUrl: '',
    },
  })

  // Move focus to the outcome so it is announced and reachable immediately.
  useEffect(() => {
    if (result && result.status !== 'invalid') statusRef.current?.focus()
  }, [result])

  const onSubmit = handleSubmit(async values => {
    setResult(null)
    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      if (value !== undefined && value !== null) formData.set(key, String(value))
    }
    formData.set('elapsedMs', String(Date.now() - mountedAt.current))

    const response = await submitEnquiry(formData)

    // Server-side validation wins; surface its errors on the matching fields.
    if (response.status === 'invalid') {
      for (const [field, messages] of Object.entries(response.fieldErrors)) {
        if (messages?.[0]) setError(field as keyof ContactInput, { message: messages[0] })
      }
    }
    setResult(response)
  })

  if (result?.status === 'delivered' || result?.status === 'accepted-not-delivered') {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-lg border border-soft-gray bg-off-white p-8"
      >
        <Check aria-hidden="true" className="h-6 w-6 text-success-strong" />
        <h3 className="mt-4 font-display text-heading text-navy">
          {result.status === 'delivered'
            ? 'Thanks — your enquiry is on its way.'
            : 'Your details passed validation.'}
        </h3>

        {result.status === 'delivered' ? (
          <p className="mt-3 max-w-measure text-body text-slate-strong">
            We have received your enquiry and will be in touch to arrange your strategy
            call.
          </p>
        ) : (
          // Honest failure state: no delivery provider is wired up yet, so the
          // form must not imply the message reached anyone.
          <div className="mt-3 max-w-measure space-y-3 text-body text-slate-strong">
            <p>
              <strong className="font-medium text-navy">
                This form is not connected to a mail provider yet,
              </strong>{' '}
              so your message has not been sent to anyone. Nothing was lost on your side —
              but please use the direct address below so your enquiry actually reaches us.
            </p>
            <p>
              Email{' '}
              <a
                href={`mailto:${site.contact.email.value}`}
                className="font-medium text-violet-600 underline underline-offset-4"
              >
                {site.contact.email.value}
              </a>{' '}
              and we will reply to arrange a call.
            </p>
          </div>
        )}

        <Button variant="outline" size="md" className="mt-6" onClick={() => setResult(null)}>
          Submit another enquiry
        </Button>
      </div>
    )
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {/* Honeypot. Hidden from sight and from assistive tech alike. */}
      <div aria-hidden="true" className="absolute h-px w-px overflow-hidden opacity-0">
        <label htmlFor="companyWebsiteUrl">Leave this field empty</label>
        <input
          id="companyWebsiteUrl"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('companyWebsiteUrl')}
        />
      </div>

      {(result?.status === 'error' || result?.status === 'rejected' || hasErrors) && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="flex items-start gap-3 rounded-md border border-danger-strong/30 bg-danger-strong/[0.05] p-4"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-danger-strong" />
          <p className="text-body-sm text-navy">
            {result?.status === 'error'
              ? 'Something went wrong submitting the form. Please try again, or email us directly.'
              : result?.status === 'rejected'
                ? 'That submission was flagged by our spam checks. If this is a mistake, please email us directly.'
                : 'Please check the highlighted fields below.'}
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField id="fullName" label="Full name" required error={errors.fullName?.message}>
          {props => (
            <input
              {...props}
              {...register('fullName')}
              type="text"
              autoComplete="name"
              className={inputClasses}
            />
          )}
        </FormField>

        <FormField id="workEmail" label="Work email" required error={errors.workEmail?.message}>
          {props => (
            <input
              {...props}
              {...register('workEmail')}
              type="email"
              autoComplete="email"
              className={inputClasses}
            />
          )}
        </FormField>

        <FormField id="company" label="Company" required error={errors.company?.message}>
          {props => (
            <input
              {...props}
              {...register('company')}
              type="text"
              autoComplete="organization"
              className={inputClasses}
            />
          )}
        </FormField>

        <FormField id="website" label="Website" error={errors.website?.message}>
          {props => (
            <input
              {...props}
              {...register('website')}
              type="text"
              inputMode="url"
              placeholder="yourcompany.com"
              autoComplete="url"
              className={inputClasses}
            />
          )}
        </FormField>

        <FormField id="country" label="Country" required error={errors.country?.message}>
          {props => (
            <input
              {...props}
              {...register('country')}
              type="text"
              autoComplete="country-name"
              className={inputClasses}
            />
          )}
        </FormField>

        <SelectRow
          id="service"
          label="Service needed"
          error={errors.service?.message}
          options={SERVICE_OPTIONS}
          register={register('service')}
        />

        <SelectRow
          id="budget"
          label="Monthly marketing budget"
          error={errors.budget?.message}
          options={BUDGET_OPTIONS}
          register={register('budget')}
        />

        <SelectRow
          id="revenue"
          label="Current monthly revenue"
          error={errors.revenue?.message}
          options={REVENUE_OPTIONS}
          register={register('revenue')}
        />
      </div>

      <FormField
        id="challenge"
        label="Main growth challenge"
        required
        hint="What is the single thing most in the way right now?"
        error={errors.challenge?.message}
      >
        {props => <textarea {...props} {...register('challenge')} className={textareaClasses} />}
      </FormField>

      <fieldset>
        <legend className="text-body-sm font-medium text-navy">
          Preferred contact method
          <span className="ml-1 text-danger-strong" aria-hidden="true">
            *
          </span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {CONTACT_METHOD_OPTIONS.map(option => (
            <label
              key={option}
              className="inline-flex min-h-[44px] cursor-pointer items-center gap-2.5 rounded-md border border-soft-gray bg-white px-4 text-body-sm text-slate-strong transition-colors duration-fast hover:border-navy has-[:checked]:border-navy has-[:checked]:text-navy"
            >
              <input
                type="radio"
                value={option}
                {...register('contactMethod')}
                className="h-4 w-4 accent-violet-500"
              />
              {option}
            </label>
          ))}
        </div>
        {errors.contactMethod?.message ? (
          <p className="mt-1.5 text-body-sm text-danger-strong">{errors.contactMethod.message}</p>
        ) : null}
      </fieldset>

      <FormField id="message" label="Anything else" error={errors.message?.message}>
        {props => <textarea {...props} {...register('message')} className={textareaClasses} />}
      </FormField>

      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register('consent')}
            aria-invalid={Boolean(errors.consent)}
            aria-describedby={errors.consent ? 'consent-error' : undefined}
            className="mt-1 h-4 w-4 shrink-0 accent-violet-500"
          />
          <span className="text-body-sm text-slate-strong">
            I agree to be contacted about this enquiry. My details will be used only to
            respond to it, as described in the{' '}
            <Link
              href="/privacy"
              className="font-medium text-violet-600 underline underline-offset-4"
            >
              privacy policy
            </Link>
            .
          </span>
        </label>
        {errors.consent?.message ? (
          <p id="consent-error" className="mt-1.5 text-body-sm text-danger-strong">
            {errors.consent.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? (
          <>
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
            Sending…
          </>
        ) : (
          'Send enquiry'
        )}
      </Button>
    </form>
  )
}

function SelectRow({
  id,
  label,
  error,
  options,
  register,
}: {
  id: string
  label: string
  error?: string
  options: readonly string[]
  register: ReturnType<ReturnType<typeof useForm<ContactInput>>['register']>
}) {
  return (
    <FormField id={id} label={label} required error={error}>
      {props => (
        <div className="relative">
          <select {...props} {...register} defaultValue="" className={selectClasses}>
            <option value="" disabled>
              Select…
            </option>
            {options.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate"
          />
        </div>
      )}
    </FormField>
  )
}
