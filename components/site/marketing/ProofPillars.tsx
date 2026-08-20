import { proofPillars } from '@/content/proof'
import { publishable, needsLabel } from '@/content/verification'
import { RevealGroup, RevealItem } from '@/components/site/ui/Reveal'
import { UnverifiedTag } from '@/components/site/ui/UnverifiedTag'

/**
 * Why NEOMAX. Each pillar states a claim and then the evidence that makes it
 * checkable — the evidence line is the point, and unverified claims (anything
 * legal or factual) carry a visible marker.
 */
export function ProofPillars() {
  const pillars = publishable(proofPillars)
  if (pillars.length === 0) return null

  return (
    <RevealGroup as="ul" className="mt-16 grid gap-px overflow-hidden rounded-lg border border-white/12 bg-white/12 sm:grid-cols-2 lg:grid-cols-3">
      {pillars.map(pillar => (
        <RevealItem key={pillar.id} as="li" className="bg-ink p-7">
          <pillar.icon aria-hidden="true" className="h-5 w-5 text-lime" />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <h3 className="font-display text-heading text-white">{pillar.title}</h3>
            {needsLabel(pillar) ? <UnverifiedTag tone="dark" label="Unverified" /> : null}
          </div>
          <p className="mt-2 text-body-sm font-medium text-white/85">{pillar.claim}</p>
          <p className="mt-3 text-body-sm text-muted-dark">{pillar.evidence}</p>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}
