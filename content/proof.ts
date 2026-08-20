import type { LucideIcon } from 'lucide-react'
import { Building2, Database, Globe2, Cpu, Eye, Handshake } from 'lucide-react'
import type { VerificationStatus } from './verification'

/**
 * The six proof pillars. Each is written as evidence rather than as a
 * superiority claim, and anything that is a factual or legal assertion carries
 * its own verification status.
 */
export type ProofPillar = {
  id: string
  title: string
  claim: string
  /** What makes the claim checkable, rather than an adjective. */
  evidence: string
  icon: LucideIcon
  verificationStatus: VerificationStatus
}

export const proofPillars: ProofPillar[] = [
  {
    id: 'incorporated',
    title: 'Canadian incorporated',
    claim: 'Contracts sit under a Canadian corporate entity.',
    evidence:
      'Engagements are contracted through a registered corporate entity, so clients have a defined counterparty and jurisdiction for the agreement.',
    icon: Building2,
    // Legal statement — stays gated until NEOMAX confirms it is accurate and approved.
    verificationStatus: 'pending',
  },
  {
    id: 'data-first',
    title: 'Data-first approach',
    claim: 'Measurement is fixed before spend is optimised.',
    evidence:
      'Every engagement opens with a tracking audit, and no baseline is used until its events have been validated. Recommendations cite the metric they are drawn from.',
    icon: Database,
    verificationStatus: 'verified',
  },
  {
    id: 'global',
    title: 'Global reach',
    claim: 'Campaigns run across multiple markets and currencies.',
    evidence:
      'Multi-market work is scoped per region, covering local compliance constraints, currency handling, and market-specific creative rather than one translated campaign.',
    icon: Globe2,
    verificationStatus: 'pending',
  },
  {
    id: 'ai-tools',
    title: 'AI-assisted tooling',
    claim: 'AI is used where it measurably speeds up the work.',
    evidence:
      'Applied to creative variant generation, ad copy drafting, and anomaly detection in reporting. Media buying decisions and strategy remain human-reviewed.',
    icon: Cpu,
    verificationStatus: 'verified',
  },
  {
    id: 'transparency',
    title: 'Full transparency',
    claim: 'You own the accounts and can see the numbers directly.',
    evidence:
      'Work happens inside your ad accounts and CRM under delegated access. Dashboards read from source platforms, and access stays with you if the engagement ends.',
    icon: Eye,
    verificationStatus: 'verified',
  },
  {
    id: 'partnership',
    title: 'Long-term partnership',
    claim: 'Engagements are structured to continue on results, not on lock-in.',
    evidence:
      'Plans are month-to-month with a defined notice period, and each cycle closes with a written review so continuing is an evidence-based decision.',
    icon: Handshake,
    verificationStatus: 'pending',
  },
]
