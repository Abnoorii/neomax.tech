import type { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Mail, ShieldCheck } from 'lucide-react'
import { site } from '@/content/site'
import { isVerified } from '@/content/verification'
import { growthSystem } from '@/content/process'
import { PageHero } from '@/components/site/marketing/PageHero'
import { ContactForm } from '@/components/site/forms/ContactForm'
import { Section } from '@/components/site/layout/Section'
import { JsonLd } from '@/components/site/JsonLd'
import { buildMetadata, breadcrumbSchema } from '@/lib/site/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description:
    'Book a free 30-minute strategy call with NEOMAX, or send an enquiry and we will come back with a clear view of your strongest growth opportunities.',
  path: '/contact',
})

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; service?: string; source?: string }>
}) {
  const params = await searchParams
  const verifiedPromises = site.promises.filter(isVerified)

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Book a free 30-minute strategy call."
        lead="Tell us where you are and what is in the way. We will come back with a view of your strongest opportunities — and say plainly if we are not the right fit."
        crumbs={[
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ]}
      />

      <Section id="message" tone="light" aria-labelledby="form-heading">
        <div className="grid gap-x-12 gap-y-14 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 id="form-heading" className="font-display text-display-md text-navy">
              Send us an enquiry
            </h2>
            <p className="mt-3 max-w-measure text-body text-slate-strong">
              The more context you give, the more useful the first call is. Everything
              here is used only to prepare for it.
            </p>

            <div className="mt-10">
              <ContactForm defaultService={params.service ?? planToService(params.plan)} />
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-8">
              <div className="rounded-lg border border-soft-gray bg-off-white p-6">
                <h3 className="font-display text-heading text-navy">What happens next</h3>
                <ol className="mt-5 space-y-5">
                  {[
                    {
                      title: 'We read it properly',
                      detail:
                        'Your enquiry goes to a strategist, not a queue. We look at your site and, where relevant, what is publicly visible about your channels.',
                    },
                    {
                      title: 'A 30-minute call',
                      detail:
                        'We walk through where your constraint most likely sits and what we would look at first. No deck, no pitch.',
                    },
                    {
                      title: 'A written follow-up',
                      detail: `If it looks like a fit, you get the ${growthSystem[0].title.toLowerCase()} scope in writing before any commitment.`,
                    },
                  ].map((item, index) => (
                    <li key={item.title} className="flex gap-4">
                      <span className="font-mono text-body-sm text-violet-600">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <p className="text-body-sm font-medium text-navy">{item.title}</p>
                        <p className="mt-1 text-body-sm text-slate-strong">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-lg border border-soft-gray p-6">
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-slate">
                  Direct contact
                </h3>
                <a
                  href={`mailto:${site.contact.email.value}`}
                  className="mt-3 flex min-h-[44px] items-center gap-2.5 text-body font-medium text-navy transition-colors duration-fast hover:text-violet-600"
                >
                  <Mail aria-hidden="true" className="h-4 w-4 text-slate" />
                  {site.contact.email.value}
                </a>
                {!site.contact.email.configured ? (
                  <p className="mt-2 text-body-sm text-slate">
                    Placeholder address — set{' '}
                    <code className="font-mono text-[0.8125rem]">NEXT_PUBLIC_CONTACT_EMAIL</code>{' '}
                    to publish the real one.
                  </p>
                ) : null}

                {verifiedPromises.length > 0 ? (
                  <ul className="mt-6 space-y-2.5 border-t border-soft-gray pt-5">
                    {verifiedPromises.map(promise => (
                      <li
                        key={promise.label}
                        className="flex items-center gap-2.5 text-body-sm text-slate-strong"
                      >
                        <Clock aria-hidden="true" className="h-4 w-4 text-violet-600" />
                        {promise.label}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-soft-gray p-6">
                <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" />
                <p className="text-body-sm text-slate-strong">
                  Your details are used only to respond to this enquiry. We do not sell
                  personal data or add you to unrelated marketing. See the{' '}
                  <Link
                    href="/privacy"
                    className="font-medium text-violet-600 underline underline-offset-4"
                  >
                    privacy policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Section>

      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Contact', path: '/contact' },
        ])}
      />
    </>
  )
}

/** Pricing CTAs carry ?plan=; map that to the matching service preselection. */
function planToService(plan?: string): string | undefined {
  if (!plan) return undefined
  return plan === 'enterprise' ? 'Not sure yet' : undefined
}
