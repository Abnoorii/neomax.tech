import { Container } from '@/components/site/layout/Container'
import { Eyebrow } from '@/components/site/ui/Eyebrow'
import { Breadcrumbs, type Crumb } from '@/components/site/marketing/Breadcrumbs'

/**
 * Inner-page hero. Shares the homepage hero's dark ground and top spacing so
 * the fixed header sits on the same surface on every route.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  crumbs,
  meta,
  aside,
}: {
  eyebrow: string
  title: string
  lead?: string
  crumbs?: Crumb[]
  meta?: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <section className="bg-ink text-white neomax-dark">
      <Container className="pb-section-sm pt-[calc(72px+clamp(2.5rem,1.5rem+3vw,4.5rem))]">
        {crumbs ? <Breadcrumbs crumbs={crumbs} className="mb-8" /> : null}

        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-12">
          <div className={aside ? 'lg:col-span-7' : 'lg:col-span-9'}>
            <Eyebrow tone="dark">{eyebrow}</Eyebrow>
            <h1 className="mt-5 font-display text-display-lg text-balance text-white">{title}</h1>
            {lead ? (
              <p className="mt-6 max-w-measure text-body-lg text-muted-dark">{lead}</p>
            ) : null}
            {meta ? <div className="mt-8">{meta}</div> : null}
          </div>
          {aside ? <div className="lg:col-span-5">{aside}</div> : null}
        </div>
      </Container>
    </section>
  )
}
