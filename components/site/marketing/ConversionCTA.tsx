import { ArrowRight, Check } from 'lucide-react'
import { site } from '@/content/site'
import { isVerified } from '@/content/verification'
import { Section } from '@/components/site/layout/Section'
import { ButtonLink } from '@/components/site/ui/Button'

/**
 * Closing conversion block. Offer promises (no contract, free audit, response
 * time) are commitments to a prospect, so each renders only once verified.
 */
export function ConversionCTA({
  title = 'Ready to engineer your growth?',
  lead = 'Book a free 30-minute strategy call and get a clear view of your strongest growth opportunities.',
}: {
  title?: string
  lead?: string
}) {
  const promises = site.promises.filter(isVerified)

  return (
    <Section tone="ink" aria-labelledby="cta-heading" className="relative overflow-hidden">
      {/* A single hairline rule anchors the block without a decorative glow. */}
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/12" />

      <div className="mx-auto max-w-3xl text-center">
        <h2 id="cta-heading" className="font-display text-display-lg text-balance text-white">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-measure text-body-lg text-muted-dark">{lead}</p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/contact" size="lg" className="group">
            Book a Free Call
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-fast group-hover:translate-x-0.5"
            />
          </ButtonLink>
          <ButtonLink href="/contact#message" variant="outline-dark" size="lg">
            Send Us a Message
          </ButtonLink>
        </div>

        {promises.length > 0 ? (
          <ul className="mt-9 flex flex-wrap justify-center gap-x-7 gap-y-3">
            {promises.map(promise => (
              <li key={promise.label} className="flex items-center gap-2 text-body-sm text-muted-dark">
                <Check aria-hidden="true" className="h-4 w-4 text-lime" />
                {promise.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Section>
  )
}
