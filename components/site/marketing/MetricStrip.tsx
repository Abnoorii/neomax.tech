import { companyMetrics, formatMetric } from '@/content/metrics'
import { publishable, showsUnverified } from '@/content/verification'
import { Container } from '@/components/site/layout/Container'
import { UnverifiedNotice } from '@/components/site/ui/UnverifiedNotice'

/**
 * Credibility strip.
 *
 * The source draft's figures were malformed (`-518+`, `$-216M+`, `0+`), so none
 * were reused. What renders here are placeholders under a visible notice, and
 * in verified-only mode the whole band removes itself rather than showing
 * numbers nobody has stood behind.
 */
export function MetricStrip() {
  const metrics = publishable(companyMetrics).filter(metric => metric.value !== null)
  if (metrics.length === 0) return null

  return (
    <section aria-labelledby="metrics-heading" className="border-y border-white/10 bg-ink text-white neomax-dark">
      <Container className="py-section-sm">
        <h2 id="metrics-heading" className="sr-only">
          Company figures
        </h2>

        <dl className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
          {metrics.map(metric => (
            <div key={metric.id}>
              <dd className="tabular font-display text-metric-sm text-white">
                {formatMetric(metric)}
              </dd>
              <dt className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-muted-dark">
                {metric.label}
              </dt>
            </div>
          ))}
        </dl>

        {showsUnverified ? (
          <UnverifiedNotice tone="dark" className="mt-10">
            These figures are illustrative placeholders pending verification. They are
            not audited results and should not be relied on. Replace them in{' '}
            <code className="font-mono text-[0.8125rem]">content/metrics.ts</code> and
            mark them verified to publish.
          </UnverifiedNotice>
        ) : null}
      </Container>
    </section>
  )
}
