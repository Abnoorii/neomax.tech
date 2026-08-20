'use server'

import { headers } from 'next/headers'
import {
  contactSchema,
  MIN_FILL_MS,
  type ContactResult,
} from '@/lib/site/contact-schema'
import { allowEnquiry, deliverEnquiry } from '@/lib/site/enquiry-delivery'

/**
 * Server-side handler for the contact form.
 *
 * Everything the client did is redone here: the client-side schema is a UX
 * affordance, not a trust boundary. Nothing from the request is echoed back
 * into the response, so there is no path for submitted text to reach another
 * user's page.
 */
export async function submitEnquiry(formData: FormData): Promise<ContactResult> {
  try {
    const raw = Object.fromEntries(formData.entries())

    // Zod coerces, trims, and length-bounds every field; unknown keys are dropped.
    const parsed = contactSchema.safeParse({
      ...raw,
      consent: raw.consent === 'on' || raw.consent === 'true',
    })

    if (!parsed.success) {
      return { status: 'invalid', fieldErrors: parsed.error.flatten().fieldErrors }
    }

    const input = parsed.data

    // Spam control 1: honeypot. A real user cannot see or fill this field.
    if (input.companyWebsiteUrl) return { status: 'rejected' }

    // Spam control 2: submissions faster than a human can complete the form.
    if (typeof input.elapsedMs === 'number' && input.elapsedMs < MIN_FILL_MS) {
      return { status: 'rejected' }
    }

    // Spam control 3: rate limiting, keyed on the forwarded client address.
    const headerList = await headers()
    const identifier =
      headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
    if (!(await allowEnquiry(identifier))) return { status: 'rejected' }

    const outcome = await deliverEnquiry(input)

    // The form never claims delivery that did not happen.
    return outcome.delivered ? { status: 'delivered' } : { status: 'accepted-not-delivered' }
  } catch {
    return { status: 'error' }
  }
}
