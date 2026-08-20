import 'server-only'
import type { ContactInput } from './contact-schema'

/**
 * INTEGRATION BOUNDARY — enquiry delivery.
 *
 * No email or CRM provider is configured for this project yet, so nothing is
 * transmitted. This module is the single seam where that gets wired up: it is
 * intentionally the only place that needs to change.
 *
 * The form deliberately does NOT tell the visitor their message was sent while
 * this returns `not-configured` — claiming delivery that did not happen would
 * lose real enquiries silently.
 *
 * To enable delivery, set the provider env vars (see `.env.example`) and
 * implement the marked branch below. Suggested options:
 *   - Transactional email: Resend, Postmark, SendGrid
 *   - CRM intake: HubSpot Forms API, Pipedrive Leads API
 */
export type DeliveryOutcome = { delivered: boolean; reason?: 'not-configured' | 'provider-error' }

function providerConfigured(): boolean {
  return Boolean(process.env.ENQUIRY_PROVIDER_API_KEY && process.env.ENQUIRY_TO_EMAIL)
}

export async function deliverEnquiry(input: ContactInput): Promise<DeliveryOutcome> {
  if (!providerConfigured()) {
    // Recorded server-side so an enquiry submitted before wiring is not lost
    // from the logs. Deliberately omits the free-text body from the log line.
    console.warn(
      '[enquiry] No delivery provider configured. Enquiry validated but not sent.',
      { company: input.company, country: input.country, service: input.service },
    )
    return { delivered: false, reason: 'not-configured' }
  }

  try {
    // ---------------------------------------------------------------------
    // IMPLEMENT DELIVERY HERE.
    // Example shape (Resend):
    //   const response = await fetch('https://api.resend.com/emails', {
    //     method: 'POST',
    //     headers: {
    //       Authorization: `Bearer ${process.env.ENQUIRY_PROVIDER_API_KEY}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       from: process.env.ENQUIRY_FROM_EMAIL,
    //       to: process.env.ENQUIRY_TO_EMAIL,
    //       reply_to: input.workEmail,
    //       subject: `New enquiry — ${input.company}`,
    //       text: formatEnquiry(input),
    //     }),
    //   })
    //   if (!response.ok) return { delivered: false, reason: 'provider-error' }
    // ---------------------------------------------------------------------
    return { delivered: false, reason: 'not-configured' }
  } catch {
    return { delivered: false, reason: 'provider-error' }
  }
}

/**
 * INTEGRATION BOUNDARY — rate limiting.
 *
 * Returns true when the request should be allowed. With no store configured
 * this is a pass-through; wire it to Upstash Redis, Vercel KV, or your edge
 * provider's limiter before going live.
 */
export async function allowEnquiry(_identifier: string): Promise<boolean> {
  return true
}
