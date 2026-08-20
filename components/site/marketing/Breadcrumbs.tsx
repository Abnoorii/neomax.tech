import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type Crumb = { name: string; path: string }

export function Breadcrumbs({
  crumbs,
  className,
  tone = 'dark',
}: {
  crumbs: Crumb[]
  className?: string
  tone?: 'light' | 'dark'
}) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={crumb.path} className="flex items-center gap-1.5">
              {index > 0 ? (
                <ChevronRight
                  aria-hidden="true"
                  className={cn('h-3.5 w-3.5', tone === 'dark' ? 'text-white/30' : 'text-slate')}
                />
              ) : null}
              {isLast ? (
                <span
                  aria-current="page"
                  className={cn(
                    'text-body-sm',
                    tone === 'dark' ? 'text-white/80' : 'text-navy',
                  )}
                >
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className={cn(
                    'text-body-sm transition-colors duration-fast',
                    tone === 'dark'
                      ? 'text-muted-dark hover:text-white'
                      : 'text-slate hover:text-navy',
                  )}
                >
                  {crumb.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
