import { z } from 'zod'

/**
 * Single schema shared by the client form and the server action, so validation
 * cannot drift between the two. The server re-validates independently — client
 * validation is a convenience, never a trust boundary.
 */
export const SERVICE_OPTIONS = [
  'Performance Marketing',
  'Revenue & Sales',
  'E-commerce Growth',
  'Not sure yet',
] as const

export const BUDGET_OPTIONS = [
  'Under $5,000 / mo',
  '$5,000 – $15,000 / mo',
  '$15,000 – $50,000 / mo',
  '$50,000 – $150,000 / mo',
  'Over $150,000 / mo',
] as const

export const REVENUE_OPTIONS = [
  'Pre-revenue',
  'Under $50,000 / mo',
  '$50,000 – $250,000 / mo',
  '$250,000 – $1M / mo',
  'Over $1M / mo',
] as const

export const CONTACT_METHOD_OPTIONS = ['Email', 'Video call', 'Phone'] as const

/** Free-text fields are trimmed and length-bounded before anything else. */
const boundedText = (min: number, max: number) => z.string().trim().min(min).max(max)

export const contactSchema = z.object({
  fullName: boundedText(2, 100).describe('Full name'),
  workEmail: z
    .string()
    .trim()
    .min(1, 'Work email is required')
    .max(200)
    .email('Enter a valid email address'),
  company: boundedText(1, 120),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(''))
    .refine(
      value => !value || /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/i.test(value),
      'Enter a valid website address',
    ),
  country: boundedText(2, 60),
  service: z.enum(SERVICE_OPTIONS, { errorMap: () => ({ message: 'Select a service' }) }),
  budget: z.enum(BUDGET_OPTIONS, { errorMap: () => ({ message: 'Select a budget range' }) }),
  revenue: z.enum(REVENUE_OPTIONS, { errorMap: () => ({ message: 'Select a revenue range' }) }),
  challenge: boundedText(10, 2000),
  contactMethod: z.enum(CONTACT_METHOD_OPTIONS, {
    errorMap: () => ({ message: 'Select a contact preference' }),
  }),
  message: z.string().trim().max(4000).optional().or(z.literal('')),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please confirm you agree to be contacted' }),
  }),

  // --- Spam controls. Both are invisible to a real user. ---
  /** Honeypot: bots fill every field they find; humans never see this one. */
  companyWebsiteUrl: z.literal('').optional(),
  /** Milliseconds since the form mounted. Submissions under 3s are bot-fast. */
  elapsedMs: z.coerce.number().int().nonnegative().optional(),
})

export type ContactInput = z.infer<typeof contactSchema>

export const MIN_FILL_MS = 3000

export type ContactResult =
  | { status: 'delivered' }
  | { status: 'accepted-not-delivered' }
  | { status: 'invalid'; fieldErrors: Record<string, string[]> }
  | { status: 'rejected' }
  | { status: 'error' }
